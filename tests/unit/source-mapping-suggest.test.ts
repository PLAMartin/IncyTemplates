import { describe, expect, it } from "vitest";
import { suggestUses } from "@/lib/source-mapping/suggest";
import type { ReuseComponentScores } from "@/lib/source-mapping/schema";

function scores(overrides: Partial<ReuseComponentScores> = {}): ReuseComponentScores {
  return { problem: 0, actionability: 0, repeatability: 0, structure: 0, automation: 0, ...overrides };
}

describe("suggestUses", () => {
  it("suggests source_only for a 0-4 total", () => {
    expect(suggestUses(scores({ problem: 2, actionability: 1, repeatability: 1 }), false)).toEqual(["source_only"]);
  });

  it("suggests template for a 5-6 total", () => {
    expect(suggestUses(scores({ problem: 2, actionability: 2, repeatability: 1 }), false)).toEqual(["template"]);
    expect(suggestUses(scores({ problem: 2, actionability: 2, repeatability: 2 }), false)).toEqual(["template"]);
  });

  it("suggests template only at 7-8 when structure+automation don't clear the bar", () => {
    // total = 8, structure(1) + automation(1) = 2 < 3
    expect(suggestUses(scores({ problem: 2, actionability: 2, repeatability: 2, structure: 1, automation: 1 }), false)).toEqual(
      ["template"],
    );
  });

  it("suggests template + tool at 7-8 when structure+automation clear the bar", () => {
    // total = 8, structure(2) + automation(1) = 3
    expect(suggestUses(scores({ problem: 2, actionability: 1, repeatability: 2, structure: 2, automation: 1 }), false)).toEqual(
      ["template", "tool"],
    );
  });

  it("suggests tool only at 9-10 when structure is not a full 2", () => {
    // total = 9, structure = 1 (structure=0 can never reach 9-10: the other four components
    // max out at 8, so a 9-10 total always requires structure >= 1)
    expect(suggestUses(scores({ problem: 2, actionability: 2, repeatability: 2, structure: 1, automation: 2 }), false)).toEqual(
      ["tool"],
    );
  });

  it("suggests tool + template at 9-10 when structure is a full 2", () => {
    // total = 9, structure = 2
    expect(suggestUses(scores({ problem: 2, actionability: 1, repeatability: 2, structure: 2, automation: 2 }), false)).toEqual(
      ["tool", "template"],
    );
  });

  it("adds guide whenever hasTeachableMethod is true, regardless of score band", () => {
    // Low score (source_only band) still gets a Guide suggestion on top.
    expect(suggestUses(scores({ problem: 1 }), true)).toEqual(["source_only", "guide"]);
    // High score (tool band) also gets Guide added.
    expect(
      suggestUses(scores({ problem: 2, actionability: 2, repeatability: 2, structure: 2, automation: 2 }), true),
    ).toEqual(["tool", "template", "guide"]);
  });

  it("does not duplicate guide if it were somehow already present", () => {
    const uses = suggestUses(scores({ problem: 1 }), true);
    expect(uses.filter((u) => u === "guide")).toHaveLength(1);
  });
});
