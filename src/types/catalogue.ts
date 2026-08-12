/**
 * Domain types mirroring the Supabase schema (spec §14) for the subset used
 * by the public catalogue this phase. Field names follow the DB's
 * snake_case columns directly (no relabeling) so the Supabase and fixture
 * data sources can share one shape without a mapping layer.
 */

export type ProductType = "guide" | "template" | "tool" | "bundle";
export type FrameworkStatus = "candidate" | "draft" | "approved" | "published" | "archived";
export type AccessType = "free" | "paid";
export type ProductStatus = "draft" | "scheduled" | "published" | "unlisted" | "archived";
export type FileRole =
  | "template"
  | "example"
  | "instructions"
  | "facilitator_guide"
  | "preview"
  | "cover"
  | "bonus";
export type FileFormat =
  | "pdf"
  | "docx"
  | "xlsx"
  | "pptx"
  | "markdown"
  | "notion"
  | "miro"
  | "google_docs"
  | "google_sheets"
  | "zip"
  | "png"
  | "jpg"
  | "webp"
  | "other";

export type QualityStandard = Partial<{
  purpose: boolean;
  inputs: boolean;
  instructions: boolean;
  completedExample: boolean;
  thinkingPrompts: boolean;
  evidenceFields: boolean;
  decisionOutcome: boolean;
  nextStep: boolean;
  reviewDate: boolean;
  aiAgentEdition: boolean;
  facilitatorEdition: boolean;
}>;

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
};

export type Stage = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
};

/**
 * A reusable method/problem/outcome above individual Guide/Template/Tool outputs
 * (spec v3 §14.3), e.g. "Product Idea Assessor". Full detail — only ever returned for
 * `status: "published"` frameworks (see `FrameworkTeaser` for the draft-safe subset).
 */
export type Framework = {
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
  journey_stage: Pick<Stage, "slug" | "name"> | null;
  priority_score: number | null;
  priority_rationale: string | null;
  source_strength: string | null;
  source_note: string | null;
  flagship: boolean;
  display_order: number;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  /**
   * Slug of the recommended next-step framework, if any (spec §14.11's `next_step`
   * relationship type). Deliberately a single direct field rather than a generic
   * `it_product_relationships`-backed list this milestone — there is exactly one
   * framework-to-framework link to express (Product Idea Assessor -> Customer
   * Discovery Kit) and building the generic many-to-many relationship plumbing for
   * one link isn't proportionate yet. Revisit once more families are published.
   */
  next_step_framework_slug: string | null;
};

/**
 * A published visual asset's public-safe projection plus its responsive delivery variants
 * (spec v5 §14.13's `it_visual_assets_public`/`it_visual_asset_variants`). Never carries
 * `prompt_snapshot`/`provider_*`/`generation_metadata` — those stay admin-only regardless of
 * publish status, see `docs/decisions/0045-visual-asset-system-foundation.md`.
 */
export type FrameworkVisualVariant = {
  variantKey: string;
  url: string;
  width: number;
  height: number;
  format: string;
};

export type FrameworkVisual = {
  id: string;
  assetType: "family_card" | "family_hero" | "guide_diagram" | "template_preview" | "tool_preview" | "social_og";
  altText: string | null;
  decorative: boolean;
  variants: FrameworkVisualVariant[];
};

/**
 * Narrow, editorially-safe projection of a framework used for public "Coming soon" cards
 * on listing surfaces (homepage, /products, /journey/*). Covers published frameworks and
 * draft-but-flagship frameworks only — see `it_frameworks_teasers` (Supabase view) and
 * `docs/decisions` for why this exists as a distinct, narrower type rather than reusing
 * `Framework` with optional fields: it must be structurally impossible to accidentally
 * render `problem_statement`/`method_summary`/`priority_rationale` for an unpublished
 * family on a public page.
 */
export type FrameworkTeaser = {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  outcome_statement: string;
  status: FrameworkStatus;
  journey_stage: Pick<Stage, "slug" | "name"> | null;
};

export type Licence = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  commercial_use_allowed: boolean;
  client_work_allowed: boolean;
  redistribution_allowed: boolean;
};

export type ProductFile = {
  id: string;
  file_role: FileRole;
  file_format: FileFormat;
  display_name: string;
  is_public_preview: boolean;
};

export type ProductSummary = {
  id: string;
  product_type: ProductType;
  access_type: AccessType;
  status: ProductStatus;
  name: string;
  slug: string;
  short_description: string;
  outcome_statement: string | null;
  completion_minutes_min: number | null;
  completion_minutes_max: number | null;
  skill_level: string | null;
  price_minor: number | null;
  compare_at_price_minor: number | null;
  currency_code: string;
  featured: boolean;
  published_at: string | null;
  scheduled_for: string | null;
  categories: Pick<Category, "slug" | "name">[];
  stages: Pick<Stage, "slug" | "name">[];
  formats: FileFormat[];
  is_placeholder: boolean;
  /** Framework this output belongs to, if any (spec v3 §14.7). Null for standalone bundles. */
  framework_id: string | null;
  /**
   * Stable registry key for `product_type: "tool"` rows (spec v3 §12.3) — a pointer into
   * `src/lib/tools/registry.ts`, never executable code from the database. Null for every
   * other product type.
   */
  tool_key: string | null;
};

export type Product = ProductSummary & {
  full_description: string | null;
  target_audience: string | null;
  when_to_use: string | null;
  when_not_to_use: string | null;
  current_version: string | null;
  licence: Licence | null;
  quality_standard: QualityStandard;
  files: ProductFile[];
  seo_title: string | null;
  seo_description: string | null;
};

export type BundleItem = {
  product: ProductSummary;
  is_required: boolean;
  display_order: number;
};

export type Bundle = Product & {
  product_type: "bundle";
  bundle_items: BundleItem[];
};

export type CatalogueFilters = {
  q?: string;
  access?: AccessType;
  category?: string;
  stage?: string;
  format?: FileFormat;
  type?: ProductType;
  sort?: "recommended" | "newest" | "popular" | "price-asc" | "price-desc";
  page?: number;
};

export type CatalogueResult = {
  items: ProductSummary[];
  total: number;
  page: number;
  pageSize: number;
};

export type GuideFrontmatter = {
  title: string;
  slug: string;
  summary: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  status: "draft" | "published";
  seoTitle?: string;
  seoDescription?: string;
  relatedProducts?: string[];
  /**
   * Spec v3 §23.4 (called `frameworkId` there, but stored here as the framework's stable
   * `slug` rather than its DB id — the id is a real uuid generated at seed time, which a
   * hand-authored MDX file has no way to know or keep in sync; the slug is stable,
   * human-authored, and works identically against fixtures or Supabase). Optional this
   * pass — not every existing guide has a framework yet.
   */
  frameworkSlug?: string;
};

export type Guide = GuideFrontmatter & {
  readingTimeMinutes: number;
  content: string;
};
