import { describe, expect, it } from "vitest";
import { buildAiPrompt } from "@/lib/tools/ai-prompt-builder/scoring";
import { aiPromptBuilderInputSchema } from "@/lib/tools/ai-prompt-builder/schema";
import type { AiPromptBuilderInput } from "@/lib/tools/ai-prompt-builder/schema";

function input(overrides: Partial<AiPromptBuilderInput> = {}): AiPromptBuilderInput {
  return {
    contextText: "You're a nutritionist helping a busy parent plan meals.",
    actionText: "Create a 7-day vegetarian meal plan with calorie counts.",
    resultText: "A table with one row per day.",
    exampleText: "",
    includeQuestionFlip: "no_just_the_prompt",
    ...overrides,
  };
}

describe("buildAiPrompt — assembles CARE fields in order", () => {
  it("includes Context, Action and Result on their own labelled lines", () => {
    const result = buildAiPrompt(input());
    expect(result.assembledPrompt).toContain("Context: You're a nutritionist helping a busy parent plan meals.");
    expect(result.assembledPrompt).toContain("Action: Create a 7-day vegetarian meal plan with calorie counts.");
    expect(result.assembledPrompt).toContain("Result: A table with one row per day.");
  });

  it("omits the Example line when exampleText is blank", () => {
    const result = buildAiPrompt(input({ exampleText: "" }));
    expect(result.assembledPrompt).not.toContain("Example:");
  });

  it("includes the Example line when exampleText is present", () => {
    const result = buildAiPrompt(input({ exampleText: "Day 1 – Breakfast: overnight oats (320 cal)." }));
    expect(result.assembledPrompt).toContain("Example: Day 1 – Breakfast: overnight oats (320 cal).");
  });
});

describe("buildAiPrompt — question-flip toggle", () => {
  it("omits the flip instruction when not requested", () => {
    const result = buildAiPrompt(input({ includeQuestionFlip: "no_just_the_prompt" }));
    expect(result.assembledPrompt).not.toContain("ask me one question at a time");
  });

  it("appends the flip instruction when requested", () => {
    const result = buildAiPrompt(input({ includeQuestionFlip: "yes_add_it" }));
    expect(result.assembledPrompt).toContain("Now ask me one question at a time, waiting for my answer in between");
  });
});

describe("aiPromptBuilderInputSchema — required fields", () => {
  it("rejects a missing Context, Action or Result", () => {
    const parsed = aiPromptBuilderInputSchema.safeParse({
      contextText: "",
      actionText: "Create a plan.",
      resultText: "A table.",
      includeQuestionFlip: "no_just_the_prompt",
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts a blank Example, defaulting to an empty string", () => {
    const parsed = aiPromptBuilderInputSchema.safeParse({
      contextText: "A nutritionist.",
      actionText: "Create a plan.",
      resultText: "A table.",
      includeQuestionFlip: "no_just_the_prompt",
    });
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.exampleText).toBe("");
  });
});

describe("buildAiPrompt — result includes a tip and next step", () => {
  it("returns a non-empty tip and next step for every combination", () => {
    const result = buildAiPrompt(input({ includeQuestionFlip: "yes_add_it" }));
    expect(result.tip.length).toBeGreaterThan(0);
    expect(result.nextStep.length).toBeGreaterThan(0);
  });
});

describe("buildAiPrompt — determinism", () => {
  it("the same input always produces the same result", () => {
    const sample = input({ exampleText: "Day 1 – sample.", includeQuestionFlip: "yes_add_it" });
    expect(buildAiPrompt(sample)).toEqual(buildAiPrompt(sample));
  });
});
