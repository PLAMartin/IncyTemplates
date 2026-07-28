import { site } from "@/config/site";

/** Build an absolute canonical URL from a site-relative path (must start with "/"). */
export function canonicalUrl(path: string): string {
  const normalisedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalisedPath, site.url).toString();
}

/**
 * Spec §10.2's anti-duplication rule: `/templates` combinations with 2+
 * filter dimensions must not be indexed. A "dimension" here is any of
 * access/category/stage/format/type/q — `sort` and `page` don't count
 * (they're not really a different *slice* of content, just an ordering /
 * pagination of the same slice).
 */
const FILTER_DIMENSION_KEYS = ["access", "category", "stage", "format", "type", "q"] as const;

export type FilterDimensionKey = (typeof FILTER_DIMENSION_KEYS)[number];

export type NoindexDecision = {
  /** True when 2+ filter dimensions are present and the page should be noindex. */
  noindex: boolean;
  /** The canonical URL to point at — the nearest single-dimension route, or the current path when 0-1 dimensions are present. */
  canonical: string;
};

/**
 * Decide whether a `/templates` listing with the given filters should be
 * indexed, and what canonical URL to use.
 *
 * - 0 dimensions (`/templates`): indexable, canonical is itself.
 * - 1 dimension: indexable. If it maps onto one of the dedicated
 *   single-dimension routes (`/templates/free`, `/templates/paid`,
 *   `/templates/stages/[stage]`, `/templates/categories/[category]`,
 *   `/templates/formats/[format]`), the canonical points there instead of
 *   the query-string form, so the two equivalent URLs consolidate into one.
 * - 2+ dimensions: noindex, canonical points at the single most specific
 *   dedicated route available (falls back to bare `/templates` if none of
 *   the present dimensions has a dedicated route, e.g. a bare `q` search).
 */
export function catalogueNoindexDecision(
  filters: Partial<Record<FilterDimensionKey, string | undefined>>,
): NoindexDecision {
  const present = FILTER_DIMENSION_KEYS.filter((key) => Boolean(filters[key]));

  if (present.length === 0) {
    return { noindex: false, canonical: canonicalUrl("/templates") };
  }

  if (present.length === 1) {
    const key = present[0]!;
    const value = filters[key]!;
    return { noindex: false, canonical: canonicalUrl(dedicatedRoute(key, value) ?? "/templates") };
  }

  // 2+ dimensions: prefer the most specific dedicated single-dimension
  // route among those present, in a fixed priority order, else fall back to
  // the bare catalogue.
  const priority: FilterDimensionKey[] = ["stage", "category", "format", "access"];
  for (const key of priority) {
    if (filters[key]) {
      const route = dedicatedRoute(key, filters[key]!);
      if (route) return { noindex: true, canonical: canonicalUrl(route) };
    }
  }
  return { noindex: true, canonical: canonicalUrl("/templates") };
}

function dedicatedRoute(key: FilterDimensionKey, value: string): string | null {
  switch (key) {
    case "access":
      return value === "free" ? "/templates/free" : value === "paid" ? "/templates/paid" : null;
    case "stage":
      return `/templates/stages/${value}`;
    case "category":
      return `/templates/categories/${value}`;
    case "format":
      return `/templates/formats/${value}`;
    case "type":
    case "q":
      return null;
  }
}
