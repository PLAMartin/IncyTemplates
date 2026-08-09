import catalogue, { toSummary } from "../../../content/seed/catalogue";
import { rankProducts } from "@/lib/search/rank";
import type {
  Bundle,
  CatalogueFilters,
  CatalogueResult,
  Category,
  Framework,
  FrameworkTeaser,
  Product,
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

/**
 * Fixture-backed implementation of `CatalogueSource`, reading from
 * `content/seed/catalogue.ts`. This is the data source used whenever no
 * Supabase project is configured (see `index.ts`) — including in CI and any
 * local dev without cloud credentials.
 *
 * Every public method here filters to `status === 'published'` before
 * returning anything. There's no RLS to lean on for this fixture path, so
 * this filtering *is* the visibility rule this phase — draft/scheduled/
 * unlisted/archived products must never reach a public page through this
 * class, matching what `SupabaseCatalogueSource`'s public-read RLS policies
 * enforce for real once a live project exists.
 */
export class FixtureCatalogueSource implements CatalogueSource {
  private publishedProducts(): Product[] {
    return catalogue.products.filter((p) => p.status === "published");
  }

  private publishedBundles(): Bundle[] {
    return catalogue.bundles.filter((b) => b.status === "published");
  }

  /** Every published template + bundle, as ProductSummary, for catalogue-wide search/browse. */
  private publishedCatalogueSummaries(): ProductSummary[] {
    return [...this.publishedProducts(), ...this.publishedBundles()].map(toSummary);
  }

  async getCategories(): Promise<Category[]> {
    return [...catalogue.categories].sort((a, b) => a.display_order - b.display_order);
  }

  async getStages(): Promise<Stage[]> {
    return [...catalogue.stages].sort((a, b) => a.display_order - b.display_order);
  }

  async getFeaturedFreeProducts(limit = 3): Promise<Product[]> {
    // Scoped to product_type "template" — this powers the "Featured free templates"
    // sections (homepage, /templates/free), which now share `catalogue.products` with
    // guide/tool rows since v3; those have their own dedicated homepage/index sections.
    const free = this.publishedProducts().filter((p) => p.access_type === "free" && p.product_type === "template");
    const featured = free.filter((p) => p.featured);
    const rest = free.filter((p) => !p.featured);
    return [...featured, ...rest].slice(0, limit);
  }

  async getFeaturedBundle(): Promise<Bundle | null> {
    const bundles = this.publishedBundles();
    if (bundles.length === 0) return null;
    return bundles.find((b) => b.featured) ?? bundles[0] ?? null;
  }

  async searchCatalogue(filters: CatalogueFilters): Promise<CatalogueResult> {
    let items = this.publishedCatalogueSummaries();

    // Default scope is template + bundle (this method backs /templates and its sub-pages,
    // whose pre-v3 behaviour this preserves) — guide/tool rows only appear when a caller
    // explicitly asks for that type (e.g. /tools/page.tsx passing `type: "tool"`), never by
    // default alongside templates.
    if (!filters.type) {
      items = items.filter((p) => p.product_type === "template" || p.product_type === "bundle");
    }

    if (filters.access) {
      items = items.filter((p) => p.access_type === filters.access);
    }
    if (filters.category) {
      items = items.filter((p) => p.categories.some((c) => c.slug === filters.category));
    }
    if (filters.stage) {
      items = items.filter((p) => p.stages.some((s) => s.slug === filters.stage));
    }
    if (filters.format) {
      items = items.filter((p) => p.formats.includes(filters.format!));
    }
    if (filters.type) {
      items = items.filter((p) => p.product_type === filters.type);
    }

    if (filters.q && filters.q.trim()) {
      items = rankProducts(items, filters.q).map((ranked) => ranked.product);
    } else {
      items = sortItems(items, filters.sort);
    }

    const total = items.length;
    const pageSize = DEFAULT_PAGE_SIZE;
    const page = Math.max(1, filters.page ?? 1);
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);

    return { items: paged, total, page, pageSize };
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    // Scoped to product_type "template" to match SupabaseCatalogueSource and the
    // /templates/[slug] page's assumptions (download/view flow, template-specific
    // fields) — matches the v2 behaviour this method always had, made explicit now that
    // guide/tool rows exist alongside templates in `catalogue.products`.
    const product = catalogue.products.find(
      (p) => p.slug === slug && p.status === "published" && p.product_type === "template",
    );
    return product ?? null;
  }

  async getBundleBySlug(slug: string): Promise<Bundle | null> {
    const bundle = catalogue.bundles.find((b) => b.slug === slug && b.status === "published");
    return bundle ?? null;
  }

  async getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
    const source = catalogue.products.find((p) => p.id === productId);
    if (!source) return [];

    const categorySlugs = new Set(source.categories.map((c) => c.slug));
    const stageSlugs = new Set(source.stages.map((s) => s.slug));

    const candidates = this.publishedProducts().filter((p) => p.id !== productId);

    const scored = candidates.map((product) => {
      let score = 0;
      if (product.categories.some((c) => categorySlugs.has(c.slug))) score += 2;
      if (product.stages.some((s) => stageSlugs.has(s.slug))) score += 1;
      return { product, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.product);
  }

  // --- v3: framework/product-family layer --------------------------------

  private sortedFrameworks(): Framework[] {
    return [...catalogue.frameworks].sort((a, b) => a.display_order - b.display_order);
  }

  async getFrameworks(opts?: { journeyStage?: string }): Promise<Framework[]> {
    let frameworks = this.sortedFrameworks().filter((f) => f.status === "published");
    if (opts?.journeyStage) {
      frameworks = frameworks.filter((f) => f.journey_stage?.slug === opts.journeyStage);
    }
    return frameworks;
  }

  async getFrameworkTeasers(): Promise<FrameworkTeaser[]> {
    return this.sortedFrameworks()
      .filter((f) => f.status === "published" || (f.status === "draft" && f.flagship))
      .map((f) => ({
        id: f.id,
        name: f.name,
        slug: f.slug,
        short_description: f.short_description,
        outcome_statement: f.outcome_statement,
        status: f.status,
        journey_stage: f.journey_stage,
      }));
  }

  async getFrameworkBySlug(slug: string): Promise<Framework | null> {
    const framework = catalogue.frameworks.find((f) => f.slug === slug && f.status === "published");
    return framework ?? null;
  }

  async getFrameworkById(id: string): Promise<Framework | null> {
    const framework = catalogue.frameworks.find((f) => f.id === id && f.status === "published");
    return framework ?? null;
  }

  async getFrameworkOutputs(frameworkId: string): Promise<ProductSummary[]> {
    const outputs = this.publishedCatalogueSummaries().filter((p) => p.framework_id === frameworkId);
    return outputs.sort((a, b) => OUTPUT_TYPE_ORDER[a.product_type] - OUTPUT_TYPE_ORDER[b.product_type]);
  }

  async getProductByToolKey(toolKey: string): Promise<Product | null> {
    const product = catalogue.products.find(
      (p) => p.tool_key === toolKey && p.status === "published" && p.product_type === "tool",
    );
    return product ?? null;
  }
}

/**
 * Sort helper for non-search browsing (spec §10.2 sort options). "popular"
 * has no real metric to sort by yet this phase (no view/download analytics
 * exist) — it falls back to the same ordering as "recommended" rather than
 * silently returning an unsorted list.
 */
function sortItems(items: ProductSummary[], sort: CatalogueFilters["sort"]): ProductSummary[] {
  const sorted = [...items];
  switch (sort) {
    case "newest":
      return sorted.sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
    case "price-asc":
      return sorted.sort((a, b) => (a.price_minor ?? 0) - (b.price_minor ?? 0));
    case "price-desc":
      return sorted.sort((a, b) => (b.price_minor ?? 0) - (a.price_minor ?? 0));
    case "popular":
    case "recommended":
    default:
      return sorted.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return (b.published_at ?? "").localeCompare(a.published_at ?? "");
      });
  }
}
