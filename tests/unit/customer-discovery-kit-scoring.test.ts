import { describe, expect, it } from "vitest";
import { scoreCustomerDiscoveryEvidence } from "@/lib/tools/customer-discovery-kit/scoring";
import type { CustomerDiscoveryEvidenceInput, QuestionStyle } from "@/lib/tools/customer-discovery-kit/schema";

const worstCase = (questionStyle: QuestionStyle): CustomerDiscoveryEvidenceInput => ({
  interviewCount: "fewer_than_3",
  questionStyle,
  evidenceType: "opinions_only",
  commitmentSignal: "no_commitment",
  patternConsistency: "no_pattern",
});

const bestCase = (questionStyle: QuestionStyle): CustomerDiscoveryEvidenceInput => ({
  interviewCount: "more_than_ten",
  questionStyle,
  evidenceType: "consistent_past_behaviour",
  commitmentSignal: "money_or_switching_cost",
  patternConsistency: "strong_pattern",
});

describe("scoreCustomerDiscoveryEvidence — boundary conditions", () => {
  it.each(["mostly_leading", "mixed", "mostly_open"] as const)(
    "an all-worst-case round scores 0 and reads as weak_signal regardless of question style (%s)",
    (questionStyle) => {
      const result = scoreCustomerDiscoveryEvidence(worstCase(questionStyle));
      expect(result.evidenceStrengthScore).toBe(0);
      expect(result.signalStrength).toBe("weak_signal");
    },
  );

  it("an all-best-case round with open questions scores 100 and reads as a strong signal", () => {
    const result = scoreCustomerDiscoveryEvidence(bestCase("mostly_open"));
    expect(result.evidenceStrengthScore).toBe(100);
    expect(result.signalStrength).toBe("strong_signal");
    expect(result.biasRisk).toBe("low");
  });
});

describe("scoreCustomerDiscoveryEvidence — leading questions cap the score, not just penalise it", () => {
  it("an otherwise-perfect round drops from strong to mixed signal once questions are mostly leading", () => {
    const open = scoreCustomerDiscoveryEvidence(bestCase("mostly_open"));
    const leading = scoreCustomerDiscoveryEvidence(bestCase("mostly_leading"));

    expect(open.evidenceStrengthScore).toBe(100);
    // Capped at 40 regardless of how strong the other four dimensions are.
    expect(leading.evidenceStrengthScore).toBe(40);
    expect(leading.signalStrength).toBe("mixed_signal");
    expect(leading.biasRisk).toBe("high");
  });

  it("a mixed question style caps the score below what open questions would allow", () => {
    const open = scoreCustomerDiscoveryEvidence(bestCase("mostly_open"));
    const mixed = scoreCustomerDiscoveryEvidence(bestCase("mixed"));

    expect(mixed.evidenceStrengthScore).toBe(85);
    expect(mixed.evidenceStrengthScore).toBeLessThan(open.evidenceStrengthScore);
    expect(mixed.signalStrength).toBe("strong_signal");
    expect(mixed.biasRisk).toBe("moderate");
  });

  it("high bias risk overrides the weakest-dimension explanation with a question-style-specific one", () => {
    // interviewCount is objectively the weakest dimension here, but a high bias risk should
    // still take over the uncertainty/next-action text, because it matters more.
    const result = scoreCustomerDiscoveryEvidence({
      interviewCount: "fewer_than_3",
      questionStyle: "mostly_leading",
      evidenceType: "consistent_past_behaviour",
      commitmentSignal: "money_or_switching_cost",
      patternConsistency: "strong_pattern",
    });

    expect(result.weakestArea).toBe("Number of interviews");
    expect(result.biggestUncertainty.toLowerCase()).toContain("questions were framed");
    expect(result.nextEvidenceAction.toLowerCase()).toContain("without describing your idea first");
  });
});

describe("scoreCustomerDiscoveryEvidence — strongest/weakest never contradict their own sub-scores", () => {
  it("identifies the single weakest dimension and derives uncertainty/next-action from it when bias risk is low", () => {
    const result = scoreCustomerDiscoveryEvidence({
      interviewCount: "more_than_ten", // strongest (100)
      questionStyle: "mostly_open",
      evidenceType: "opinions_only", // weakest (0)
      commitmentSignal: "workaround_or_effort",
      patternConsistency: "partial_pattern",
    });

    expect(result.strongestArea).toBe("Number of interviews");
    expect(result.weakestArea).toBe("Evidence type");
    expect(result.biggestUncertainty.toLowerCase()).toContain("real memory of past behaviour");
    expect(result.nextEvidenceAction.toLowerCase()).toContain("last time they dealt with this problem");
  });

  it("breaks ties deterministically (same input always produces the same result)", () => {
    const input: CustomerDiscoveryEvidenceInput = {
      interviewCount: "six_to_ten",
      questionStyle: "mixed",
      evidenceType: "some_past_behaviour",
      commitmentSignal: "workaround_or_effort",
      patternConsistency: "partial_pattern",
    };
    const first = scoreCustomerDiscoveryEvidence(input);
    const second = scoreCustomerDiscoveryEvidence(input);
    expect(first).toEqual(second);
  });
});

describe("scoreCustomerDiscoveryEvidence — bias risk always mirrors question style", () => {
  it.each([
    ["mostly_leading", "high"],
    ["mixed", "moderate"],
    ["mostly_open", "low"],
  ] as const)("questionStyle %s maps to biasRisk %s", (questionStyle, expectedBiasRisk) => {
    const result = scoreCustomerDiscoveryEvidence(bestCase(questionStyle));
    expect(result.biasRisk).toBe(expectedBiasRisk);
  });
});
