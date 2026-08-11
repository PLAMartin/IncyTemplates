import { describe, expect, it } from "vitest";
import { checkStoryStructure } from "@/lib/tools/story-builder/scoring";
import { storyBuilderInputSchema } from "@/lib/tools/story-builder/schema";
import type { StoryBuilderInput } from "@/lib/tools/story-builder/schema";

function input(overrides: Partial<StoryBuilderInput> = {}): StoryBuilderInput {
  return { place: "", action: "", thought: "", emotion: "", dialogue: "", ...overrides };
}

describe("checkStoryStructure — presence detection", () => {
  it("marks a filled field as present and echoes its text", () => {
    const result = checkStoryStructure(input({ place: "The lift hums as it carries me up." }));
    const place = result.elements.find((e) => e.element === "place")!;
    expect(place.present).toBe(true);
    expect(place.text).toBe("The lift hums as it carries me up.");
  });

  it("marks a blank field as missing", () => {
    const result = checkStoryStructure(input({ place: "The lift hums as it carries me up." }));
    const action = result.elements.find((e) => e.element === "action")!;
    expect(action.present).toBe(false);
    expect(action.text).toBe("");
  });

  it("returns all five elements in fixed order regardless of which are filled", () => {
    const result = checkStoryStructure(input({ dialogue: "\"Hello,\" she says." }));
    expect(result.elements.map((e) => e.element)).toEqual(["place", "action", "thought", "emotion", "dialogue"]);
  });
});

describe("checkStoryStructure — next tip targets the first missing element", () => {
  it("tips on 'action' when place is filled but action is not", () => {
    const result = checkStoryStructure(input({ place: "The airport." }));
    expect(result.nextTip).toContain("verbs");
  });

  it("tips on 'place' when nothing is filled in yet except a later element", () => {
    const result = checkStoryStructure(input({ dialogue: "\"Hello,\" she says." }));
    expect(result.nextTip).toContain("clear noun");
  });

  it("gives a completion message when all five are present", () => {
    const result = checkStoryStructure(
      input({
        place: "The airport.",
        action: "I shuffle my notes.",
        thought: "I'm in trouble.",
        emotion: "My hands shake.",
        dialogue: "\"You're early,\" she says.",
      }),
    );
    expect(result.nextTip).toContain("Every element is there");
  });
});

describe("checkStoryStructure — story spine assembly", () => {
  it("only includes present elements, labelled, in fixed order", () => {
    const result = checkStoryStructure(input({ place: "The airport.", dialogue: "\"Hello,\" she says." }));
    expect(result.storySpine).toBe('Place: The airport.\nDialogue: "Hello," she says.');
  });
});

describe("storyBuilderInputSchema — at least one element required", () => {
  it("rejects input where every field is blank", () => {
    const parsed = storyBuilderInputSchema.safeParse({ place: "  ", action: "", thought: "", emotion: "", dialogue: "" });
    expect(parsed.success).toBe(false);
  });

  it("accepts input with exactly one non-blank field", () => {
    const parsed = storyBuilderInputSchema.safeParse({ place: "The airport.", action: "", thought: "", emotion: "", dialogue: "" });
    expect(parsed.success).toBe(true);
  });
});

describe("checkStoryStructure — determinism", () => {
  it("the same input always produces the same result", () => {
    const sample = input({ place: "The airport.", thought: "I'm in trouble." });
    expect(checkStoryStructure(sample)).toEqual(checkStoryStructure(sample));
  });
});
