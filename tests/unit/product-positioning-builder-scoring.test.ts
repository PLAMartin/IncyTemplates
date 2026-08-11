import { describe, expect, it } from "vitest";
import { scoreProductPositioningBuilder } from "@/lib/tools/product-positioning-builder/scoring";
import { productPositioningBuilderInputSchema } from "@/lib/tools/product-positioning-builder/schema";
import type { ProductPositioningBuilderInput } from "@/lib/tools/product-positioning-builder/schema";

function input(overrides: Partial<ProductPositioningBuilderInput> = {}): ProductPositioningBuilderInput {
  return {
    idealCustomer: "solo founders validating a new product idea",
    desiredAction: "score their idea in under five minutes",
    desiredOutcome: "know exactly how much evidence they still need before committing",
    admiredIdentity: "",
    cutThroughApproach: "problem_people_actively_worry_about",
    ...overrides,
  };
}

describe("scoreProductPositioningBuilder — statement assembly", () => {
  it("assembles a statement from ideal customer, action and outcome", () => {
    const result = scoreProductPositioningBuilder(input());
    expect(result.positioningStatement).toBe(
      "When solo founders validating a new product idea score their idea in under five minutes, they get know exactly how much evidence they still need before committing.",
    );
  });

  it("appends the admired-identity clause only when it's provided", () => {
    const withAdmired = scoreProductPositioningBuilder(input({ admiredIdentity: "founders who validate rigorously" }));
    expect(withAdmired.positioningStatement).toContain("That's what lets them feel like founders who validate rigorously.");

    const withoutAdmired = scoreProductPositioningBuilder(input({ admiredIdentity: "" }));
    expect(withoutAdmired.positioningStatement).not.toContain("That's what lets them feel like");
  });
});

describe("scoreProductPositioningBuilder — cut-through tactic is a direct lookup", () => {
  it.each([
    ["problem_people_actively_worry_about", "scary"],
    ["unusual_or_unexpected_offer", "strange"],
    ["visually_or_emotionally_striking", "sexy"],
    ["can_give_away_something_valuable_upfront", "free_gift"],
    ["building_repeated_content_over_time", "familiar"],
  ] as const)("%s -> %s", (approach, expectedTactic) => {
    const result = scoreProductPositioningBuilder(input({ cutThroughApproach: approach }));
    expect(result.recommendedTactic).toBe(expectedTactic);
    expect(result.tacticExplanation.length).toBeGreaterThan(0);
  });
});

describe("productPositioningBuilderInputSchema — required vs optional fields", () => {
  it("rejects input with a blank required field", () => {
    const parsed = productPositioningBuilderInputSchema.safeParse({
      idealCustomer: "",
      desiredAction: "score their idea",
      desiredOutcome: "know what to do next",
      admiredIdentity: "",
      cutThroughApproach: "problem_people_actively_worry_about",
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts input with admiredIdentity omitted entirely", () => {
    const parsed = productPositioningBuilderInputSchema.safeParse({
      idealCustomer: "solo founders",
      desiredAction: "score their idea",
      desiredOutcome: "know what to do next",
      cutThroughApproach: "building_repeated_content_over_time",
    });
    expect(parsed.success).toBe(true);
  });
});

describe("scoreProductPositioningBuilder — determinism", () => {
  it("the same input always produces the same result", () => {
    const sample = input({ admiredIdentity: "founders who ship fast" });
    expect(scoreProductPositioningBuilder(sample)).toEqual(scoreProductPositioningBuilder(sample));
  });
});
