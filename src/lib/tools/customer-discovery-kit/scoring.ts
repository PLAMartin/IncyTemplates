import type {
  BiasRisk,
  CommitmentSignal,
  CustomerDiscoveryEvidenceInput,
  CustomerDiscoveryEvidenceResult,
  EvidenceType,
  InterviewCount,
  PatternConsistency,
  QuestionStyle,
  SignalStrength,
} from "./schema";

/**
 * Deterministic scoring for the Customer Discovery Kit Evidence Analyser (spec v3 §37). No
 * AI is involved, mirroring [[0016-product-idea-assessor-tool-deterministic-only]] — every
 * number here comes from a fixed lookup table, a weighted sum, or a cap, so the same input
 * always produces the same result and every branch is unit-testable.
 *
 * Unlike the Product Idea Assessor (a weighted sum with per-classification weights), this
 * tool's `questionStyle` dimension isn't just one more weighted input — leading questions
 * genuinely invalidate the rest of the evidence, so it acts as a cap on the weighted score
 * from the other four dimensions rather than being averaged in with them. See
 * `QUESTION_STYLE_CAP` below.
 */

type DimensionKey = "interviewCount" | "evidenceType" | "commitmentSignal" | "patternConsistency";

const INTERVIEW_COUNT_SCORE: Record<InterviewCount, number> = {
  fewer_than_3: 0,
  three_to_five: 50,
  six_to_ten: 80,
  more_than_ten: 100,
};

const EVIDENCE_TYPE_SCORE: Record<EvidenceType, number> = {
  opinions_only: 0,
  some_past_behaviour: 55,
  consistent_past_behaviour: 100,
};

const COMMITMENT_SIGNAL_SCORE: Record<CommitmentSignal, number> = {
  no_commitment: 0,
  workaround_or_effort: 60,
  money_or_switching_cost: 100,
};

const PATTERN_CONSISTENCY_SCORE: Record<PatternConsistency, number> = {
  no_pattern: 0,
  partial_pattern: 50,
  strong_pattern: 100,
};

// Each dimension weight (sums to 1) reflects how much it matters once questions are actually
// open — evidence type and commitment (what people actually do, not what they say) carry the
// most weight, straight from the interview-technique guide's "past not future" principle.
const DIMENSION_WEIGHTS: Record<DimensionKey, number> = {
  interviewCount: 0.2,
  evidenceType: 0.3,
  commitmentSignal: 0.3,
  patternConsistency: 0.2,
};

/** The ceiling the weighted score can't exceed, keyed by how leading the questions were. */
const QUESTION_STYLE_CAP: Record<QuestionStyle, number> = {
  mostly_leading: 40,
  mixed: 85,
  mostly_open: 100,
};

const QUESTION_STYLE_BIAS_RISK: Record<QuestionStyle, BiasRisk> = {
  mostly_leading: "high",
  mixed: "moderate",
  mostly_open: "low",
};

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  interviewCount: "Number of interviews",
  evidenceType: "Evidence type",
  commitmentSignal: "Commitment signal",
  patternConsistency: "Pattern consistency",
};

const DIMENSION_UNCERTAINTY: Record<DimensionKey, string> = {
  interviewCount: "Whether you've spoken to enough people for a pattern to mean anything yet.",
  evidenceType:
    "Whether what you heard was a real memory of past behaviour, or just a polite opinion about a hypothetical future.",
  commitmentSignal:
    "Whether anyone has actually paid, switched, or built a workaround, or whether the interest is still just talk.",
  patternConsistency: "Whether the interviews are converging on the same problem, or still telling you something different every time.",
};

const DIMENSION_NEXT_ACTION: Record<DimensionKey, string> = {
  interviewCount: "Line up a few more interviews before drawing any conclusion — a pattern in two or three conversations isn't a pattern yet.",
  evidenceType: "In your next interview, ask about the last time they dealt with this problem, not whether they'd use your solution.",
  commitmentSignal: "Go looking for a costly workaround people already use — money spent, time invested, or a switch already made.",
  patternConsistency: "Write down what surprised you straight after your next interview, and check it against what surprised you last time.",
};

const BIAS_UNCERTAINTY = "Whether the pattern you're seeing is real, or just people agreeing with the way your questions were framed.";

const BIAS_NEXT_ACTION =
  "Re-run your next few interviews without describing your idea first — get as far as you can into their situation before you mention what you're building, and save any forward-looking question for the very end.";

// Fixed iteration order so tied scores resolve deterministically (first in this list wins).
const DIMENSION_ORDER: DimensionKey[] = ["interviewCount", "evidenceType", "commitmentSignal", "patternConsistency"];

function dimensionScores(input: CustomerDiscoveryEvidenceInput): Record<DimensionKey, number> {
  return {
    interviewCount: INTERVIEW_COUNT_SCORE[input.interviewCount],
    evidenceType: EVIDENCE_TYPE_SCORE[input.evidenceType],
    commitmentSignal: COMMITMENT_SIGNAL_SCORE[input.commitmentSignal],
    patternConsistency: PATTERN_CONSISTENCY_SCORE[input.patternConsistency],
  };
}

function extremeDimension(scores: Record<DimensionKey, number>, direction: "max" | "min"): DimensionKey {
  return DIMENSION_ORDER.reduce((best, key) => {
    const better = direction === "max" ? scores[key] > scores[best] : scores[key] < scores[best];
    return better ? key : best;
  }, DIMENSION_ORDER[0]!);
}

function signalStrength(score: number): SignalStrength {
  if (score >= 70) return "strong_signal";
  if (score >= 40) return "mixed_signal";
  return "weak_signal";
}

export function scoreCustomerDiscoveryEvidence(input: CustomerDiscoveryEvidenceInput): CustomerDiscoveryEvidenceResult {
  const scores = dimensionScores(input);
  const weightedScore = DIMENSION_ORDER.reduce((total, key) => total + scores[key] * DIMENSION_WEIGHTS[key], 0);
  const cap = QUESTION_STYLE_CAP[input.questionStyle];
  const evidenceStrengthScore = Math.round(Math.min(weightedScore, cap));

  const biasRisk = QUESTION_STYLE_BIAS_RISK[input.questionStyle];
  const strongestKey = extremeDimension(scores, "max");
  const weakestKey = extremeDimension(scores, "min");

  return {
    evidenceStrengthScore,
    signalStrength: signalStrength(evidenceStrengthScore),
    biasRisk,
    strongestArea: DIMENSION_LABELS[strongestKey],
    weakestArea: DIMENSION_LABELS[weakestKey],
    biggestUncertainty: biasRisk === "high" ? BIAS_UNCERTAINTY : DIMENSION_UNCERTAINTY[weakestKey],
    nextEvidenceAction: biasRisk === "high" ? BIAS_NEXT_ACTION : DIMENSION_NEXT_ACTION[weakestKey],
  };
}
