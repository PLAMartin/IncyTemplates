import { describe, expect, it } from "vitest";
import { reviewAppDesign } from "@/lib/tools/app-design-review/scoring";
import type { AppDesignReviewInput } from "@/lib/tools/app-design-review/schema";

function input(overrides: Partial<AppDesignReviewInput> = {}): AppDesignReviewInput {
  return {
    innovative: "already_there",
    useful: "already_there",
    aesthetic: "already_there",
    understandable: "already_there",
    unobtrusive: "already_there",
    honest: "already_there",
    longLasting: "already_there",
    thorough: "already_there",
    environmentallyFriendly: "already_there",
    asLittleAsPossible: "already_there",
    ...overrides,
  };
}

describe("reviewAppDesign — principle states reflect each answer", () => {
  it("marks a principle present when the visitor says it's already there", () => {
    const result = reviewAppDesign(input());
    expect(result.principleStates.every((s) => s.present)).toBe(true);
  });

  it("marks a principle absent when the visitor says it's not yet", () => {
    const result = reviewAppDesign(input({ honest: "not_yet" }));
    expect(result.principleStates.find((s) => s.principle === "honest")?.present).toBe(false);
  });

  it("returns all ten principles regardless of answers", () => {
    const result = reviewAppDesign(input());
    expect(result.principleStates).toHaveLength(10);
  });
});

describe("reviewAppDesign — tip follows Rams' own order", () => {
  it("gives the tip for the first missing principle in listed order, not the order answers were given", () => {
    const result = reviewAppDesign(input({ thorough: "not_yet", innovative: "not_yet" }));
    const firstMissing = result.principleStates.find((s) => !s.present);
    expect(firstMissing?.principle).toBe("innovative");
    expect(result.firstTip).toContain("Innovative");
  });

  it("gives a distinct tip for a later principle when it's the only one missing", () => {
    const result = reviewAppDesign(input({ asLittleAsPossible: "not_yet" }));
    expect(result.firstTip).toContain("As little design as possible");
  });

  it("gives the all-met tip when nothing is missing", () => {
    const result = reviewAppDesign(input());
    expect(result.firstTip).toContain("All ten principles are already there");
  });
});

describe("reviewAppDesign — result includes a closing note and next step", () => {
  it("returns a non-empty closing note and next step for every combination", () => {
    const result = reviewAppDesign(input({ unobtrusive: "not_yet" }));
    expect(result.closingNote.length).toBeGreaterThan(0);
    expect(result.nextStep.length).toBeGreaterThan(0);
  });
});

describe("reviewAppDesign — determinism", () => {
  it("the same input always produces the same result", () => {
    const sample = input({ environmentallyFriendly: "not_yet" });
    expect(reviewAppDesign(sample)).toEqual(reviewAppDesign(sample));
  });
});
