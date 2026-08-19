import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getAllGuides, getCategories, getFrameworks, getStages, searchCatalogue } from "@/server/queries";
import { productHref } from "@/components/catalogue/product-card";
import type { ProductSummary } from "@/types/catalogue";

const STATIC_PATHS = [
  "/",
  "/products",
  "/collections/start-a-product",
  "/journey",
  "/templates",
  "/templates/free",
  "/templates/paid",
  "/templates/categories",
  "/templates/stages",
  "/tools",
  "/finder",
  "/bundles",
  "/guides",
  "/about",
  "/how-it-works",
  "/pricing",
  "/help",
  "/faq",
  "/contact",
  "/accessibility",
];

/**
 * `searchCatalogue` paginates (12 per page). Sitemap generation needs every
 * published item, so this pages through results until it's collected the
 * reported `total` — not just the first page's worth.
 */
async function getAllPublishedSummaries(): Promise<ProductSummary[]> {
  const items: ProductSummary[] = [];
  let page = 1;
  let total = Infinity;
  while (items.length < total) {
    const result = await searchCatalogue({ page });
    total = result.total;
    if (result.items.length === 0) break;
    items.push(...result.items);
    page += 1;
  }
  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, stages, frameworks, guides, catalogueItems] = await Promise.all([
    getCategories(),
    getStages(),
    getFrameworks(),
    getAllGuides(),
    getAllPublishedSummaries(),
  ]);

  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
  }));

  for (const category of categories) {
    entries.push({ url: `${site.url}/templates/categories/${category.slug}`, lastModified: now });
  }
  for (const stage of stages) {
    entries.push({ url: `${site.url}/templates/stages/${stage.slug}`, lastModified: now });
    entries.push({ url: `${site.url}/journey/${stage.slug}`, lastModified: now });
  }
  for (const framework of frameworks) {
    entries.push({
      url: `${site.url}/products/${framework.slug}`,
      lastModified: framework.published_at ? new Date(framework.published_at) : now,
    });
  }
  for (const guide of guides) {
    entries.push({ url: `${site.url}/guides/${guide.slug}`, lastModified: new Date(guide.updatedAt) });
  }
  for (const item of catalogueItems) {
    // Guide-type it_products rows are intentionally skipped here — their canonical URL and
    // lastModified come from the MDX front matter via `guides` above, not the DB row.
    if (item.product_type === "guide") continue;
    entries.push({
      url: `${site.url}${productHref(item)}`,
      lastModified: item.published_at ? new Date(item.published_at) : now,
    });
  }

  return entries;
}
