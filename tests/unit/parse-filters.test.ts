import { describe, expect, it } from "vitest";
import { filtersToSearchParams, parseCatalogueFilters } from "@/lib/catalogue/parse-filters";
import { catalogueNoindexDecision } from "@/lib/seo/canonical";

describe("parseCatalogueFilters", () => {
  it("parses valid filters", () => {
    const filters = parseCatalogueFilters({ access: "free", stage: "evaluate-an-idea", sort: "newest", page: "2" });
    expect(filters).toEqual({ page: 2, access: "free", stage: "evaluate-an-idea", sort: "newest" });
  });

  it("drops unknown/invalid enum values instead of throwing", () => {
    const filters = parseCatalogueFilters({ access: "bogus", sort: "not-a-sort", format: "exe" });
    expect(filters.access).toBeUndefined();
    expect(filters.sort).toBeUndefined();
    expect(filters.format).toBeUndefined();
    expect(filters.page).toBe(1);
  });

  it("takes the first value when a param is repeated (array)", () => {
    const filters = parseCatalogueFilters({ q: ["first", "second"] });
    expect(filters.q).toBe("first");
  });

  it("defaults page to 1 for missing/invalid page values", () => {
    expect(parseCatalogueFilters({}).page).toBe(1);
    expect(parseCatalogueFilters({ page: "not-a-number" }).page).toBe(1);
    expect(parseCatalogueFilters({ page: "-5" }).page).toBe(1);
  });

  it("trims whitespace and drops empty strings", () => {
    const filters = parseCatalogueFilters({ q: "   ", category: "  product-strategy  " });
    expect(filters.q).toBeUndefined();
    expect(filters.category).toBe("product-strategy");
  });
});

describe("filtersToSearchParams", () => {
  it("round-trips through parseCatalogueFilters", () => {
    const filters = parseCatalogueFilters({ access: "paid", stage: "plan-the-mvp", page: "3" });
    const params = filtersToSearchParams(filters);
    expect(params.get("access")).toBe("paid");
    expect(params.get("stage")).toBe("plan-the-mvp");
    expect(params.get("page")).toBe("3");
  });

  it("omits page=1 (the default) from the query string", () => {
    const params = filtersToSearchParams({ page: 1 });
    expect(params.has("page")).toBe(false);
  });
});

describe("catalogueNoindexDecision", () => {
  it("indexes the bare catalogue with no filters", () => {
    const decision = catalogueNoindexDecision({});
    expect(decision.noindex).toBe(false);
    expect(decision.canonical).toMatch(/\/templates$/);
  });

  it("indexes a single-dimension filter and canonicalises to its dedicated route", () => {
    const decision = catalogueNoindexDecision({ access: "free" });
    expect(decision.noindex).toBe(false);
    expect(decision.canonical).toMatch(/\/templates\/free$/);
  });

  it("indexes a single stage filter and canonicalises to the stage route", () => {
    const decision = catalogueNoindexDecision({ stage: "evaluate-an-idea" });
    expect(decision.noindex).toBe(false);
    expect(decision.canonical).toMatch(/\/templates\/stages\/evaluate-an-idea$/);
  });

  it("marks 2+ filter dimensions as noindex", () => {
    const decision = catalogueNoindexDecision({ access: "free", stage: "evaluate-an-idea" });
    expect(decision.noindex).toBe(true);
  });

  it("prefers the most specific dedicated route as canonical when noindexed", () => {
    const decision = catalogueNoindexDecision({ access: "free", stage: "evaluate-an-idea", category: "product-strategy" });
    expect(decision.noindex).toBe(true);
    expect(decision.canonical).toMatch(/\/templates\/stages\/evaluate-an-idea$/);
  });

  it("falls back to the bare catalogue when no present dimension has a dedicated route", () => {
    const decision = catalogueNoindexDecision({ q: "interview", type: "bundle" });
    expect(decision.noindex).toBe(true);
    expect(decision.canonical).toMatch(/\/templates$/);
  });
});
