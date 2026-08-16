import { describe, expect, it } from "vitest";
import { checkStickyPitch } from "@/lib/tools/sticky-pitch-checker/scoring";
import type { StickyPitchCheckerInput } from "@/lib/tools/sticky-pitch-checker/schema";

function input(overrides: Partial<StickyPitchCheckerInput> = {}): StickyPitchCheckerInput {
  return {
    simple: "already_there",
    unexpected: "already_there",
    concrete: "already_there",
    credible: "already_there",
    emotional: "already_there",
    story: "already_there",
    socialCurrency: "already_there",
    triggers: "already_there",
    public: "already_there",
    practicalValue: "already_there",
    ...overrides,
  };
}

describe("checkStickyPitch — factor states reflect each answer", () => {
  it("marks a factor present when the visitor says it's already there", () => {
    const result = checkStickyPitch(input());
    expect(result.factorStates.every((s) => s.present)).toBe(true);
  });

  it("marks a factor absent when the visitor says it's not yet", () => {
    const result = checkStickyPitch(input({ credible: "not_yet" }));
    expect(result.factorStates.find((s) => s.factor === "credible")?.present).toBe(false);
  });

  it("returns all ten factors regardless of answers", () => {
    const result = checkStickyPitch(input());
    expect(result.factorStates).toHaveLength(10);
  });
});

describe("checkStickyPitch — stick/spread grouping", () => {
  it("groups the six SUCCESs factors under stick and the four remaining STEPPS factors under spread", () => {
    const result = checkStickyPitch(input());
    const stickFactors = result.factorStates.filter((s) => s.group === "stick").map((s) => s.factor);
    const spreadFactors = result.factorStates.filter((s) => s.group === "spread").map((s) => s.factor);
    expect(stickFactors).toEqual(["simple", "unexpected", "concrete", "credible", "emotional", "story"]);
    expect(spreadFactors).toEqual(["social_currency", "triggers", "public", "practical_value"]);
  });

  it("counts stick and spread factors independently, capped at 6 and 4", () => {
    const result = checkStickyPitch(input());
    expect(result.stickCount).toBe(6);
    expect(result.spreadCount).toBe(4);
  });

  it("a missing stick factor only reduces stickCount, not spreadCount", () => {
    const result = checkStickyPitch(input({ story: "not_yet" }));
    expect(result.stickCount).toBe(5);
    expect(result.spreadCount).toBe(4);
  });

  it("a missing spread factor only reduces spreadCount, not stickCount", () => {
    const result = checkStickyPitch(input({ triggers: "not_yet" }));
    expect(result.stickCount).toBe(6);
    expect(result.spreadCount).toBe(3);
  });
});

describe("checkStickyPitch — tip follows the source frameworks' own order", () => {
  it("gives the tip for the first missing factor in listed order, not the order answers were given", () => {
    const result = checkStickyPitch(input({ triggers: "not_yet", simple: "not_yet" }));
    const firstMissing = result.factorStates.find((s) => !s.present);
    expect(firstMissing?.factor).toBe("simple");
    expect(result.firstTip).toContain("Simple");
  });

  it("gives a distinct tip for a later factor when it's the only one missing", () => {
    const result = checkStickyPitch(input({ practicalValue: "not_yet" }));
    expect(result.firstTip).toContain("Practical Value");
  });

  it("gives the all-met tip when nothing is missing", () => {
    const result = checkStickyPitch(input());
    expect(result.firstTip).toContain("All ten factors are already there");
  });
});

describe("checkStickyPitch — result includes a closing note and next step", () => {
  it("returns a non-empty closing note and next step for every combination", () => {
    const result = checkStickyPitch(input({ unexpected: "not_yet" }));
    expect(result.closingNote.length).toBeGreaterThan(0);
    expect(result.nextStep.length).toBeGreaterThan(0);
  });
});

describe("checkStickyPitch — determinism", () => {
  it("the same input always produces the same result", () => {
    const sample = input({ public: "not_yet" });
    expect(checkStickyPitch(sample)).toEqual(checkStickyPitch(sample));
  });
});
