import type { Bundle, CatalogueFilters, CatalogueResult, Category, Product, Stage } from "@/types/catalogue";

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
};
