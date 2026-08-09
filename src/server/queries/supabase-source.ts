/**
 * Supabase-backed implementation of `CatalogueSource`.
 *
 * IMPORTANT: this file is written against the documented schema in spec §14
 * plus the additions listed in the build plan (the `it_products.licence_id`
 * FK, the generated `search_vector` tsvector column, and the new
 * `it_waitlist_signups` table) — see
 * `supabase/migrations/20260728155511_products_categories_stages.sql` and
 * neighbouring migration files, authored by a sibling task against the same
 * spec. It has **not** been integration-tested against a live database: no
 * Supabase project was linked at the time this was written. Anything here
 * that depends on exact Supabase embedded-select/relationship syntax (which
 * can depend on how PostgREST infers foreign-key relationships) is flagged
 * with `// TODO(verify-against-live-schema):` rather than silently assumed
 * correct. Run the app with `CONTENT_SOURCE=supabase` against a real
 * project and fix any flagged spots before relying on this path.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAnonClient } from "@/lib/supabase/anon-client";
import type {
  Bundle,
  BundleItem,
  CatalogueFilters,
  CatalogueResult,
  Category,
  FileFormat,
  Framework,
  FrameworkStatus,
  FrameworkTeaser,
  Licence,
  Product,
  ProductFile,
  ProductSummary,
  Stage,
} from "@/types/catalogue";
import type { CatalogueSource } from "./types";

/** Display order for framework-outputs cards (spec §8.4: Guide, Template, Tool, then Bundle). */
const OUTPUT_TYPE_ORDER: Record<ProductSummary["product_type"], number> = {
  guide: 0,
  template: 1,
  tool: 2,
  bundle: 3,
};

const DEFAULT_PAGE_SIZE = 12;

// ---------------------------------------------------------------------------
// Row shapes (subset of columns actually used) and mappers
// ---------------------------------------------------------------------------

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
};

type StageRow = CategoryRow;

type LicenceRow = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  commercial_use_allowed: boolean;
  client_work_allowed: boolean;
  redistribution_allowed: boolean;
};

// TODO(verify-against-live-schema): the exact shape of nested rows returned
// for embedded foreign-table selects depends on how PostgREST names the
// relationship (typically the target table name, or an alias given in the
// select string). The field names below (`it_product_categories`,
// `it_product_stages`, `it_product_versions`) assume the default
// unaliased relationship name equals the table name, which is PostgREST's
// default when there is exactly one FK path between two tables. Re-check
// against the actual response shape once a project is linked.
type ProductRow = {
  id: string;
  product_type: "guide" | "template" | "tool" | "bundle";
  access_type: "free" | "paid";
  status: "draft" | "scheduled" | "published" | "unlisted" | "archived";
  name: string;
  slug: string;
  short_description: string;
  full_description: string | null;
  outcome_statement: string | null;
  target_audience: string | null;
  when_to_use: string | null;
  when_not_to_use: string | null;
  completion_minutes_min: number | null;
  completion_minutes_max: number | null;
  skill_level: string | null;
  current_version: string | null;
  price_minor: number | null;
  compare_at_price_minor: number | null;
  currency_code: string;
  featured: boolean;
  published_at: string | null;
  scheduled_for: string | null;
  seo_title: string | null;
  seo_description: string | null;
  schema_data: Record<string, unknown> | null;
  framework_id: string | null;
  tool_key: string | null;
  licence: LicenceRow | null;
  it_product_categories?: { category: CategoryRow | null }[] | null;
  it_product_stages?: { stage: StageRow | null }[] | null;
  it_product_versions?: {
    is_current: boolean;
    it_files?: { id: string; file_role: string; file_format: string; display_name: string; is_public_preview: boolean }[] | null;
  }[] | null;
};

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    display_order: row.display_order,
  };
}

function mapStage(row: StageRow): Stage {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    display_order: row.display_order,
  };
}

function mapLicence(row: LicenceRow): Licence {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    summary: row.summary,
    commercial_use_allowed: row.commercial_use_allowed,
    client_work_allowed: row.client_work_allowed,
    redistribution_allowed: row.redistribution_allowed,
  };
}

function currentVersionFiles(row: ProductRow): ProductFile[] {
  const current = row.it_product_versions?.find((v) => v.is_current);
  const files = current?.it_files ?? [];
  return files.map((f) => ({
    id: f.id,
    file_role: f.file_role as ProductFile["file_role"],
    file_format: f.file_format as FileFormat,
    display_name: f.display_name,
    is_public_preview: f.is_public_preview,
  }));
}

function mapProduct(row: ProductRow): Product {
  const categories = (row.it_product_categories ?? [])
    .map((pc) => pc.category)
    .filter((c): c is CategoryRow => Boolean(c))
    .map((c) => ({ slug: c.slug, name: c.name }));
  const stages = (row.it_product_stages ?? [])
    .map((ps) => ps.stage)
    .filter((s): s is StageRow => Boolean(s))
    .map((s) => ({ slug: s.slug, name: s.name }));
  const files = currentVersionFiles(row);
  const formats = Array.from(new Set(files.map((f) => f.file_format)));

  // schema_data->>'placeholder' maps to is_placeholder (documented addition,
  // not in the base spec §14 columns).
  const is_placeholder = row.schema_data?.["placeholder"] === true;

  return {
    id: row.id,
    product_type: row.product_type,
    access_type: row.access_type,
    status: row.status,
    name: row.name,
    slug: row.slug,
    short_description: row.short_description,
    full_description: row.full_description,
    outcome_statement: row.outcome_statement,
    target_audience: row.target_audience,
    when_to_use: row.when_to_use,
    when_not_to_use: row.when_not_to_use,
    completion_minutes_min: row.completion_minutes_min,
    completion_minutes_max: row.completion_minutes_max,
    skill_level: row.skill_level,
    current_version: row.current_version,
    price_minor: row.price_minor,
    compare_at_price_minor: row.compare_at_price_minor,
    currency_code: row.currency_code,
    featured: row.featured,
    published_at: row.published_at,
    scheduled_for: row.scheduled_for,
    categories,
    stages,
    formats,
    is_placeholder,
    framework_id: row.framework_id,
    tool_key: row.tool_key,
    licence: row.licence ? mapLicence(row.licence) : null,
    // TODO(verify-against-live-schema): quality_standard isn't selected in
    // PRODUCT_SELECT below yet — add `quality_standard` to the select list
    // and parse it here (it's already jsonb, so it should come back typed)
    // once a live project confirms the column reads back as expected.
    quality_standard: {},
    files,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
  };
}

function toSummary(product: Product): ProductSummary {
  const {
    id, product_type, access_type, status, name, slug, short_description, outcome_statement,
    completion_minutes_min, completion_minutes_max, skill_level, price_minor,
    compare_at_price_minor, currency_code, featured, published_at, scheduled_for,
    categories, stages, formats, is_placeholder, framework_id, tool_key,
  } = product;
  return {
    id, product_type, access_type, status, name, slug, short_description, outcome_statement,
    completion_minutes_min, completion_minutes_max, skill_level, price_minor,
    compare_at_price_minor, currency_code, featured, published_at, scheduled_for,
    categories, stages, formats, is_placeholder, framework_id, tool_key,
  };
}

// TODO(verify-against-live-schema): confirm the embedded relationship alias
// names against a live project (`supabase gen types typescript` is the
// reliable way to check). `licence:it_licences(...)` uses an explicit alias
// because the FK column is `licence_id`, which PostgREST should resolve
// automatically, but the embed name PostgREST expects can differ from what's
// written here.
const PRODUCT_SELECT = `
  id, product_type, access_type, status, name, slug, short_description, full_description,
  outcome_statement, target_audience, when_to_use, when_not_to_use,
  completion_minutes_min, completion_minutes_max, skill_level, current_version,
  price_minor, compare_at_price_minor, currency_code, featured, published_at, scheduled_for,
  seo_title, seo_description, schema_data, framework_id, tool_key,
  licence:it_licences ( id, name, slug, summary, commercial_use_allowed, client_work_allowed, redistribution_allowed ),
  it_product_categories ( category:it_categories ( id, name, slug, description, display_order ) ),
  it_product_stages ( stage:it_stages ( id, name, slug, description, display_order ) ),
  it_product_versions ( is_current, it_files ( id, file_role, file_format, display_name, is_public_preview ) )
`;

// TODO(verify-against-live-schema): confirm the embed alias for journey_stage
// (`journey_stage:it_stages(...)`) resolves against the `journey_stage_id` FK the same way
// `licence:it_licences(...)` does above.
type FrameworkRow = {
  id: string;
  status: FrameworkStatus;
  name: string;
  slug: string;
  short_description: string;
  problem_statement: string | null;
  outcome_statement: string;
  target_audience: string | null;
  when_to_use: string | null;
  when_not_to_use: string | null;
  method_summary: string | null;
  priority_score: number | null;
  priority_rationale: string | null;
  source_strength: string | null;
  source_note: string | null;
  flagship: boolean;
  display_order: number;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  journey_stage: StageRow | null;
  next_step: { slug: string } | null;
};

// TODO(verify-against-live-schema): the self-referencing FK embed alias below
// (`next_step:it_frameworks!next_step_framework_id(...)`) follows the same
// `!constraint_or_column_hint` pattern used for it_bundle_items' two-FK embed elsewhere in
// this file — PostgREST needs the hint to disambiguate a self-join, and the exact accepted
// hint syntax (`next_step_framework_id` vs a generated constraint name) hasn't been
// confirmed against a live project.
const FRAMEWORK_SELECT = `
  id, status, name, slug, short_description, problem_statement, outcome_statement,
  target_audience, when_to_use, when_not_to_use, method_summary,
  priority_score, priority_rationale, source_strength, source_note, flagship, display_order,
  seo_title, seo_description, published_at,
  journey_stage:it_stages ( id, name, slug, description, display_order ),
  next_step:it_frameworks!next_step_framework_id ( slug )
`;

function mapFramework(row: FrameworkRow): Framework {
  return {
    id: row.id,
    status: row.status,
    name: row.name,
    slug: row.slug,
    short_description: row.short_description,
    problem_statement: row.problem_statement,
    outcome_statement: row.outcome_statement,
    target_audience: row.target_audience,
    when_to_use: row.when_to_use,
    when_not_to_use: row.when_not_to_use,
    method_summary: row.method_summary,
    journey_stage: row.journey_stage ? { slug: row.journey_stage.slug, name: row.journey_stage.name } : null,
    priority_score: row.priority_score,
    priority_rationale: row.priority_rationale,
    source_strength: row.source_strength,
    source_note: row.source_note,
    flagship: row.flagship,
    display_order: row.display_order,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    published_at: row.published_at,
    next_step_framework_slug: row.next_step?.slug ?? null,
  };
}

export class SupabaseCatalogueSource implements CatalogueSource {
  private client: SupabaseClient;

  constructor() {
    this.client = getSupabaseAnonClient();
  }

  async getCategories(): Promise<Category[]> {
    const { data, error } = await this.client
      .from("it_categories")
      .select("id, name, slug, description, display_order")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data as CategoryRow[]).map(mapCategory);
  }

  async getStages(): Promise<Stage[]> {
    const { data, error } = await this.client
      .from("it_stages")
      .select("id, name, slug, description, display_order")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data as StageRow[]).map(mapStage);
  }

  async getFeaturedFreeProducts(limit = 3): Promise<Product[]> {
    // Scoped to product_type "template" — this powers the "Featured free templates"
    // sections (homepage, /templates/free); guide/tool rows have their own dedicated
    // homepage/index sections and shouldn't appear here too.
    const { data, error } = await this.client
      .from("it_products")
      .select(PRODUCT_SELECT)
      .eq("status", "published")
      .eq("access_type", "free")
      .eq("product_type", "template")
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data as unknown as ProductRow[]).map(mapProduct);
  }

  async getFeaturedBundle(): Promise<Bundle | null> {
    const { data, error } = await this.client
      .from("it_products")
      .select(PRODUCT_SELECT)
      .eq("status", "published")
      .eq("product_type", "bundle")
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const product = mapProduct(data as unknown as ProductRow);
    const bundle_items = await this.getBundleItems(product.id);
    return { ...product, product_type: "bundle", bundle_items };
  }

  private async getBundleItems(bundleProductId: string): Promise<BundleItem[]> {
    // TODO(verify-against-live-schema): confirm the embed alias for the
    // included product (`included:it_products(...)`) resolves correctly —
    // it_bundle_items has two FKs into it_products (bundle_product_id and
    // included_product_id), so PostgREST needs the explicit FK hint
    // (`!it_bundle_items_included_product_id_fkey` or similar) to disambiguate
    // which relationship to embed. The constraint name below is a guess
    // based on Postgres's default naming convention and has not been
    // confirmed against the actual migration-generated constraint name.
    const { data, error } = await this.client
      .from("it_bundle_items")
      .select(
        `display_order, is_required, included:it_products!it_bundle_items_included_product_id_fkey ( ${PRODUCT_SELECT} )`,
      )
      .eq("bundle_product_id", bundleProductId)
      .order("display_order", { ascending: true });
    if (error) throw error;

    type BundleItemRow = { display_order: number; is_required: boolean; included: ProductRow | null };
    return (data as unknown as BundleItemRow[])
      .filter((row) => row.included)
      .map((row) => ({
        product: toSummary(mapProduct(row.included as ProductRow)),
        is_required: row.is_required,
        display_order: row.display_order,
      }));
  }

  async searchCatalogue(filters: CatalogueFilters): Promise<CatalogueResult> {
    const pageSize = DEFAULT_PAGE_SIZE;
    const page = Math.max(1, filters.page ?? 1);
    const start = (page - 1) * pageSize;

    let query = this.client
      .from("it_products")
      .select(PRODUCT_SELECT, { count: "exact" })
      .eq("status", "published");

    if (filters.access) query = query.eq("access_type", filters.access);
    if (filters.type) {
      query = query.eq("product_type", filters.type);
    } else {
      // Default scope is template + bundle (this method backs /templates and its
      // sub-pages) — guide/tool rows only appear when a caller explicitly asks for that
      // type (e.g. /tools/page.tsx passing `type: "tool"`), never by default.
      query = query.in("product_type", ["template", "bundle"]);
    }

    if (filters.category) {
      const productIds = await this.productIdsForCategory(filters.category);
      query = query.in("id", productIds.length > 0 ? productIds : ["00000000-0000-0000-0000-000000000000"]);
    }
    if (filters.stage) {
      const productIds = await this.productIdsForStage(filters.stage);
      query = query.in("id", productIds.length > 0 ? productIds : ["00000000-0000-0000-0000-000000000000"]);
    }

    if (filters.q && filters.q.trim()) {
      // Spec §21.1: PostgreSQL full-text search over the generated
      // search_vector column (weighted per §21.2 in the migration itself).
      // TODO(verify-against-live-schema): confirm `websearch` config works
      // as expected with the `english` text-search configuration used by
      // the generated column.
      query = query.textSearch("search_vector", filters.q, { type: "websearch", config: "english" });
    } else {
      switch (filters.sort) {
        case "newest":
          query = query.order("published_at", { ascending: false });
          break;
        case "price-asc":
          query = query.order("price_minor", { ascending: true, nullsFirst: true });
          break;
        case "price-desc":
          query = query.order("price_minor", { ascending: false, nullsFirst: false });
          break;
        case "popular":
        case "recommended":
        default:
          // TODO(verify-against-live-schema): "popular" has no real metric
          // to sort by yet (no download/view analytics table exists this
          // phase) — falls back to the same ordering as "recommended",
          // matching FixtureCatalogueSource's documented behaviour.
          query = query.order("featured", { ascending: false }).order("published_at", { ascending: false });
      }
    }

    query = query.range(start, start + pageSize - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    let items = (data as unknown as ProductRow[]).map((row) => toSummary(mapProduct(row)));
    if (filters.format) {
      items = items.filter((item) => item.formats.includes(filters.format!));
    }

    return { items, total: count ?? items.length, page, pageSize };
  }

  private async productIdsForCategory(categorySlug: string): Promise<string[]> {
    const { data, error } = await this.client
      .from("it_product_categories")
      .select("product_id, category:it_categories!inner(slug)")
      .eq("category.slug", categorySlug);
    if (error) throw error;
    return (data as unknown as { product_id: string }[]).map((r) => r.product_id);
  }

  private async productIdsForStage(stageSlug: string): Promise<string[]> {
    const { data, error } = await this.client
      .from("it_product_stages")
      .select("product_id, stage:it_stages!inner(slug)")
      .eq("stage.slug", stageSlug);
    if (error) throw error;
    return (data as unknown as { product_id: string }[]).map((r) => r.product_id);
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await this.client
      .from("it_products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .eq("status", "published")
      .eq("product_type", "template")
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return mapProduct(data as unknown as ProductRow);
  }

  async getBundleBySlug(slug: string): Promise<Bundle | null> {
    const { data, error } = await this.client
      .from("it_products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .eq("status", "published")
      .eq("product_type", "bundle")
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const product = mapProduct(data as unknown as ProductRow);
    const bundle_items = await this.getBundleItems(product.id);
    return { ...product, product_type: "bundle", bundle_items };
  }

  async getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
    // TODO(verify-against-live-schema): spec §14.3's it_product_relationships
    // table is the "correct" source for curated related-product links, but
    // nothing populates it this phase (no admin UI exists yet). This falls
    // back to the same category/stage-overlap heuristic FixtureCatalogueSource
    // uses, which is simple enough to not need a live-schema check itself —
    // flagged here only because it's a knowingly incomplete substitute for
    // the richer relationship table the spec describes.
    const { data: sourceRows, error: sourceError } = await this.client
      .from("it_products")
      .select(
        "id, it_product_categories(category_id), it_product_stages(stage_id)",
      )
      .eq("id", productId)
      .maybeSingle();
    if (sourceError) throw sourceError;
    if (!sourceRows) return [];

    type SourceRow = { it_product_categories: { category_id: string }[]; it_product_stages: { stage_id: string }[] };
    const source = sourceRows as unknown as SourceRow;
    const categoryIds = source.it_product_categories?.map((c) => c.category_id) ?? [];
    const stageIds = source.it_product_stages?.map((s) => s.stage_id) ?? [];

    if (categoryIds.length === 0 && stageIds.length === 0) return [];

    const relatedIds = new Set<string>();
    if (categoryIds.length > 0) {
      const { data, error } = await this.client
        .from("it_product_categories")
        .select("product_id")
        .in("category_id", categoryIds)
        .neq("product_id", productId);
      if (error) throw error;
      for (const row of data as { product_id: string }[]) relatedIds.add(row.product_id);
    }
    if (stageIds.length > 0) {
      const { data, error } = await this.client
        .from("it_product_stages")
        .select("product_id")
        .in("stage_id", stageIds)
        .neq("product_id", productId);
      if (error) throw error;
      for (const row of data as { product_id: string }[]) relatedIds.add(row.product_id);
    }
    if (relatedIds.size === 0) return [];

    const { data, error } = await this.client
      .from("it_products")
      .select(PRODUCT_SELECT)
      .in("id", Array.from(relatedIds))
      .eq("status", "published")
      .limit(limit);
    if (error) throw error;
    return (data as unknown as ProductRow[]).map(mapProduct);
  }

  // --- v3: framework/product-family layer --------------------------------

  async getFrameworks(opts?: { journeyStage?: string }): Promise<Framework[]> {
    let query = this.client
      .from("it_frameworks")
      .select(FRAMEWORK_SELECT)
      .eq("status", "published")
      .order("display_order", { ascending: true });
    if (opts?.journeyStage) {
      // TODO(verify-against-live-schema): filtering on an embedded relationship's column
      // via dot notation (`journey_stage.slug`) requires the `!inner` join hint to work as
      // a genuine filter rather than just shaping the embed — confirm against a live project.
      query = query.eq("journey_stage.slug", opts.journeyStage);
    }
    const { data, error } = await query;
    if (error) throw error;
    let frameworks = (data as unknown as FrameworkRow[]).map(mapFramework);
    if (opts?.journeyStage) {
      // Defensive re-filter in case the embedded-relationship filter above only shapes the
      // embed rather than restricting rows (see TODO above) — cheap, and correct either way.
      frameworks = frameworks.filter((f) => f.journey_stage?.slug === opts.journeyStage);
    }
    return frameworks;
  }

  async getFrameworkTeasers(): Promise<FrameworkTeaser[]> {
    const { data, error } = await this.client
      .from("it_frameworks_teasers")
      .select("id, name, slug, short_description, outcome_statement, status, journey_stage_slug, journey_stage_name, display_order")
      .order("display_order", { ascending: true });
    if (error) throw error;
    type TeaserRow = {
      id: string;
      name: string;
      slug: string;
      short_description: string;
      outcome_statement: string;
      status: FrameworkStatus;
      journey_stage_slug: string | null;
      journey_stage_name: string | null;
    };
    return (data as unknown as TeaserRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      short_description: row.short_description,
      outcome_statement: row.outcome_statement,
      status: row.status,
      journey_stage: row.journey_stage_slug ? { slug: row.journey_stage_slug, name: row.journey_stage_name! } : null,
    }));
  }

  async getFrameworkBySlug(slug: string): Promise<Framework | null> {
    const { data, error } = await this.client
      .from("it_frameworks")
      .select(FRAMEWORK_SELECT)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return mapFramework(data as unknown as FrameworkRow);
  }

  async getFrameworkById(id: string): Promise<Framework | null> {
    const { data, error } = await this.client
      .from("it_frameworks")
      .select(FRAMEWORK_SELECT)
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return mapFramework(data as unknown as FrameworkRow);
  }

  async getFrameworkOutputs(frameworkId: string): Promise<ProductSummary[]> {
    const { data, error } = await this.client
      .from("it_products")
      .select(PRODUCT_SELECT)
      .eq("framework_id", frameworkId)
      .eq("status", "published");
    if (error) throw error;
    const outputs = (data as unknown as ProductRow[]).map((row) => toSummary(mapProduct(row)));
    return outputs.sort((a, b) => OUTPUT_TYPE_ORDER[a.product_type] - OUTPUT_TYPE_ORDER[b.product_type]);
  }

  async getProductByToolKey(toolKey: string): Promise<Product | null> {
    const { data, error } = await this.client
      .from("it_products")
      .select(PRODUCT_SELECT)
      .eq("tool_key", toolKey)
      .eq("status", "published")
      .eq("product_type", "tool")
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return mapProduct(data as unknown as ProductRow);
  }
}
