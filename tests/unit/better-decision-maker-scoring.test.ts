import { describe, expect, it } from "vitest";
import { scoreBetterDecisionMaker } from "@/lib/tools/better-decision-maker/scoring";
import type { BetterDecisionMakerInput, Reversibility } from "@/lib/tools/better-decision-maker/schema";

const baseInput = (
  overrides: Partial<BetterDecisionMakerInput> = {},
): BetterDecisionMakerInput => ({
  optionALikelihood: "medium",
  optionAImpact: "moderate",
  optionAEffort: "medium",
  optionAReversibility: "two_way_door",
  optionBLikelihood: "medium",
  optionBImpact: "moderate",
  optionBEffort: "medium",
  optionBReversibility: "two_way_door",
  ...overrides,
});

describe("scoreBetterDecisionMaker — expected value boundary conditions", () => {
  it("the worst-case option (low likelihood, small impact, high effort) scores the lowest expected value", () => {
    const result = scoreBetterDecisionMaker(
      baseInput({ optionALikelihood: "low", optionAImpact: "small", optionAEffort: "high" }),
    );
    // (0.25 * 25) / 2 = 3.125 -> rounds to 3.
    expect(result.optionAExpectedValue).toBe(3);
  });

  it("the best-case option (high likelihood, large impact, low effort) scores the highest expected value", () => {
    const result = scoreBetterDecisionMaker(
      baseInput({ optionALikelihood: "high", optionAImpact: "large", optionAEffort: "low" }),
    );
    // (0.85 * 100) / 1 = 85.
    expect(result.optionAExpectedValue).toBe(85);
  });

  it("reversibility never changes the expected-value number itself, only the guidance", () => {
    const twoWay = scoreBetterDecisionMaker(baseInput({ optionAReversibility: "two_way_door" }));
    const oneWay = scoreBetterDecisionMaker(baseInput({ optionAReversibility: "one_way_door" }));
    expect(twoWay.optionAExpectedValue).toBe(oneWay.optionAExpectedValue);
  });
});

describe("scoreBetterDecisionMaker — recommendation and confidence", () => {
  it("a large, clear gap recommends the stronger option with 'clear' confidence", () => {
    const result = scoreBetterDecisionMaker(
      baseInput({
        optionALikelihood: "high",
        optionAImpact: "large",
        optionAEffort: "low", // EV 85
        optionBLikelihood: "low",
        optionBImpact: "small",
        optionBEffort: "high", // EV 3
      }),
    );
    expect(result.recommendation).toBe("option_a");
    expect(result.confidence).toBe("clear");
    expect(result.guidance).toContain("85");
    expect(result.guidance).toContain("3");
  });

  it("the same gap in reverse recommends option B", () => {
    const result = scoreBetterDecisionMaker(
      baseInput({
        optionALikelihood: "low",
        optionAImpact: "small",
        optionAEffort: "high",
        optionBLikelihood: "high",
        optionBImpact: "large",
        optionBEffort: "low",
      }),
    );
    expect(result.recommendation).toBe("option_b");
    expect(result.confidence).toBe("clear");
  });

  it("identical options are always too close to call, with 'close' confidence", () => {
    const result = scoreBetterDecisionMaker(baseInput());
    expect(result.optionAExpectedValue).toBe(result.optionBExpectedValue);
    expect(result.recommendation).toBe("too_close_to_call");
    expect(result.confidence).toBe("close");
  });
});

describe("scoreBetterDecisionMaker — next step is driven by reversibility, not just the score", () => {
  it("recommends gathering more evidence when the winning option is a one-way door", () => {
    const result = scoreBetterDecisionMaker(
      baseInput({
        optionALikelihood: "high",
        optionAImpact: "large",
        optionAEffort: "low",
        optionAReversibility: "one_way_door",
        optionBLikelihood: "low",
        optionBImpact: "small",
        optionBEffort: "high",
      }),
    );
    expect(result.recommendation).toBe("option_a");
    expect(result.nextStep.toLowerCase()).toContain("gathered real evidence");
  });

  it("recommends just trying it when the winning option is a two-way door", () => {
    const result = scoreBetterDecisionMaker(
      baseInput({
        optionALikelihood: "high",
        optionAImpact: "large",
        optionAEffort: "low",
        optionAReversibility: "two_way_door",
        optionBLikelihood: "low",
        optionBImpact: "small",
        optionBEffort: "high",
      }),
    );
    expect(result.recommendation).toBe("option_a");
    expect(result.nextStep.toLowerCase()).toContain("just try it");
  });

  it.each([
    ["two_way_door", "one_way_door", "just try the reversible one"],
    ["one_way_door", "two_way_door", "just try the reversible one"],
    ["one_way_door", "one_way_door", "gather more evidence"],
  ] as [Reversibility, Reversibility, string][])(
    "on a close call, A=%s / B=%s leads to next step containing '%s'",
    (optionAReversibility, optionBReversibility, expectedFragment) => {
      const result = scoreBetterDecisionMaker(baseInput({ optionAReversibility, optionBReversibility }));
      expect(result.recommendation).toBe("too_close_to_call");
      expect(result.nextStep.toLowerCase()).toContain(expectedFragment);
    },
  );
});

describe("scoreBetterDecisionMaker — determinism", () => {
  it("the same input always produces the same result", () => {
    const input = baseInput({ optionALikelihood: "high", optionBEffort: "high" });
    expect(scoreBetterDecisionMaker(input)).toEqual(scoreBetterDecisionMaker(input));
  });
});
