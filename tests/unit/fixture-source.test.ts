import { describe, expect, it } from "vitest";
import { FixtureCatalogueSource } from "@/server/queries/fixture-source";
import catalogue from "../../content/seed/catalogue";

const source = new FixtureCatalogueSource();

describe("FixtureCatalogueSource visibility filtering", () => {
  it("the seed catalogue actually contains draft and scheduled products to test against", () => {
    // Guards against this test suite silently passing if the seed data changes shape.
    expect(catalogue.products.some((p) => p.status === "draft")).toBe(true);
    expect(catalogue.products.some((p) => p.status === "scheduled")).toBe(true);
    expect(catalogue.products.some((p) => p.status === "unlisted")).toBe(true);
  });

  it("getProductBySlug returns null for a draft product", async () => {
    const draft = catalogue.products.find((p) => p.status === "draft");
    expect(draft).toBeTruthy();
    const result = await source.getProductBySlug(draft!.slug);
    expect(result).toBeNull();
  });

  it("getProductBySlug returns null for a scheduled product", async () => {
    const scheduled = catalogue.products.find((p) => p.status === "scheduled");
    expect(scheduled).toBeTruthy();
    const result = await source.getProductBySlug(scheduled!.slug);
    expect(result).toBeNull();
  });

  it("getProductBySlug returns null for an unlisted (bundle-item) product", async () => {
    const unlisted = catalogue.products.find((p) => p.status === "unlisted");
    expect(unlisted).toBeTruthy();
    const result = await source.getProductBySlug(unlisted!.slug);
    expect(result).toBeNull();
  });

  it("getProductBySlug returns the product for a published slug", async () => {
    const published = catalogue.products.find((p) => p.status === "published");
    expect(published).toBeTruthy();
    const result = await source.getProductBySlug(published!.slug);
    expect(result?.slug).toBe(published!.slug);
  });

  it("searchCatalogue never returns a non-published item", async () => {
    const result = await source.searchCatalogue({});
    for (const item of result.items) {
      expect(item.status).toBe("published");
    }
  });

  it("searchCatalogue total matches only published templates + bundles (guide/tool rows excluded by default)", async () => {
    const publishedCount =
      catalogue.products.filter((p) => p.status === "published" && p.product_type === "template").length +
      catalogue.bundles.filter((b) => b.status === "published").length;
    const result = await source.searchCatalogue({ page: 1 });
    expect(result.total).toBe(publishedCount);
  });

  it("searchCatalogue with an explicit type filter can still return guide/tool rows", async () => {
    const publishedTools = catalogue.products.filter((p) => p.status === "published" && p.product_type === "tool").length;
    const result = await source.searchCatalogue({ page: 1, type: "tool" });
    expect(result.total).toBe(publishedTools);
    expect(result.total).toBeGreaterThan(0);
    for (const item of result.items) {
      expect(item.product_type).toBe("tool");
    }
  });

  it("getFeaturedFreeProducts only returns published free products", async () => {
    const featured = await source.getFeaturedFreeProducts(10);
    for (const product of featured) {
      expect(product.access_type).toBe("free");
      expect(product.status).toBe("published");
    }
  });

  it("getBundleBySlug returns null for a non-published bundle slug and the bundle for a published one", async () => {
    const publishedBundle = catalogue.bundles.find((b) => b.status === "published");
    expect(publishedBundle).toBeTruthy();
    const result = await source.getBundleBySlug(publishedBundle!.slug);
    expect(result?.slug).toBe(publishedBundle!.slug);
    expect(result?.bundle_items.length).toBeGreaterThan(0);

    const result2 = await source.getBundleBySlug("not-a-real-bundle-slug");
    expect(result2).toBeNull();
  });
});

describe("FixtureCatalogueSource collections (spec v9 §14.3.1)", () => {
  it("getActiveCoreCollection returns the Start a Product collection with all five members in order", async () => {
    const collection = await source.getActiveCoreCollection();
    expect(collection).toBeTruthy();
    expect(collection!.slug).toBe("start-a-product");
    expect(collection!.is_core).toBe(true);
    expect(collection!.members.map((m) => m.framework.slug)).toEqual([
      "product-idea-assessor",
      "customer-discovery-kit",
      "customer-demand-test",
      "mvp-scoper",
      "first-customers-planner",
    ]);
    expect(collection!.members.every((m) => m.framework.status === "published")).toBe(true);
    // step order is contiguous and matches array order
    collection!.members.forEach((m, i) => expect(m.stepOrder).toBe(i + 1));
  });

  it("getCollectionBySlug matches getActiveCoreCollection for the same collection", async () => {
    const bySlug = await source.getCollectionBySlug("start-a-product");
    const core = await source.getActiveCoreCollection();
    expect(bySlug).toEqual(core);
  });

  it("getCollectionBySlug returns null for an unknown slug", async () => {
    const result = await source.getCollectionBySlug("not-a-real-collection-slug");
    expect(result).toBeNull();
  });
});
