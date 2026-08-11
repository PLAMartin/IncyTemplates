import { describe, expect, it } from "vitest";
import { generateLateralThinkingPrompts } from "@/lib/tools/lateral-thinking-toolkit/scoring";
import { lateralThinkingToolkitInputSchema } from "@/lib/tools/lateral-thinking-toolkit/schema";

describe("generateLateralThinkingPrompts — always generates all five techniques, no ranking", () => {
  it("returns exactly five prompt cards, one per technique, in a fixed order", () => {
    const result = generateLateralThinkingPrompts({ problemOrIdea: "our onboarding feels generic" });
    expect(result.prompts).toHaveLength(5);
    expect(result.prompts.map((p) => p.technique)).toEqual([
      "perceptual_change",
      "random_input",
      "provocation",
      "specificity",
      "scale",
    ]);
  });

  it("interpolates the visitor's own words into every prompt", () => {
    const result = generateLateralThinkingPrompts({ problemOrIdea: "our onboarding feels generic" });
    for (const card of result.prompts) {
      expect(card.promptText).toContain("our onboarding feels generic");
    }
  });

  it("has no recommended-candidate or ranking field — every card is equal", () => {
    const result = generateLateralThinkingPrompts({ problemOrIdea: "naming the app" });
    expect(result).not.toHaveProperty("recommendedTechnique");
    expect(result).not.toHaveProperty("runnerUp");
  });

  it("includes the volume-before-judgement encouragement and a next step", () => {
    const result = generateLateralThinkingPrompts({ problemOrIdea: "naming the app" });
    expect(result.encouragement.length).toBeGreaterThan(0);
    expect(result.nextStep.length).toBeGreaterThan(0);
  });
});

describe("lateralThinkingToolkitInputSchema — requires a non-blank problem", () => {
  it("rejects a blank problem", () => {
    const parsed = lateralThinkingToolkitInputSchema.safeParse({ problemOrIdea: "   " });
    expect(parsed.success).toBe(false);
  });

  it("accepts a non-blank problem", () => {
    const parsed = lateralThinkingToolkitInputSchema.safeParse({ problemOrIdea: "our onboarding feels generic" });
    expect(parsed.success).toBe(true);
  });
});

describe("generateLateralThinkingPrompts — determinism", () => {
  it("the same input always produces the same result", () => {
    const input = { problemOrIdea: "our pricing page converts badly" };
    expect(generateLateralThinkingPrompts(input)).toEqual(generateLateralThinkingPrompts(input));
  });
});
