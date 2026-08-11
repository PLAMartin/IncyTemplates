import { describe, expect, it } from "vitest";
import { scoreProductIdeaGenerator } from "@/lib/tools/product-idea-generator/scoring";
import { productIdeaGeneratorInputSchema } from "@/lib/tools/product-idea-generator/schema";
import type { ProductIdeaGeneratorInput } from "@/lib/tools/product-idea-generator/schema";

function input(overrides: Partial<ProductIdeaGeneratorInput>): ProductIdeaGeneratorInput {
  return {
    ownFrustration: "",
    nicheKnowledge: "",
    frequentlyUsedProduct: "",
    dailyPracticeCommitment: "willing_to_try",
    ...overrides,
  };
}

describe("scoreProductIdeaGenerator — each method has a reachable winning case", () => {
  it("recommends scratch-your-own-itch when only ownFrustration is filled", () => {
    const result = scoreProductIdeaGenerator(input({ ownFrustration: "chasing unpaid invoices every month" }));
    expect(result.recommendedMethod).toBe("scratch_your_own_itch");
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]!.method).toBe("scratch_your_own_itch");
    expect(result.candidates[0]!.promptText).toContain("chasing unpaid invoices every month");
  });

  it("recommends address-a-niche when only nicheKnowledge is filled", () => {
    const result = scoreProductIdeaGenerator(input({ nicheKnowledge: "amateur triathlon coaches" }));
    expect(result.recommendedMethod).toBe("address_a_niche");
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]!.method).toBe("address_a_niche");
  });

  it("recommends improve-existing when only frequentlyUsedProduct is filled", () => {
    const result = scoreProductIdeaGenerator(input({ frequentlyUsedProduct: "my gym's booking app" }));
    expect(result.recommendedMethod).toBe("improve_existing");
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]!.method).toBe("improve_existing");
  });
});

describe("scoreProductIdeaGenerator — richness ranking and tie-break", () => {
  it("recommends the richer (higher word count) answer when two fields are filled", () => {
    const result = scoreProductIdeaGenerator(
      input({
        ownFrustration: "one",
        nicheKnowledge: "a much longer and more detailed answer about a specific niche",
      }),
    );
    expect(result.recommendedMethod).toBe("address_a_niche");
    expect(result.candidates.map((c) => c.method)).toEqual(["scratch_your_own_itch", "address_a_niche"]);
  });

  it("breaks a richness tie using fixed METHOD_ORDER (scratch_your_own_itch wins over address_a_niche)", () => {
    const result = scoreProductIdeaGenerator(
      input({
        ownFrustration: "two words",
        nicheKnowledge: "two words",
      }),
    );
    expect(result.recommendedMethod).toBe("scratch_your_own_itch");
  });

  it("breaks a three-way richness tie in favour of the first method in METHOD_ORDER", () => {
    const result = scoreProductIdeaGenerator(
      input({
        ownFrustration: "two words",
        nicheKnowledge: "two words",
        frequentlyUsedProduct: "two words",
      }),
    );
    expect(result.recommendedMethod).toBe("scratch_your_own_itch");
    expect(result.candidates.map((c) => c.method)).toEqual(["scratch_your_own_itch", "address_a_niche", "improve_existing"]);
  });
});

describe("scoreProductIdeaGenerator — daily practice nudge", () => {
  it("produces distinct copy for each commitment level", () => {
    const base = input({ ownFrustration: "something" });
    const notYet = scoreProductIdeaGenerator({ ...base, dailyPracticeCommitment: "not_yet" }).dailyPracticeNudge;
    const willing = scoreProductIdeaGenerator({ ...base, dailyPracticeCommitment: "willing_to_try" }).dailyPracticeNudge;
    const already = scoreProductIdeaGenerator({ ...base, dailyPracticeCommitment: "already_do_it" }).dailyPracticeNudge;
    expect(new Set([notYet, willing, already]).size).toBe(3);
  });
});

describe("productIdeaGeneratorInputSchema — at least one free-text answer required", () => {
  it("rejects input where all three free-text fields are blank", () => {
    const parsed = productIdeaGeneratorInputSchema.safeParse({
      ownFrustration: "   ",
      nicheKnowledge: "",
      frequentlyUsedProduct: "",
      dailyPracticeCommitment: "not_yet",
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts input with exactly one non-blank free-text field", () => {
    const parsed = productIdeaGeneratorInputSchema.safeParse({
      ownFrustration: "a real answer",
      nicheKnowledge: "",
      frequentlyUsedProduct: "",
      dailyPracticeCommitment: "not_yet",
    });
    expect(parsed.success).toBe(true);
  });
});

describe("scoreProductIdeaGenerator — determinism", () => {
  it("the same input always produces the same result", () => {
    const sample = input({ ownFrustration: "chasing unpaid invoices", nicheKnowledge: "amateur triathlon coaches" });
    expect(scoreProductIdeaGenerator(sample)).toEqual(scoreProductIdeaGenerator(sample));
  });
});
