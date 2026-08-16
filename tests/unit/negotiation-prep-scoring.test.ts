import { describe, expect, it } from "vitest";
import { checkNegotiationPrep } from "@/lib/tools/negotiation-prep/scoring";
import { negotiationPrepInputSchema } from "@/lib/tools/negotiation-prep/schema";
import type { NegotiationPrepInput } from "@/lib/tools/negotiation-prep/schema";

function input(overrides: Partial<NegotiationPrepInput> = {}): NegotiationPrepInput {
  return { batna: "", anchor: "", mesos: "", ...overrides };
}

describe("checkNegotiationPrep — presence detection", () => {
  it("marks a filled field as present and echoes its text", () => {
    const result = checkNegotiationPrep(input({ batna: "Keep the current supplier for another year." }));
    const batna = result.tactics.find((t) => t.tactic === "batna")!;
    expect(batna.present).toBe(true);
    expect(batna.text).toBe("Keep the current supplier for another year.");
  });

  it("marks a blank field as not prepared", () => {
    const result = checkNegotiationPrep(input({ batna: "Keep the current supplier for another year." }));
    const anchor = result.tactics.find((t) => t.tactic === "anchor")!;
    expect(anchor.present).toBe(false);
    expect(anchor.text).toBe("");
  });

  it("returns all three tactics in fixed order regardless of which are filled", () => {
    const result = checkNegotiationPrep(input({ mesos: "Two offers, different trade-offs." }));
    expect(result.tactics.map((t) => t.tactic)).toEqual(["batna", "anchor", "mesos"]);
  });
});

describe("checkNegotiationPrep — next tip targets the first missing tactic", () => {
  it("tips on 'anchor' when batna is filled but anchor is not", () => {
    const result = checkNegotiationPrep(input({ batna: "Walk away and keep the incumbent." }));
    expect(result.nextTip).toContain("first number");
  });

  it("tips on 'batna' when nothing is filled in yet except a later tactic", () => {
    const result = checkNegotiationPrep(input({ mesos: "Two offers, different trade-offs." }));
    expect(result.nextTip).toContain("BATNA");
  });

  it("gives a completion message when all three are present", () => {
    const result = checkNegotiationPrep(
      input({
        batna: "Walk away and keep the incumbent.",
        anchor: "Open 25% below asking.",
        mesos: "Two offers, different trade-offs.",
      }),
    );
    expect(result.nextTip).toContain("All three tactics are prepared");
  });
});

describe("checkNegotiationPrep — prep summary assembly", () => {
  it("only includes present tactics, labelled, in fixed order", () => {
    const result = checkNegotiationPrep(input({ batna: "Walk away.", mesos: "Two offers." }));
    expect(result.prepSummary).toBe("Fallback (BATNA): Walk away.\nMultiple offers (MESOs): Two offers.");
  });
});

describe("negotiationPrepInputSchema — at least one tactic required", () => {
  it("rejects input where every field is blank", () => {
    const parsed = negotiationPrepInputSchema.safeParse({ batna: "  ", anchor: "", mesos: "" });
    expect(parsed.success).toBe(false);
  });

  it("accepts input with exactly one non-blank field", () => {
    const parsed = negotiationPrepInputSchema.safeParse({ batna: "Walk away.", anchor: "", mesos: "" });
    expect(parsed.success).toBe(true);
  });
});

describe("checkNegotiationPrep — determinism", () => {
  it("the same input always produces the same result", () => {
    const sample = input({ batna: "Walk away.", anchor: "Open 25% below asking." });
    expect(checkNegotiationPrep(sample)).toEqual(checkNegotiationPrep(sample));
  });
});
