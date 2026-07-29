import type { ProductSummary } from "@/types/catalogue";

/**
 * Weighted search ranking (spec §21.2). Pure and I/O-free by design so it's
 * easy to unit test and so `fixture-source.ts` and any future search
 * implementation can share the same scoring rules.
 *
 * Weighted ranking order, highest first:
 *   1. Exact title match
 *   2. Outcome statement
 *   3. Search keywords
 *   4. Category or stage
 *   5. Short description
 *   6. Popularity
 *   7. Editorial featured score
 *
 * `ProductSummary` doesn't carry a popularity metric or raw search-keywords
 * array this phase (no analytics/admin data exists yet), so those two
 * weights are folded into "featured" as the closest available proxy — see
 * the inline comments below for exactly where each spec weight is applied.
 */

const WEIGHTS = {
  exactTitle: 100,
  titleContains: 40,
  outcomeStatement: 25,
  category: 12,
  stage: 12,
  shortDescription: 8,
  featured: 5,
} as const;

export type RankedProduct = {
  product: ProductSummary;
  score: number;
};

function normalise(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Score a single product against a query. Exported separately from
 * `rankProducts` so tests can assert on individual weight contributions.
 */
export function scoreProduct(product: ProductSummary, query: string): number {
  const q = normalise(query);
  if (!q) return 0;

  const title = normalise(product.name);
  let score = 0;

  // 1. Exact title match
  if (title === q) {
    score += WEIGHTS.exactTitle;
  } else if (title.includes(q)) {
    score += WEIGHTS.titleContains;
  }

  // 2. Outcome statement
  if (product.outcome_statement && normalise(product.outcome_statement).includes(q)) {
    score += WEIGHTS.outcomeStatement;
  }

  // 3. Search keywords — not modelled on ProductSummary this phase; category
  // and stage names double as the closest available "keyword" signal below.

  // 4. Category or stage
  if (product.categories.some((c) => normalise(c.name).includes(q) || normalise(c.slug).includes(q))) {
    score += WEIGHTS.category;
  }
  if (product.stages.some((s) => normalise(s.name).includes(q) || normalise(s.slug).includes(q))) {
    score += WEIGHTS.stage;
  }

  // 5. Short description
  if (normalise(product.short_description).includes(q)) {
    score += WEIGHTS.shortDescription;
  }

  // 6. Popularity — no view/download counters exist yet this phase; nothing
  // to weight by, so this step is a deliberate no-op (see file header).

  // 7. Editorial featured score
  if (product.featured) {
    score += WEIGHTS.featured;
  }

  return score;
}

/**
 * Rank a list of products against a query. Products that score zero (no
 * match on any weighted field) are excluded from the result rather than
 * returned in arbitrary order. An empty/whitespace-only query returns the
 * input list unranked (score 0 for all), unchanged in order, so callers can
 * pass `q` straight through without special-casing "no search" themselves.
 */
export function rankProducts(products: ProductSummary[], query: string): RankedProduct[] {
  const q = normalise(query);
  if (!q) {
    return products.map((product) => ({ product, score: 0 }));
  }

  return products
    .map((product) => ({ product, score: scoreProduct(product, query) }))
    .filter((ranked) => ranked.score > 0)
    .sort((a, b) => b.score - a.score);
}
