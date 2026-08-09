import { describe, expect, it } from "vitest";
import { scoreProductIdeaAssessor } from "@/lib/tools/product-idea-assessor/scoring";
import type { ProductIdeaAssessorInput } from "@/lib/tools/product-idea-assessor/schema";

const worstCase = (classification: ProductIdeaAssessorInput["classification"]): ProductIdeaAssessorInput => ({
  classification,
  behaviourEvidence: "none",
  problemEvidence: "assumed",
  differentiationClarity: "unclear",
  targetSpecificity: "broad",
});

const bestCase = (classification: ProductIdeaAssessorInput["classification"]): ProductIdeaAssessorInput => ({
  classification,
  behaviourEvidence: "committed",
  problemEvidence: "validated",
  differentiationClarity: "clear",
  targetSpecificity: "specific",
});

describe("scoreProductIdeaAssessor — boundary conditions", () => {
  it.each(["copy", "improve", "differentiate"] as const)(
    "an all-worst-case %s idea scores 0 and pauses",
    (classification) => {
      const result = scoreProductIdeaAssessor(worstCase(classification));
      expect(result.evidenceQualityScore).toBe(0);
      expect(result.overallReadiness).toBe("high_risk_pause");
    },
  );

  it.each(["copy", "improve", "differentiate"] as const)(
    "an all-best-case %s idea scores 100 and is ready to proceed",
    (classification) => {
      const result = scoreProductIdeaAssessor(bestCase(classification));
      expect(result.evidenceQualityScore).toBe(100);
      expect(result.overallReadiness).toBe("ready_to_proceed");
    },
  );
});

describe("scoreProductIdeaAssessor — classification changes the required evidence bar", () => {
  it("the same mixed evidence reads as ready for Copy but not-ready for Differentiate", () => {
    const mixedEvidence = {
      behaviourEvidence: "observed",
      problemEvidence: "some_conversations",
      differentiationClarity: "some",
      targetSpecificity: "somewhat_specific",
    } as const;

    const copy = scoreProductIdeaAssessor({ classification: "copy", ...mixedEvidence });
    const differentiate = scoreProductIdeaAssessor({ classification: "differentiate", ...mixedEvidence });

    // Same raw evidence inputs, different classification -> different readiness threshold.
    expect(copy.overallReadiness).toBe("ready_to_proceed");
    expect(differentiate.overallReadiness).not.toBe("ready_to_proceed");
  });

  it("Copy's threshold is easier to clear than Differentiate's at every readiness band", () => {
    // A mid evidence profile clears Copy's "ready" bar (40) but not Differentiate's (70).
    const midEvidence = {
      behaviourEvidence: "observed", // 65
      problemEvidence: "some_conversations", // 50
      differentiationClarity: "some", // 50
      targetSpecificity: "somewhat_specific", // 50
    } as const;
    const copy = scoreProductIdeaAssessor({ classification: "copy", ...midEvidence });
    const improve = scoreProductIdeaAssessor({ classification: "improve", ...midEvidence });
    const differentiate = scoreProductIdeaAssessor({ classification: "differentiate", ...midEvidence });

    expect(copy.overallReadiness).toBe("ready_to_proceed");
    expect(improve.overallReadiness).toBe("gather_more_evidence");
    expect(differentiate.overallReadiness).toBe("gather_more_evidence");
  });
});

describe("scoreProductIdeaAssessor — strongest/weakest never contradict their own sub-scores", () => {
  it("identifies the single weakest dimension and derives uncertainty/next-action from it", () => {
    const result = scoreProductIdeaAssessor({
      classification: "differentiate",
      behaviourEvidence: "none", // weakest (0)
      problemEvidence: "validated", // strongest (100)
      differentiationClarity: "some",
      targetSpecificity: "somewhat_specific",
    });

    expect(result.strongestArea).toBe("Problem evidence");
    expect(result.weakestArea).toBe("Behaviour evidence");
    // biggestUncertainty/nextEvidenceAction must be about the same weak dimension, not some
    // other one — checked via a shared keyword rather than exact string coupling.
    expect(result.biggestUncertainty.toLowerCase()).toContain("trying to solve this problem");
    expect(result.nextEvidenceAction.toLowerCase()).toContain("manual, ad-hoc or ugly version");
  });

  it("breaks ties deterministically (same input always produces the same result)", () => {
    const input: ProductIdeaAssessorInput = {
      classification: "improve",
      behaviourEvidence: "observed",
      problemEvidence: "some_conversations",
      differentiationClarity: "some",
      targetSpecificity: "somewhat_specific",
    };
    const first = scoreProductIdeaAssessor(input);
    const second = scoreProductIdeaAssessor(input);
    expect(first).toEqual(second);
  });
});

describe("scoreProductIdeaAssessor — result always reports the input classification back", () => {
  it.each(["copy", "improve", "differentiate"] as const)("echoes %s unchanged", (classification) => {
    const result = scoreProductIdeaAssessor(bestCase(classification));
    expect(result.classification).toBe(classification);
  });
});
