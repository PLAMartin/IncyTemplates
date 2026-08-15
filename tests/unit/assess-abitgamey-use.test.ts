import { describe, expect, it } from "vitest";
import { assessAbitGameyPost } from "../../scripts/assess-abitgamey-use";
import type { RawSourcePost, SourceMappingFrameworkOption } from "../../scripts/assess-abitgamey-use";

const FRAMEWORKS: SourceMappingFrameworkOption[] = [
  {
    id: "id-decision-framework-picker",
    slug: "decision-framework-picker",
    name: "Decision Framework Picker",
    outcomeStatement: "Pick the right decision framework for a specific choice.",
    methodSummary: "Interactive decision framework selector using inversion and six thinking hats.",
  },
  {
    id: "id-pricing-your-product",
    slug: "pricing-your-product",
    name: "Pricing Your Product",
    outcomeStatement: "Choose a defensible price for a product.",
    methodSummary: "Pricing calculator using willingness-to-pay and anchor pricing.",
  },
];

function post(overrides: Partial<RawSourcePost> = {}): RawSourcePost {
  return {
    postId: "123.test-post",
    title: "Test post",
    subtitle: null,
    category: null,
    html: "<p>Some text.</p>",
    ...overrides,
  };
}

describe("assessAbitGameyPost", () => {
  it("suggests tool for a structured decision-making post with a numbered title", () => {
    const result = assessAbitGameyPost(
      post({
        title: "Six thinking hats: a decision framework in six steps",
        subtitle: "Better decisions in six steps",
        category: "decision-making",
        html: `<p>intro</p><ol>${"<li>step</li>".repeat(6)}</ol>`,
      }),
      FRAMEWORKS,
    );

    expect(result.dimensions.sourceStage).toBe("decide");
    expect(result.suggestedUses).toContain("tool");
    expect(result.suggestedUses).toContain("guide");
    expect(result.scores.structure).toBe(2);
  });

  it("suggests source_only + guide (no framework links) for a low-product mindset post", () => {
    const result = assessAbitGameyPost(
      post({
        title: "What Charlie Munger taught me",
        subtitle: "Lessons in mental models",
        category: "mindset-philosophy",
        html: "<p>A story about wisdom.</p>",
      }),
      FRAMEWORKS,
    );

    expect(result.suggestedUses).toEqual(["source_only", "guide"]);
    expect(result.suggestedFrameworks).toEqual([]);
    expect(result.dimensions.judgementLevel).toBe("high");
  });

  it("never suggests guide for Founder Journey posts", () => {
    const result = assessAbitGameyPost(
      post({ title: "How I Built This", category: "founder-journey", html: "<p>Behind the scenes.</p>" }),
      FRAMEWORKS,
    );

    expect(result.suggestedUses).not.toContain("guide");
  });

  it("ranks framework suggestions by keyword overlap and excludes source_only from output_uses", () => {
    const result = assessAbitGameyPost(
      post({
        title: "Getting our target price with a pricing calculator",
        subtitle: "Anchor price and willingness-to-pay",
        category: "pricing-monetisation",
        html: `<p>intro</p><ol>${"<li>step</li>".repeat(5)}</ol>`,
      }),
      FRAMEWORKS,
    );

    expect(result.suggestedFrameworks.length).toBeGreaterThan(0);
    expect(result.suggestedFrameworks[0]?.frameworkId).toBe("id-pricing-your-product");
    for (const mapping of result.suggestedFrameworks) {
      expect(mapping.outputUses).not.toContain("source_only");
    }
  });

  it("falls back to sensible defaults for an uncategorised post", () => {
    const result = assessAbitGameyPost(post(), FRAMEWORKS);
    expect(result.suggestedUses.length).toBeGreaterThan(0);
    expect(result.dimensions.methodTags.length).toBeGreaterThan(0);
  });
});
