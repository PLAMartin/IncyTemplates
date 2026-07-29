import { describe, expect, it } from "vitest";
import { guideFrontmatterSchema } from "@/lib/mdx/schema";

const validFrontmatter = {
  title: "How to Test a Product Idea",
  slug: "test-a-product-idea",
  summary: "A practical guide to testing an idea before you build it.",
  author: "Phil Martin",
  publishedAt: "2026-07-10",
  updatedAt: "2026-07-10",
  status: "published",
  seoTitle: "How to Test a Product Idea",
  seoDescription: "A guide.",
  relatedProducts: ["product-idea-snapshot"],
};

describe("guideFrontmatterSchema", () => {
  it("accepts valid front matter", () => {
    const result = guideFrontmatterSchema.safeParse(validFrontmatter);
    expect(result.success).toBe(true);
  });

  it("accepts valid front matter without the optional fields", () => {
    const { seoTitle, seoDescription, relatedProducts, ...required } = validFrontmatter;
    void seoTitle;
    void seoDescription;
    void relatedProducts;
    const result = guideFrontmatterSchema.safeParse(required);
    expect(result.success).toBe(true);
  });

  it("rejects a missing required field", () => {
    const { title: _title, ...rest } = validFrontmatter;
    void _title;
    const result = guideFrontmatterSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects an uppercase or non-URL-safe slug", () => {
    const result = guideFrontmatterSchema.safeParse({ ...validFrontmatter, slug: "Test A Product Idea" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid status value", () => {
    const result = guideFrontmatterSchema.safeParse({ ...validFrontmatter, status: "archived" });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed date", () => {
    const result = guideFrontmatterSchema.safeParse({ ...validFrontmatter, publishedAt: "10 July 2026" });
    expect(result.success).toBe(false);
  });
});
