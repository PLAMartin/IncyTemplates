import { serverEnv } from "@/lib/env/server";
import { hasSupabaseConfig } from "@/lib/supabase/anon-client";
import { FixtureCatalogueSource } from "./fixture-source";
import { SupabaseCatalogueSource } from "./supabase-source";
import type { CatalogueSource } from "./types";

export type { CatalogueSource } from "./types";

/**
 * Selects the live data source once, at module load. Supabase is used when
 * both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are
 * set, or when `CONTENT_SOURCE=supabase` forces it; `CONTENT_SOURCE=fixtures`
 * forces the fixture path even if Supabase vars happen to be present (useful
 * for local development against fixtures without unsetting real env vars).
 * Otherwise fixtures are used — this is what keeps `npm run build` working
 * with zero cloud credentials.
 */
function selectSource(): CatalogueSource {
  if (serverEnv.CONTENT_SOURCE === "fixtures") {
    return new FixtureCatalogueSource();
  }
  if (serverEnv.CONTENT_SOURCE === "supabase" || hasSupabaseConfig()) {
    return new SupabaseCatalogueSource();
  }
  return new FixtureCatalogueSource();
}

export const catalogueSource: CatalogueSource = selectSource();

/** True when the fixture (non-production) content source is active — drives `ContentSourceBanner`. */
export const usingFixtureSource = catalogueSource instanceof FixtureCatalogueSource;

// Bound standalone functions, for ergonomic importing in Server Components:
//   import { getProductBySlug } from "@/server/queries";
export const getCategories = catalogueSource.getCategories.bind(catalogueSource);
export const getStages = catalogueSource.getStages.bind(catalogueSource);
export const getFeaturedFreeProducts = catalogueSource.getFeaturedFreeProducts.bind(catalogueSource);
export const getFeaturedBundle = catalogueSource.getFeaturedBundle.bind(catalogueSource);
export const searchCatalogue = catalogueSource.searchCatalogue.bind(catalogueSource);
export const getProductBySlug = catalogueSource.getProductBySlug.bind(catalogueSource);
export const getBundleBySlug = catalogueSource.getBundleBySlug.bind(catalogueSource);
export const getRelatedProducts = catalogueSource.getRelatedProducts.bind(catalogueSource);
