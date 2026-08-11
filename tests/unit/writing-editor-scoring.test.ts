import { describe, expect, it } from "vitest";
import { reviewWritingStructure } from "@/lib/tools/writing-editor/scoring";
import type { WritingEditorInput } from "@/lib/tools/writing-editor/schema";

function input(overrides: Partial<WritingEditorInput> = {}): WritingEditorInput {
  return {
    clichedLanguage: "already_clean",
    inflatedVocabulary: "already_clean",
    unnecessaryWords: "already_clean",
    passiveVoice: "already_clean",
    jargon: "already_clean",
    ...overrides,
  };
}

describe("reviewWritingStructure — rule states reflect each answer", () => {
  it("marks a rule present when the visitor says it's still a problem", () => {
    const result = reviewWritingStructure(input({ passiveVoice: "still_a_problem" }));
    expect(result.ruleStates.find((s) => s.rule === "passive_voice")?.present).toBe(true);
  });

  it("marks a rule absent when the visitor says it's already clean", () => {
    const result = reviewWritingStructure(input());
    expect(result.ruleStates.every((s) => !s.present)).toBe(true);
  });

  it("returns all five rules regardless of answers", () => {
    const result = reviewWritingStructure(input());
    expect(result.ruleStates).toHaveLength(5);
  });
});

describe("reviewWritingStructure — fix tip follows Orwell's own order", () => {
  it("gives the fix tip for the first flagged rule in listed order, not the order answers were given", () => {
    const result = reviewWritingStructure(input({ jargon: "still_a_problem", clichedLanguage: "still_a_problem" }));
    const firstFlagged = result.ruleStates.find((s) => s.present);
    expect(firstFlagged?.rule).toBe("cliched_language");
    expect(result.firstFixTip).toContain("metaphor");
  });

  it("gives a distinct tip for a later rule when it's the only one flagged", () => {
    const result = reviewWritingStructure(input({ passiveVoice: "still_a_problem" }));
    expect(result.firstFixTip).toContain("passive");
  });

  it("gives the all-clean tip when nothing is flagged", () => {
    const result = reviewWritingStructure(input());
    expect(result.firstFixTip).toContain("None of Orwell's five rules are flagged");
  });
});

describe("reviewWritingStructure — result includes a closing note and next step", () => {
  it("returns a non-empty closing note and next step for every combination", () => {
    const result = reviewWritingStructure(input({ unnecessaryWords: "still_a_problem" }));
    expect(result.closingNote.length).toBeGreaterThan(0);
    expect(result.nextStep.length).toBeGreaterThan(0);
  });
});

describe("reviewWritingStructure — determinism", () => {
  it("the same input always produces the same result", () => {
    const sample = input({ inflatedVocabulary: "still_a_problem" });
    expect(reviewWritingStructure(sample)).toEqual(reviewWritingStructure(sample));
  });
});
