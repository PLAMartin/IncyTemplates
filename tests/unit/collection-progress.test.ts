import { describe, expect, it, beforeEach } from "vitest";
import { readProgress, recordVisit, recordCompletion } from "@/lib/progress/collection-progress";

beforeEach(() => {
  window.localStorage.clear();
});

describe("collection-progress (spec v9 §9.3 anonymous local progress)", () => {
  it("readProgress returns null when nothing is stored", () => {
    expect(readProgress()).toBeNull();
  });

  it("recordVisit stores last_framework_slug/last_output_type without marking anything completed", () => {
    recordVisit({ collectionSlug: "start-a-product", frameworkSlug: "product-idea-assessor", outputType: "tool" });
    const progress = readProgress();
    expect(progress).not.toBeNull();
    expect(progress?.collection_slug).toBe("start-a-product");
    expect(progress?.last_framework_slug).toBe("product-idea-assessor");
    expect(progress?.last_output_type).toBe("tool");
    expect(progress?.completed_framework_slugs).toEqual([]);
  });

  it("recordCompletion adds to completed_framework_slugs and updates last_*", () => {
    recordVisit({ collectionSlug: "start-a-product", frameworkSlug: "product-idea-assessor", outputType: "guide" });
    recordCompletion({ collectionSlug: "start-a-product", frameworkSlug: "product-idea-assessor", outputType: "tool" });
    const progress = readProgress();
    expect(progress?.completed_framework_slugs).toEqual(["product-idea-assessor"]);
    expect(progress?.last_output_type).toBe("tool");
  });

  it("completed_framework_slugs accumulates across multiple families without duplicating", () => {
    recordCompletion({ collectionSlug: "start-a-product", frameworkSlug: "product-idea-assessor", outputType: "tool" });
    recordCompletion({ collectionSlug: "start-a-product", frameworkSlug: "customer-discovery-kit", outputType: "tool" });
    recordCompletion({ collectionSlug: "start-a-product", frameworkSlug: "product-idea-assessor", outputType: "tool" });
    const progress = readProgress();
    expect(progress?.completed_framework_slugs.sort()).toEqual(["customer-discovery-kit", "product-idea-assessor"]);
  });

  it("a subsequent visit/completion never removes an already-completed family from the list", () => {
    recordCompletion({ collectionSlug: "start-a-product", frameworkSlug: "product-idea-assessor", outputType: "tool" });
    recordVisit({ collectionSlug: "start-a-product", frameworkSlug: "customer-discovery-kit", outputType: "guide" });
    const progress = readProgress();
    expect(progress?.completed_framework_slugs).toEqual(["product-idea-assessor"]);
    expect(progress?.last_framework_slug).toBe("customer-discovery-kit");
  });

  it("switching collection_slug resets completed_framework_slugs (single-active-journey shape)", () => {
    recordCompletion({ collectionSlug: "start-a-product", frameworkSlug: "product-idea-assessor", outputType: "tool" });
    recordVisit({ collectionSlug: "a-different-collection", frameworkSlug: "some-framework", outputType: "guide" });
    const progress = readProgress();
    expect(progress?.collection_slug).toBe("a-different-collection");
    expect(progress?.completed_framework_slugs).toEqual([]);
  });

  it("readProgress ignores malformed stored JSON rather than throwing", () => {
    window.localStorage.setItem("it_collection_progress_v1", "{ not valid json");
    expect(readProgress()).toBeNull();
  });

  it("readProgress ignores a validly-parsed but wrong-shaped value", () => {
    window.localStorage.setItem("it_collection_progress_v1", JSON.stringify({ foo: "bar" }));
    expect(readProgress()).toBeNull();
  });

  it("never stores anything beyond the spec-defined fields (no Tool content leakage)", () => {
    recordCompletion({ collectionSlug: "start-a-product", frameworkSlug: "product-idea-assessor", outputType: "tool" });
    const raw = window.localStorage.getItem("it_collection_progress_v1");
    const parsed = JSON.parse(raw!);
    expect(Object.keys(parsed).sort()).toEqual(
      ["collection_slug", "completed_framework_slugs", "last_framework_slug", "last_output_type", "last_visited_at"].sort(),
    );
  });
});
