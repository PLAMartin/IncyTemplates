import { describe, expect, it } from "vitest";
import { rankProducts, scoreProduct } from "@/lib/search/rank";
import type { ProductSummary } from "@/types/catalogue";

function makeProduct(overrides: Partial<ProductSummary>): ProductSummary {
  return {
    id: "id",
    product_type: "template",
    access_type: "free",
    status: "published",
    name: "Product Idea Snapshot",
    slug: "product-idea-snapshot",
    short_description: "A one-page worksheet for a new idea.",
    outcome_statement: "Leave with a testable idea snapshot.",
    completion_minutes_min: 15,
    completion_minutes_max: 25,
    skill_level: "beginner",
    price_minor: null,
    compare_at_price_minor: null,
    currency_code: "GBP",
    featured: false,
    published_at: "2026-06-01T00:00:00Z",
    scheduled_for: null,
    categories: [{ slug: "product-strategy", name: "Product strategy" }],
    stages: [{ slug: "evaluate-an-idea", name: "Evaluate an idea" }],
    formats: ["markdown"],
    is_placeholder: true,
    framework_id: null,
    tool_key: null,
    ...overrides,
  };
}

describe("scoreProduct", () => {
  it("scores an exact title match highest", () => {
    const product = makeProduct({ name: "Product Idea Snapshot" });
    const exact = scoreProduct(product, "Product Idea Snapshot");
    const partial = scoreProduct(product, "idea");
    expect(exact).toBeGreaterThan(partial);
  });

  it("gives weight to an outcome-statement match", () => {
    const product = makeProduct({ outcome_statement: "Leave with a testable snapshot." });
    expect(scoreProduct(product, "testable")).toBeGreaterThan(0);
  });

  it("gives weight to a category/stage match", () => {
    const product = makeProduct({
      categories: [{ slug: "customer-research", name: "Customer research" }],
      short_description: "Something unrelated to the search term.",
      outcome_statement: null,
      name: "Unrelated Name",
    });
    expect(scoreProduct(product, "customer research")).toBeGreaterThan(0);
  });

  it("adds a small featured bonus", () => {
    const base = makeProduct({ name: "Match Term" });
    const featured = makeProduct({ name: "Match Term", featured: true });
    expect(scoreProduct(featured, "Match Term")).toBeGreaterThan(scoreProduct(base, "Match Term"));
  });

  it("returns 0 for a query with no match anywhere", () => {
    const product = makeProduct({});
    expect(scoreProduct(product, "zzz-nonexistent-zzz")).toBe(0);
  });
});

describe("rankProducts", () => {
  it("excludes non-matching products and sorts matches by score descending", () => {
    const products = [
      makeProduct({
        id: "1",
        name: "Weekly Founder Review",
        short_description: "A weekly review ritual.",
        outcome_statement: "A short written answer on progress.",
        categories: [{ slug: "founder-management", name: "Founder management" }],
        stages: [{ slug: "review-and-improve", name: "Review and improve" }],
      }),
      makeProduct({ id: "2", name: "Product Idea Snapshot" }),
      makeProduct({
        id: "3",
        name: "Something Else",
        outcome_statement: "Unrelated outcome.",
        short_description: "mentions product idea in passing",
        categories: [{ slug: "founder-management", name: "Founder management" }],
        stages: [{ slug: "review-and-improve", name: "Review and improve" }],
      }),
    ];

    const ranked = rankProducts(products, "idea");
    expect(ranked.map((r) => r.product.id)).toEqual(["2", "3"]);
    expect(ranked[0]!.score).toBeGreaterThan(ranked[1]!.score);
  });

  it("returns the input unranked (score 0) for an empty query", () => {
    const products = [makeProduct({ id: "1" }), makeProduct({ id: "2" })];
    const ranked = rankProducts(products, "");
    expect(ranked).toHaveLength(2);
    expect(ranked.every((r) => r.score === 0)).toBe(true);
  });
});
