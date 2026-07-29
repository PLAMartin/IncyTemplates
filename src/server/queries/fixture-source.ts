import catalogue, { toSummary } from "../../../content/seed/catalogue";
import { rankProducts } from "@/lib/search/rank";
import type {
  Bundle,
  CatalogueFilters,
  CatalogueResult,
  Category,
  Product,
  ProductSummary,
  Stage,
} from "@/types/catalogue";
import type { CatalogueSource } from "./types";

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
    const free = this.publishedProducts().filter((p) => p.access_type === "free");
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
    const product = catalogue.products.find((p) => p.slug === slug && p.status === "published");
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
