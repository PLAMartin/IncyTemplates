import { describe, expect, it } from "vitest";
import { validateCollection, type AdminCollectionDetail, type AdminCollectionMember } from "@/server/admin/collections";

function member(overrides: Partial<AdminCollectionMember> = {}): AdminCollectionMember {
  return {
    frameworkId: "framework-1",
    frameworkName: "Product Idea Assessor",
    frameworkSlug: "product-idea-assessor",
    frameworkStatus: "published",
    frameworkVisibility: "public",
    stepOrder: 1,
    stepLabel: "Assess the idea",
    transitionCopy: "Decide what evidence is missing",
    isRequired: true,
    ...overrides,
  };
}

function coreCollection(overrides: Partial<AdminCollectionDetail> = {}): AdminCollectionDetail {
  return {
    id: "collection-1",
    name: "Start a Product",
    slug: "start-a-product",
    status: "draft",
    public_visibility: "public",
    headline: "Five connected steps.",
    short_description: "The launch core collection.",
    display_order: 1,
    is_core: true,
    seo_title: null,
    seo_description: null,
    members: [
      member({ frameworkId: "f1", stepOrder: 1, stepLabel: "Assess the idea", transitionCopy: "a" }),
      member({ frameworkId: "f2", stepOrder: 2, stepLabel: "Understand customers", transitionCopy: "b" }),
      member({ frameworkId: "f3", stepOrder: 3, stepLabel: "Test demand", transitionCopy: "c" }),
      member({ frameworkId: "f4", stepOrder: 4, stepLabel: "Scope the MVP", transitionCopy: "d" }),
      member({ frameworkId: "f5", stepOrder: 5, stepLabel: "Find first customers", transitionCopy: null }),
    ],
    ...overrides,
  };
}

describe("validateCollection (spec v9 §36.10 mechanically-checkable subset)", () => {
  it("a complete, correctly-ordered 5-member core collection is valid", () => {
    const result = validateCollection(coreCollection());
    expect(result).toEqual({ valid: true });
  });

  it("a final step is allowed to omit transition copy", () => {
    const result = validateCollection(coreCollection());
    expect(result.valid).toBe(true);
  });

  it("rejects a missing headline", () => {
    const result = validateCollection(coreCollection({ headline: null }));
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors).toContain("Headline (promise) is required to publish.");
  });

  it("rejects a core collection with fewer than 5 members", () => {
    const result = validateCollection(coreCollection({ members: coreCollection().members.slice(0, 3) }));
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.some((e) => e.includes("all 5 configured members"))).toBe(true);
  });

  it("allows a non-core collection with only 2 members", () => {
    const nonCore = coreCollection({
      is_core: false,
      members: [member({ frameworkId: "f1", stepOrder: 1, transitionCopy: "a" }), member({ frameworkId: "f2", stepOrder: 2, transitionCopy: null })],
    });
    const result = validateCollection(nonCore);
    expect(result.valid).toBe(true);
  });

  it("rejects duplicate step orders", () => {
    const collection = coreCollection();
    collection.members[1] = { ...collection.members[1]!, stepOrder: 1 };
    const result = validateCollection(collection);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors).toContain("Step order must be unique across members.");
  });

  it("rejects a step order gap", () => {
    const collection = coreCollection();
    collection.members[4] = { ...collection.members[4]!, stepOrder: 6 };
    const result = validateCollection(collection);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.some((e) => e.includes("contiguous"))).toBe(true);
  });

  it("rejects a member framework that is not published+public", () => {
    const collection = coreCollection();
    collection.members[0] = { ...collection.members[0]!, frameworkVisibility: "unlisted" };
    const result = validateCollection(collection);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.some((e) => e.includes("published, public framework"))).toBe(true);
  });

  it("rejects a non-final step missing transition copy", () => {
    const collection = coreCollection();
    collection.members[1] = { ...collection.members[1]!, transitionCopy: null };
    const result = validateCollection(collection);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.some((e) => e.includes("needs transition copy"))).toBe(true);
  });
});
