import type {
  Bundle,
  CatalogueFilters,
  CatalogueResult,
  Category,
  Framework,
  FrameworkTeaser,
  Guide,
  Product,
  ProductSummary,
  Stage,
} from "@/types/catalogue";

/**
 * Contract shared by the Supabase-backed and fixture-backed data sources
 * (see src/server/queries/index.ts for the selection logic). Every public
 * page reads through this interface, never through a data source directly,
 * so swapping fixtures for Supabase later touches nothing but this file.
 */
export type CatalogueSource = {
  getCategories(): Promise<Category[]>;
  getStages(): Promise<Stage[]>;
  getFeaturedFreeProducts(limit?: number): Promise<Product[]>;
  getFeaturedBundle(): Promise<Bundle | null>;
  searchCatalogue(filters: CatalogueFilters): Promise<CatalogueResult>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getBundleBySlug(slug: string): Promise<Bundle | null>;
  getRelatedProducts(productId: string, limit?: number): Promise<Product[]>;

  // --- v3: framework/product-family layer (spec §14.3) ------------------

  /** Published frameworks only, optionally scoped to one journey stage. */
  getFrameworks(opts?: { journeyStage?: string }): Promise<Framework[]>;
  /**
   * Public-safe "Coming soon" projection: published frameworks plus
   * draft-but-flagship frameworks, narrow field set only (no editorial
   * detail) — see `FrameworkTeaser` and `it_frameworks_teasers`.
   */
  getFrameworkTeasers(): Promise<FrameworkTeaser[]>;
  /** Full detail for one published framework, by slug. Null if not found or not published. */
  getFrameworkBySlug(slug: string): Promise<Framework | null>;
  /** Same as `getFrameworkBySlug`, keyed by id — for resolving a product's `framework_id` back to its family. */
  getFrameworkById(id: string): Promise<Framework | null>;
  /** Every published Guide/Template/Tool/Bundle output belonging to a framework. */
  getFrameworkOutputs(frameworkId: string): Promise<ProductSummary[]>;
  /** Resolves a published Tool product by its stable `tool_key` (spec §12.3), not by slug. */
  getProductByToolKey(toolKey: string): Promise<Product | null>;

  // --- v4: DB-backed Guide content revisions (spec §14.7.1, Phase 6) -----
  // Guide content is now an `it_products` row (product_type='guide') plus its
  // published `it_product_content_revisions` row, not a repository file read
  // directly by the page. `content/guides/*.mdx` remains as the fixture
  // source's backing data (spec line 1245: repo Markdown may remain useful
  // as seed/backup) and as the one-off import script's input — see
  // `scripts/import-guides.ts`.

  /** Published guides only, newest first. */
  getAllGuides(): Promise<Guide[]>;
  getGuideBySlug(slug: string): Promise<Guide | null>;
};
