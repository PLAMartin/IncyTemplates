/**
 * Domain types mirroring the Supabase schema (spec §14) for the subset used
 * by the public catalogue this phase. Field names follow the DB's
 * snake_case columns directly (no relabeling) so the Supabase and fixture
 * data sources can share one shape without a mapping layer.
 */

export type ProductType = "template" | "bundle";
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
};

export type Guide = GuideFrontmatter & {
  readingTimeMinutes: number;
  content: string;
};
