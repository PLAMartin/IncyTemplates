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
};
