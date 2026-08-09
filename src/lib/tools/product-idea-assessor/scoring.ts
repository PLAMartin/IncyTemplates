import type {
  BehaviourEvidence,
  Classification,
  DifferentiationClarity,
  OverallReadiness,
  ProblemEvidence,
  ProductIdeaAssessorInput,
  ProductIdeaAssessorResult,
  TargetSpecificity,
} from "./schema";

/**
 * Deterministic scoring for the Product Idea Assessor Tool (spec v3 §39.3). No AI is
 * involved (§39.2's "AI-assisted" tier is deferred, not built this milestone) — every
 * number here comes from a fixed lookup table or a weighted sum of them, so the same input
 * always produces the same result and every branch is unit-testable.
 *
 * The four evidence dimensions mirror the questions the paired Guide
 * (content/guides/product-idea-assessor.mdx) asks the reader to answer for themselves.
 */

type DimensionKey = "problemEvidence" | "behaviourEvidence" | "differentiationClarity" | "targetSpecificity";

const PROBLEM_EVIDENCE_SCORE: Record<ProblemEvidence, number> = {
  assumed: 0,
  some_conversations: 50,
  validated: 100,
};

const BEHAVIOUR_EVIDENCE_SCORE: Record<BehaviourEvidence, number> = {
  none: 0,
  anecdotal: 35,
  observed: 65,
  committed: 100,
};

const DIFFERENTIATION_CLARITY_SCORE: Record<DifferentiationClarity, number> = {
  unclear: 0,
  some: 50,
  clear: 100,
};

const TARGET_SPECIFICITY_SCORE: Record<TargetSpecificity, number> = {
  broad: 0,
  somewhat_specific: 50,
  specific: 100,
};

/**
 * Per-classification dimension weights (each row sums to 1). The Copy/Improve/Differentiate
 * classification isn't just a baseline risk band (see READINESS_THRESHOLDS below) — it also
 * changes which kind of evidence matters most, straight from the methods content: Copy
 * ideas live or die on whether the problem genuinely transfers to the new context; Improve
 * ideas live or die on whether the improvement is real and specific; Differentiate ideas
 * live or die on whether anyone is already trying to solve the problem for themselves.
 */
const DIMENSION_WEIGHTS: Record<Classification, Record<DimensionKey, number>> = {
  copy: { problemEvidence: 0.4, targetSpecificity: 0.3, behaviourEvidence: 0.15, differentiationClarity: 0.15 },
  improve: { differentiationClarity: 0.35, problemEvidence: 0.3, targetSpecificity: 0.2, behaviourEvidence: 0.15 },
  differentiate: { behaviourEvidence: 0.4, problemEvidence: 0.3, targetSpecificity: 0.2, differentiationClarity: 0.1 },
};

/**
 * Evidence-quality thresholds an idea needs to clear before it's "ready to proceed",
 * per classification — Copy needs the least, Differentiate needs the most (spec v3 §39.3 /
 * the methods content's "using the classification" section).
 */
const READINESS_THRESHOLDS: Record<Classification, { ready: number; gather: number }> = {
  copy: { ready: 40, gather: 20 },
  improve: { ready: 55, gather: 30 },
  differentiate: { ready: 70, gather: 40 },
};

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  problemEvidence: "Problem evidence",
  behaviourEvidence: "Behaviour evidence",
  differentiationClarity: "Differentiation clarity",
  targetSpecificity: "Target specificity",
};

const DIMENSION_UNCERTAINTY: Record<DimensionKey, string> = {
  problemEvidence: "Whether the problem you've identified is real and painful for people who aren't you.",
  behaviourEvidence:
    "Whether anyone is already trying to solve this problem for themselves, even in a clumsy or manual form.",
  differentiationClarity:
    "Whether your specific improvement actually resolves the weakness for people who aren't you.",
  targetSpecificity: "Whether the people you're picturing are specific enough to go and find and talk to.",
};

const DIMENSION_NEXT_ACTION: Record<DimensionKey, string> = {
  problemEvidence: "Have a handful of conversations to confirm the problem is real before doing anything else.",
  behaviourEvidence: "Go looking for the manual, ad-hoc or ugly version of this behaviour people already use.",
  differentiationClarity: "Write down, in one sentence, the specific weakness you're fixing and why your fix resolves it.",
  targetSpecificity: "Narrow your target user until you could name ten real people who fit the description.",
};

// Fixed iteration order so tied scores resolve deterministically (first in this list wins).
const DIMENSION_ORDER: DimensionKey[] = [
  "problemEvidence",
  "behaviourEvidence",
  "differentiationClarity",
  "targetSpecificity",
];

function dimensionScores(input: ProductIdeaAssessorInput): Record<DimensionKey, number> {
  return {
    problemEvidence: PROBLEM_EVIDENCE_SCORE[input.problemEvidence],
    behaviourEvidence: BEHAVIOUR_EVIDENCE_SCORE[input.behaviourEvidence],
    differentiationClarity: DIFFERENTIATION_CLARITY_SCORE[input.differentiationClarity],
    targetSpecificity: TARGET_SPECIFICITY_SCORE[input.targetSpecificity],
  };
}

function readiness(classification: Classification, score: number): OverallReadiness {
  const { ready, gather } = READINESS_THRESHOLDS[classification];
  if (score >= ready) return "ready_to_proceed";
  if (score >= gather) return "gather_more_evidence";
  return "high_risk_pause";
}

function extremeDimension(scores: Record<DimensionKey, number>, direction: "max" | "min"): DimensionKey {
  return DIMENSION_ORDER.reduce((best, key) => {
    const better = direction === "max" ? scores[key] > scores[best] : scores[key] < scores[best];
    return better ? key : best;
  }, DIMENSION_ORDER[0]!);
}

export function scoreProductIdeaAssessor(input: ProductIdeaAssessorInput): ProductIdeaAssessorResult {
  const scores = dimensionScores(input);
  const weights = DIMENSION_WEIGHTS[input.classification];

  const evidenceQualityScore = Math.round(
    DIMENSION_ORDER.reduce((total, key) => total + scores[key] * weights[key], 0),
  );

  const strongestKey = extremeDimension(scores, "max");
  const weakestKey = extremeDimension(scores, "min");

  return {
    classification: input.classification,
    evidenceQualityScore,
    overallReadiness: readiness(input.classification, evidenceQualityScore),
    strongestArea: DIMENSION_LABELS[strongestKey],
    weakestArea: DIMENSION_LABELS[weakestKey],
    biggestUncertainty: DIMENSION_UNCERTAINTY[weakestKey],
    nextEvidenceAction: DIMENSION_NEXT_ACTION[weakestKey],
  };
}
