import { describe, expect, it } from "vitest";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  organizationJsonLd,
  productJsonLd,
  websiteJsonLd,
} from "@/lib/seo/structured-data";
import type { Guide, Product } from "@/types/catalogue";

const product: Product = {
  id: "p1",
  product_type: "template",
  access_type: "paid",
  status: "published",
  name: "Product Specification",
  slug: "product-specification",
  short_description: "A specification an engineer or AI agent can build from.",
  outcome_statement: "A buildable specification.",
  completion_minutes_min: 60,
  completion_minutes_max: 120,
  skill_level: "intermediate",
  price_minor: 1100,
  compare_at_price_minor: null,
  currency_code: "GBP",
  featured: false,
  published_at: "2026-07-04T09:00:00Z",
  scheduled_for: null,
  categories: [{ slug: "product-development", name: "Product development" }],
  stages: [{ slug: "define-the-product", name: "Define the product" }],
  formats: ["markdown"],
  is_placeholder: true,
  full_description: null,
  target_audience: null,
  when_to_use: null,
  when_not_to_use: null,
  current_version: "1.0",
  licence: null,
  quality_standard: {},
  files: [],
  seo_title: null,
  seo_description: null,
};

const guide: Guide = {
  title: "How to Test a Product Idea",
  slug: "test-a-product-idea",
  summary: "A practical guide.",
  author: "Phil Martin",
  publishedAt: "2026-07-10",
  updatedAt: "2026-07-10",
  status: "published",
  readingTimeMinutes: 5,
  content: "## Heading\n\nBody text.",
};

describe("structured-data builders", () => {
  it("organizationJsonLd has the right @type and no fabricated fields", () => {
    const data = organizationJsonLd();
    expect(data["@type"]).toBe("Organization");
    expect(data.name).toBeTruthy();
    expect(data).not.toHaveProperty("aggregateRating");
  });

  it("websiteJsonLd has a SearchAction", () => {
    const data = websiteJsonLd();
    expect(data["@type"]).toBe("WebSite");
    expect(data.potentialAction["@type"]).toBe("SearchAction");
  });

  it("breadcrumbJsonLd builds one ListItem per entry, in order", () => {
    const data = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Templates", path: "/templates" },
    ]);
    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement).toHaveLength(2);
    expect(data.itemListElement[0]!.position).toBe(1);
    expect(data.itemListElement[1]!.name).toBe("Templates");
  });

  it("productJsonLd includes name, offer price/currency and no fabricated rating", () => {
    const data = productJsonLd(product, "/templates/product-specification");
    expect(data["@type"]).toBe("Product");
    expect(data.name).toBe(product.name);
    expect(data.offers.priceCurrency).toBe("GBP");
    expect(data.offers.price).toBe("11.00");
    expect(data).not.toHaveProperty("aggregateRating");
    expect(data).not.toHaveProperty("review");
  });

  it("productJsonLd defaults price to 0.00 for free products", () => {
    const free = { ...product, access_type: "free" as const, price_minor: null };
    const data = productJsonLd(free, "/templates/product-specification");
    expect(data.offers.price).toBe("0.00");
  });

  it("articleJsonLd carries author, dates and headline", () => {
    const data = articleJsonLd(guide, "/guides/test-a-product-idea");
    expect(data["@type"]).toBe("Article");
    expect(data.headline).toBe(guide.title);
    expect(data.author.name).toBe("Phil Martin");
    expect(data.datePublished).toBe(guide.publishedAt);
  });

  it("faqJsonLd builds one Question per entry", () => {
    const data = faqJsonLd([{ question: "Is this free?", answer: "Yes." }]);
    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity).toHaveLength(1);
    expect(data.mainEntity[0]!.acceptedAnswer.text).toBe("Yes.");
  });
});
