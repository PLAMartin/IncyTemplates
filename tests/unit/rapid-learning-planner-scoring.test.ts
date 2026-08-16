import { describe, expect, it } from "vitest";
import { checkRapidLearningPlan } from "@/lib/tools/rapid-learning-planner/scoring";
import { rapidLearningPlannerInputSchema } from "@/lib/tools/rapid-learning-planner/schema";
import type { RapidLearningPlannerInput } from "@/lib/tools/rapid-learning-planner/schema";

function input(overrides: Partial<RapidLearningPlannerInput> = {}): RapidLearningPlannerInput {
  return { deconstruction: "", selection: "", sequencing: "", stakes: "", ...overrides };
}

describe("checkRapidLearningPlan — presence detection", () => {
  it("marks a filled step as present and echoes its text", () => {
    const result = checkRapidLearningPlan(input({ deconstruction: "Prompting, debugging, iterating, workflows." }));
    const deconstruction = result.steps.find((s) => s.step === "deconstruction")!;
    expect(deconstruction.present).toBe(true);
    expect(deconstruction.text).toBe("Prompting, debugging, iterating, workflows.");
  });

  it("marks a blank step as not planned", () => {
    const result = checkRapidLearningPlan(input({ deconstruction: "Prompting, debugging, iterating, workflows." }));
    const selection = result.steps.find((s) => s.step === "selection")!;
    expect(selection.present).toBe(false);
    expect(selection.text).toBe("");
  });

  it("returns all four steps in fixed DSSS order regardless of which are filled", () => {
    const result = checkRapidLearningPlan(input({ stakes: "Weekly public updates." }));
    expect(result.steps.map((s) => s.step)).toEqual(["deconstruction", "selection", "sequencing", "stakes"]);
  });
});

describe("checkRapidLearningPlan — tip targets the first missing step", () => {
  it("tips on 'selection' when deconstruction is filled but selection is not", () => {
    const result = checkRapidLearningPlan(input({ deconstruction: "Prompting, debugging, iterating." }));
    expect(result.nextTip).toContain("20%");
  });

  it("tips on 'deconstruction' when nothing is filled in yet except a later step", () => {
    const result = checkRapidLearningPlan(input({ stakes: "Weekly public updates." }));
    expect(result.nextTip).toContain("smaller, independent parts");
  });

  it("gives a completion message when all four steps are present", () => {
    const result = checkRapidLearningPlan(
      input({
        deconstruction: "Prompting, debugging, iterating, workflows.",
        selection: "Rapid prototyping and debugging.",
        sequencing: "Prompting, then iteration, then debugging, then automation.",
        stakes: "Weekly public updates.",
      }),
    );
    expect(result.nextTip).toContain("All four steps are planned");
  });
});

describe("checkRapidLearningPlan — plan summary assembly", () => {
  it("only includes present steps, labelled, in fixed order", () => {
    const result = checkRapidLearningPlan(input({ deconstruction: "Break it down.", stakes: "Weekly updates." }));
    expect(result.planSummary).toBe("Deconstruction: Break it down.\nStakes: Weekly updates.");
  });
});

describe("rapidLearningPlannerInputSchema — at least one step required", () => {
  it("rejects input where every field is blank", () => {
    const parsed = rapidLearningPlannerInputSchema.safeParse({ deconstruction: "  ", selection: "", sequencing: "", stakes: "" });
    expect(parsed.success).toBe(false);
  });

  it("accepts input with exactly one non-blank field", () => {
    const parsed = rapidLearningPlannerInputSchema.safeParse({ deconstruction: "Break it down.", selection: "", sequencing: "", stakes: "" });
    expect(parsed.success).toBe(true);
  });
});

describe("checkRapidLearningPlan — determinism", () => {
  it("the same input always produces the same result", () => {
    const sample = input({ deconstruction: "Break it down.", selection: "Pick the 20%." });
    expect(checkRapidLearningPlan(sample)).toEqual(checkRapidLearningPlan(sample));
  });
});
