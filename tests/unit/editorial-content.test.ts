import { describe, expect, it } from "vitest";
import { resolveCommonCopy, type CommonProductCopy } from "@/server/admin/editorial-content";

const product: CommonProductCopy = {
  name: "Live Name",
  short_description: "Live short description",
  full_description: "Live full description",
  outcome_statement: "",
  target_audience: "",
  when_to_use: "",
  when_not_to_use: "",
  seo_title: "",
  seo_description: "",
};

describe("resolveCommonCopy", () => {
  it("falls back to the live it_products values when there is no draft revision", () => {
    expect(resolveCommonCopy(undefined, undefined, product)).toEqual(product);
  });

  it("a schema-v2 draft's common fields override the live values", () => {
    const resolved = resolveCommonCopy({ common: { short_description: "Draft description" } }, 2, product);
    expect(resolved.short_description).toBe("Draft description");
    expect(resolved.name).toBe("Live Name");
  });

  it("a schema-v1 (legacy) revision never overrides common fields, even if content_data happens to have a 'common' key", () => {
    const resolved = resolveCommonCopy({ common: { short_description: "Should be ignored" } }, 1, product);
    expect(resolved.short_description).toBe("Live short description");
  });

  it("optional fields default to an empty string rather than undefined", () => {
    const resolved = resolveCommonCopy(undefined, undefined, { ...product, outcome_statement: undefined });
    expect(resolved.outcome_statement).toBe("");
  });
});
