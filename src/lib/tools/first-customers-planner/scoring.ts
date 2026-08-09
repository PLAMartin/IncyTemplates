import type { ChannelType, Fit, FirstCustomersPlannerInput, FirstCustomersPlannerResult, Rating } from "./schema";

/**
 * Deterministic scoring for the First Customers Planner Channel Selector (spec v3 §37). No
 * AI is involved, mirroring [[0016-product-idea-assessor-tool-deterministic-only]] — every
 * number here comes from a fixed lookup table or a weighted sum, so the same input always
 * produces the same result and every branch is unit-testable.
 *
 * `channelType` plays the same role Product Idea Assessor's `classification` did: it picks
 * which per-dimension weights apply, because which factor matters most genuinely differs by
 * channel (a cold-outreach channel lives or dies on audience presence and founder fit; an
 * existing-network channel is mostly about effort and repeatability, since who you already
 * know is a fixed, low-effort, low-repeat list). `effortToStart` is the one dimension scored
 * inverted — a *low*-effort channel contributes more, not less.
 */

type DimensionKey = "audiencePresence" | "founderFit" | "effortToStart" | "repeatability";

const RATING_SCORE: Record<Rating, number> = { low: 0, medium: 50, high: 100 };

const DIMENSION_WEIGHTS: Record<ChannelType, Record<DimensionKey, number>> = {
  cold_outreach: { audiencePresence: 0.35, founderFit: 0.3, effortToStart: 0.15, repeatability: 0.2 },
  content_marketing: { audiencePresence: 0.2, founderFit: 0.25, effortToStart: 0.25, repeatability: 0.3 },
  communities_and_forums: { audiencePresence: 0.4, founderFit: 0.25, effortToStart: 0.15, repeatability: 0.2 },
  existing_network: { audiencePresence: 0.15, founderFit: 0.1, effortToStart: 0.35, repeatability: 0.4 },
};

const FIT_STRONG_THRESHOLD = 65;
const FIT_WORTH_TESTING_THRESHOLD = 35;

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  audiencePresence: "Audience presence",
  founderFit: "Founder fit",
  effortToStart: "Effort to start",
  repeatability: "Repeatability",
};

const DIMENSION_UNCERTAINTY: Record<DimensionKey, string> = {
  audiencePresence: "Whether your target customers are actually spending time in this channel at all.",
  founderFit: "Whether you can actually operate this channel well, or whether it's a skill you don't have yet.",
  effortToStart: "Whether the time or cost to get a first real result here is more than you can sustain.",
  repeatability: "Whether this channel can produce a second and third customer the same way, or whether it's a one-off.",
};

const DIMENSION_NEXT_ACTION: Record<DimensionKey, string> = {
  audiencePresence: "Go find direct evidence of your target customers already active in this channel before investing further.",
  founderFit: "Either build the specific skill this channel needs, or bring in someone who already has it, before relying on it.",
  effortToStart: "Scope the smallest possible first attempt at this channel and see what a real result actually costs.",
  repeatability: "Run it a second time on purpose and check whether the result repeats, before treating it as your channel.",
};

// Fixed iteration order so tied scores resolve deterministically (first in this list wins).
const DIMENSION_ORDER: DimensionKey[] = ["audiencePresence", "founderFit", "effortToStart", "repeatability"];

function dimensionScores(input: FirstCustomersPlannerInput): Record<DimensionKey, number> {
  return {
    audiencePresence: RATING_SCORE[input.audiencePresence],
    founderFit: RATING_SCORE[input.founderFit],
    // Inverted: a low-effort channel contributes more than a high-effort one.
    effortToStart: 100 - RATING_SCORE[input.effortToStart],
    repeatability: RATING_SCORE[input.repeatability],
  };
}

function fitFor(score: number): Fit {
  if (score >= FIT_STRONG_THRESHOLD) return "strong_fit";
  if (score >= FIT_WORTH_TESTING_THRESHOLD) return "worth_testing";
  return "weak_fit";
}

function extremeDimension(scores: Record<DimensionKey, number>, direction: "max" | "min"): DimensionKey {
  return DIMENSION_ORDER.reduce((best, key) => {
    const better = direction === "max" ? scores[key] > scores[best] : scores[key] < scores[best];
    return better ? key : best;
  }, DIMENSION_ORDER[0]!);
}

function guidanceFor(fit: Fit, fitScore: number): string {
  if (fit === "strong_fit") return `This channel scores well for your situation (${fitScore}/100) — worth committing real effort to.`;
  if (fit === "worth_testing") return `This channel is worth testing (${fitScore}/100), but isn't an obvious strong fit yet.`;
  return `This channel doesn't score well for your situation (${fitScore}/100) — look at a different channel type first.`;
}

export function scoreFirstCustomersPlanner(input: FirstCustomersPlannerInput): FirstCustomersPlannerResult {
  const scores = dimensionScores(input);
  const weights = DIMENSION_WEIGHTS[input.channelType];

  const fitScore = Math.round(DIMENSION_ORDER.reduce((total, key) => total + scores[key] * weights[key], 0));

  const strongestKey = extremeDimension(scores, "max");
  const weakestKey = extremeDimension(scores, "min");
  const fit = fitFor(fitScore);

  return {
    channelType: input.channelType,
    fitScore,
    fit,
    strongestFactor: DIMENSION_LABELS[strongestKey],
    weakestFactor: DIMENSION_LABELS[weakestKey],
    biggestUncertainty: DIMENSION_UNCERTAINTY[weakestKey],
    guidance: guidanceFor(fit, fitScore),
    nextStep: DIMENSION_NEXT_ACTION[weakestKey],
  };
}
