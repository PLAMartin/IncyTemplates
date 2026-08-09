import type { AccessType, CatalogueFilters, FileFormat, ProductType } from "@/types/catalogue";

export type RawSearchParams = { [key: string]: string | string[] | undefined };

const ACCESS_VALUES: readonly AccessType[] = ["free", "paid"];
const TYPE_VALUES: readonly ProductType[] = ["guide", "template", "tool", "bundle"];
const SORT_VALUES = ["recommended", "newest", "popular", "price-asc", "price-desc"] as const;
const FORMAT_VALUES: readonly FileFormat[] = [
  "pdf", "docx", "xlsx", "pptx", "markdown", "notion", "miro",
  "google_docs", "google_sheets", "zip", "png", "jpg", "webp", "other",
];

function firstValue(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v?.trim() || undefined;
}

/**
 * Parse Next.js's raw `searchParams` object (App Router always hands this
 * over as `Promise<{[key: string]: string | string[] | undefined}>` — await
 * it before calling this) into the typed, validated `CatalogueFilters`
 * shape `CatalogueSource.searchCatalogue` expects. Unknown/invalid enum
 * values are silently dropped rather than thrown on — a mistyped or
 * hand-edited query string should degrade to "no filter", not a 500.
 */
export function parseCatalogueFilters(searchParams: RawSearchParams): CatalogueFilters {
  const q = firstValue(searchParams.q);
  const access = firstValue(searchParams.access);
  const category = firstValue(searchParams.category);
  const stage = firstValue(searchParams.stage);
  const format = firstValue(searchParams.format);
  const type = firstValue(searchParams.type);
  const sort = firstValue(searchParams.sort);
  const pageRaw = firstValue(searchParams.page);

  const parsedPage = pageRaw ? Number.parseInt(pageRaw, 10) : 1;
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const filters: CatalogueFilters = { page };
  if (q) filters.q = q;
  if (access && ACCESS_VALUES.includes(access as AccessType)) filters.access = access as AccessType;
  if (category) filters.category = category;
  if (stage) filters.stage = stage;
  if (format && FORMAT_VALUES.includes(format as FileFormat)) filters.format = format as FileFormat;
  if (type && TYPE_VALUES.includes(type as ProductType)) filters.type = type as ProductType;
  if (sort && (SORT_VALUES as readonly string[]).includes(sort)) {
    filters.sort = sort as CatalogueFilters["sort"];
  }

  return filters;
}

/** Inverse of parsing — builds a URLSearchParams for building hrefs (pagination, filter bar, canonical checks). */
export function filtersToSearchParams(filters: CatalogueFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.access) params.set("access", filters.access);
  if (filters.category) params.set("category", filters.category);
  if (filters.stage) params.set("stage", filters.stage);
  if (filters.format) params.set("format", filters.format);
  if (filters.type) params.set("type", filters.type);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  return params;
}
