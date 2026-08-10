import type { Fit, ProductMarketFitTrackerInput, ProductMarketFitTrackerResult, Rating } from "./schema";

/**
 * Deterministic scoring for the Product/Market Fit Tracker PMF Score Checker (spec v3 §37).
 * No AI is involved, mirroring [[0016-product-idea-assessor-tool-deterministic-only]] —
 * every number here comes from a fixed lookup table or a weighted sum, so the same input
 * always produces the same result and every branch is unit-testable.
 *
 * `disappointmentSignal` — the Sean Ellis "how would you feel if you could no longer use
 * this" proxy — is weighted highest (0.35) of the five dimensions, but it is *also* a hard
 * gate: a `"low"` reading forces `fit: "no_fit"` regardless of how the weighted score comes
 * out, the same non-additive-rule shape as MVP Scoper's fakeability gate and Product Naming
 * System's availability gate. The difference from both of those: this Tool *also* reports a
 * strongest/weakest factor the way First Customers Planner does. No earlier family combined
 * a hard gate with strongest/weakest reporting — see docs/decisions/0027. Retention,
 * organic growth, referral and paying intent are useful supporting signals, but none of them
 * substitute for genuine disappointment if the product disappeared; that's the definitional
 * core of product-market fit, not one more input to average away.
 */

type DimensionKey = "disappointmentSignal" | "retention" | "organicGrowth" | "referral" | "payingIntent";

const RATING_SCORE: Record<Rating, number> = { low: 0, medium: 50, high: 100 };

const DIMENSION_WEIGHTS: Record<DimensionKey, number> = {
  disappointmentSignal: 0.35,
  retention: 0.25,
  organicGrowth: 0.15,
  referral: 0.15,
  payingIntent: 0.1,
};

const FIT_STRONG_THRESHOLD = 65;
const FIT_EARLY_SIGNAL_THRESHOLD = 35;

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  disappointmentSignal: "Disappointment if gone",
  retention: "Retention",
  organicGrowth: "Organic growth",
  referral: "Referral",
  payingIntent: "Paying intent",
};

const DIMENSION_UNCERTAINTY: Record<DimensionKey, string> = {
  disappointmentSignal: "Whether the people using this would genuinely miss it, or just tolerate it.",
  retention: "Whether people who try this keep coming back on their own, or drift away after the first go.",
  organicGrowth: "Whether new users are arriving without you paying for them or personally chasing them.",
  referral: "Whether people are recommending this to others without being asked.",
  payingIntent: "Whether people would actually pay for this, not just use it because it's free.",
};

const DIMENSION_NEXT_ACTION: Record<DimensionKey, string> = {
  disappointmentSignal:
    "Ask a direct sample of real users the 'how would you feel if this disappeared' question and get an honest read before trusting any other signal.",
  retention: "Look at actual usage over the following weeks, not signup numbers, and find out exactly where people drop off.",
  organicGrowth: "Check where your last handful of new users actually came from before assuming there's organic pull.",
  referral: "Ask your best users directly why they haven't referred anyone yet, or give them an easy way to.",
  payingIntent: "Test a real price with real people — willingness to pay in a conversation isn't the same as willingness to pay at checkout.",
};

const GATED_GUIDANCE =
  "Your other signals may look fine, but the core signal is missing: without people who'd genuinely miss this, the rest doesn't add up to product-market fit yet.";
const GATED_NEXT_STEP =
  "Go back to the people actually using it and ask directly how they'd feel if they could no longer use it — don't move on to growth or pricing until that answer is genuinely 'very disappointed.'";

const GUIDANCE: Record<Fit, (fitScore: number) => string> = {
  strong_fit: (fitScore) => `Your signals point to real product-market fit (${fitScore}/100) — a good time to invest in scaling what's working.`,
  early_signal: (fitScore) => `There's an early signal here (${fitScore}/100), but it isn't proven yet — keep tightening the product before pushing on growth.`,
  no_fit: (fitScore) => `These signals don't show product-market fit yet (${fitScore}/100) — go back to the problem before investing further in growth.`,
};

// Fixed iteration order so tied scores resolve deterministically (first in this list wins).
const DIMENSION_ORDER: DimensionKey[] = ["disappointmentSignal", "retention", "organicGrowth", "referral", "payingIntent"];

function dimensionScores(input: ProductMarketFitTrackerInput): Record<DimensionKey, number> {
  return {
    disappointmentSignal: RATING_SCORE[input.disappointmentSignal],
    retention: RATING_SCORE[input.retention],
    organicGrowth: RATING_SCORE[input.organicGrowth],
    referral: RATING_SCORE[input.referral],
    payingIntent: RATING_SCORE[input.payingIntent],
  };
}

function fitFor(score: number): Fit {
  if (score >= FIT_STRONG_THRESHOLD) return "strong_fit";
  if (score >= FIT_EARLY_SIGNAL_THRESHOLD) return "early_signal";
  return "no_fit";
}

function extremeDimension(scores: Record<DimensionKey, number>, direction: "max" | "min"): DimensionKey {
  return DIMENSION_ORDER.reduce((best, key) => {
    const better = direction === "max" ? scores[key] > scores[best] : scores[key] < scores[best];
    return better ? key : best;
  }, DIMENSION_ORDER[0]!);
}

export function scoreProductMarketFitTracker(input: ProductMarketFitTrackerInput): ProductMarketFitTrackerResult {
  const scores = dimensionScores(input);

  const fitScore = Math.round(DIMENSION_ORDER.reduce((total, key) => total + scores[key] * DIMENSION_WEIGHTS[key], 0));

  const strongestKey = extremeDimension(scores, "max");
  const weakestKey = extremeDimension(scores, "min");

  const gated = input.disappointmentSignal === "low";
  const fit: Fit = gated ? "no_fit" : fitFor(fitScore);

  return {
    fitScore,
    fit,
    disappointmentGateApplied: gated,
    strongestFactor: DIMENSION_LABELS[strongestKey],
    weakestFactor: DIMENSION_LABELS[weakestKey],
    biggestUncertainty: DIMENSION_UNCERTAINTY[weakestKey],
    guidance: gated ? GATED_GUIDANCE : GUIDANCE[fit](fitScore),
    nextStep: gated ? GATED_NEXT_STEP : DIMENSION_NEXT_ACTION[weakestKey],
  };
}
