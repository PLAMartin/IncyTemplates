import type {
  BetterDecisionMakerInput,
  BetterDecisionMakerResult,
  Confidence,
  Effort,
  Impact,
  Likelihood,
  Recommendation,
  Reversibility,
} from "./schema";

/**
 * Deterministic scoring for the Better Decision Maker Expected Value Comparator (spec v3
 * §37). No AI is involved, mirroring [[0016-product-idea-assessor-tool-deterministic-only]]
 * — every number here comes from a fixed lookup table or a formula, so the same input
 * always produces the same result and every branch is unit-testable.
 *
 * Expected value per option is estimated as (likelihood x impact) / effort — a genuinely
 * different mechanic from both earlier Tools' single-subject weighted sums, because this
 * one compares two options rather than scoring one. Reversibility isn't part of the
 * expected-value number at all; it only decides the *guidance* once the two numbers are in
 * (see `guidanceFor` below), straight from the guide's "let reversibility break a close
 * call" technique.
 */

const LIKELIHOOD_SCORE: Record<Likelihood, number> = { low: 25, medium: 55, high: 85 };
const IMPACT_SCORE: Record<Impact, number> = { small: 25, moderate: 60, large: 100 };
const EFFORT_DIVISOR: Record<Effort, number> = { low: 1, medium: 1.4, high: 2 };

// Below this point-gap, treat the two options as statistically indistinguishable rather
// than picking a "winner" on numbers this close.
const CLOSE_CALL_THRESHOLD = 8;

const GATHER_MORE_EVIDENCE_NEXT_STEP =
  "Before committing, make sure you've gathered real evidence — Product Idea Assessor or Customer Discovery Kit can help you check.";
const TRY_IT_NEXT_STEP = "It's a two-way door — the fastest way to learn is to just try it and see what actually happens.";
const CLOSE_CALL_TRY_REVERSIBLE_NEXT_STEP = "Just try the reversible one — you'll learn more from doing it than from more analysis.";
const CLOSE_CALL_GATHER_EVIDENCE_NEXT_STEP =
  "Go gather more evidence before committing to either option — the numbers alone won't decide this for you.";

type OptionInput = { likelihood: Likelihood; impact: Impact; effort: Effort; reversibility: Reversibility };

function optionA(input: BetterDecisionMakerInput): OptionInput {
  return {
    likelihood: input.optionALikelihood,
    impact: input.optionAImpact,
    effort: input.optionAEffort,
    reversibility: input.optionAReversibility,
  };
}

function optionB(input: BetterDecisionMakerInput): OptionInput {
  return {
    likelihood: input.optionBLikelihood,
    impact: input.optionBImpact,
    effort: input.optionBEffort,
    reversibility: input.optionBReversibility,
  };
}

function expectedValue(option: OptionInput): number {
  const raw = (LIKELIHOOD_SCORE[option.likelihood] / 100) * IMPACT_SCORE[option.impact] / EFFORT_DIVISOR[option.effort];
  return Math.round(raw);
}

function recommendationFor(optionAEV: number, optionBEV: number): { recommendation: Recommendation; confidence: Confidence } {
  const diff = optionAEV - optionBEV;
  if (Math.abs(diff) < CLOSE_CALL_THRESHOLD) {
    return { recommendation: "too_close_to_call", confidence: "close" };
  }
  return { recommendation: diff > 0 ? "option_a" : "option_b", confidence: "clear" };
}

function guidanceFor(recommendation: Recommendation, optionAEV: number, optionBEV: number): string {
  if (recommendation === "option_a") return `Option A's expected value (${optionAEV}) clearly outweighs Option B's (${optionBEV}).`;
  if (recommendation === "option_b") return `Option B's expected value (${optionBEV}) clearly outweighs Option A's (${optionAEV}).`;
  return `Option A (${optionAEV}) and Option B (${optionBEV}) are close enough that the numbers alone shouldn't decide this.`;
}

function nextStepFor(recommendation: Recommendation, a: OptionInput, b: OptionInput): string {
  if (recommendation === "option_a") return a.reversibility === "one_way_door" ? GATHER_MORE_EVIDENCE_NEXT_STEP : TRY_IT_NEXT_STEP;
  if (recommendation === "option_b") return b.reversibility === "one_way_door" ? GATHER_MORE_EVIDENCE_NEXT_STEP : TRY_IT_NEXT_STEP;
  const eitherReversible = a.reversibility === "two_way_door" || b.reversibility === "two_way_door";
  return eitherReversible ? CLOSE_CALL_TRY_REVERSIBLE_NEXT_STEP : CLOSE_CALL_GATHER_EVIDENCE_NEXT_STEP;
}

export function scoreBetterDecisionMaker(input: BetterDecisionMakerInput): BetterDecisionMakerResult {
  const a = optionA(input);
  const b = optionB(input);
  const optionAExpectedValue = expectedValue(a);
  const optionBExpectedValue = expectedValue(b);
  const { recommendation, confidence } = recommendationFor(optionAExpectedValue, optionBExpectedValue);

  return {
    optionAExpectedValue,
    optionBExpectedValue,
    recommendation,
    confidence,
    guidance: guidanceFor(recommendation, optionAExpectedValue, optionBExpectedValue),
    nextStep: nextStepFor(recommendation, a, b),
  };
}
