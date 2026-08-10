import type {
  CustomerType,
  PriceVisibility,
  PricingModel,
  PricingYourProductInput,
  PricingYourProductResult,
  PurchasePattern,
  ValueMetric,
} from "./schema";

/**
 * Deterministic scoring for the Pricing Your Product model recommender (spec v3 §37). No AI is
 * involved, mirroring every prior Tool (docs/decisions/0016) — every number here comes from a
 * fixed lookup table, so the same input always produces the same result and every branch is
 * unit-testable.
 *
 * Every prior Tool scores one subject against fixed thresholds. This one instead scores four
 * *named candidate pricing models* against each other and picks the highest scorer — a
 * generalisation of Product Idea Assessor's classification table (3 candidates) to 4, combined
 * with a hard disqualification gate (the same non-additive-rule shape as MVP Scoper's
 * fakeability gate, Product Naming System's availability gate and Product/Market Fit Tracker's
 * disappointment gate — here applied to eliminate *candidates* rather than force a single
 * verdict) and a runner-up report (First Customers Planner / PMF Tracker's strongest/weakest
 * pattern, applied to candidates instead of dimensions). See docs/decisions/0028.
 *
 * `purchasePattern: "one_off"` disqualifies every subscription model outright — a one-off job
 * can't sustain a recurring relationship regardless of how the other three answers score.
 */

type DimensionKey = "purchasePattern" | "valueMetric" | "customerType" | "priceVisibility";
type ModelPoints = Partial<Record<PricingModel, number>>;

// Fixed iteration order so tied totals resolve deterministically (first in this list wins).
const MODEL_ORDER: PricingModel[] = ["one_time", "flat_subscription", "usage_based", "tiered_subscription"];
const SUBSCRIPTION_MODELS: PricingModel[] = ["flat_subscription", "usage_based", "tiered_subscription"];

// Fixed order for deciding-factor tie-breaks (first in this list wins).
const DIMENSION_ORDER: DimensionKey[] = ["purchasePattern", "valueMetric", "customerType", "priceVisibility"];

const VALUE_METRIC_POINTS: Record<ValueMetric, ModelPoints> = {
  clear: { usage_based: 3, tiered_subscription: 1 },
  somewhat: { tiered_subscription: 2, flat_subscription: 1 },
  none: { flat_subscription: 2, one_time: 2 },
};

const PURCHASE_PATTERN_POINTS: Record<PurchasePattern, ModelPoints> = {
  ongoing: { flat_subscription: 2, usage_based: 2, tiered_subscription: 2 },
  one_off: { one_time: 3 },
};

const CUSTOMER_TYPE_POINTS: Record<CustomerType, ModelPoints> = {
  individual: { one_time: 1, usage_based: 1 },
  small_business: { flat_subscription: 2 },
  enterprise: { tiered_subscription: 3 },
};

const PRICE_VISIBILITY_POINTS: Record<PriceVisibility, ModelPoints> = {
  highly_visible: { flat_subscription: 1, one_time: 1 },
  not_visible: { tiered_subscription: 2, usage_based: 1 },
};

const MODEL_RATIONALE: Record<PricingModel, string> = {
  one_time: "Customers get value once, in a single job, so a single upfront price matches how they'll actually buy.",
  flat_subscription:
    "Customers get ongoing value without a unit that clearly tracks how much they use it, so one predictable recurring price is the simplest fit.",
  usage_based: "Value scales clearly with a countable unit, so a price that scales with actual usage captures that fairly on both sides.",
  tiered_subscription:
    "Customers span a range of needs and willingness to pay, so a small set of tiers lets each segment self-select the value it actually wants.",
};

const MODEL_NEXT_STEP: Record<PricingModel, string> = {
  one_time: "Set a single price you're confident covers the value of one job, and test it with a handful of real customers before committing.",
  flat_subscription: "Pick one price that's simple to explain and test whether customers renew month over month before adding tiers.",
  usage_based: "Define the exact unit you'll charge for and make sure customers can predict their bill before they commit.",
  tiered_subscription:
    "Design two or three tiers around real usage differences you've already seen, not guesses — and price the middle tier as the one most customers should pick.",
};

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  purchasePattern: "whether use is ongoing or a one-off job",
  valueMetric: "how clearly value scales with a countable unit",
  customerType: "the type of customer you're selling to",
  priceVisibility: "how visible competitor pricing is to your customers",
};

const GATED_RATIONALE =
  "A one-off job doesn't sustain a recurring relationship, so no subscription model — flat, usage-based or tiered — fits regardless of the other answers.";

function dimensionPointsFor(input: PricingYourProductInput): Record<DimensionKey, ModelPoints> {
  return {
    purchasePattern: PURCHASE_PATTERN_POINTS[input.purchasePattern],
    valueMetric: VALUE_METRIC_POINTS[input.valueMetric],
    customerType: CUSTOMER_TYPE_POINTS[input.customerType],
    priceVisibility: PRICE_VISIBILITY_POINTS[input.priceVisibility],
  };
}

function totalFor(model: PricingModel, dimensionPoints: Record<DimensionKey, ModelPoints>): number {
  return DIMENSION_ORDER.reduce((sum, dim) => sum + (dimensionPoints[dim][model] ?? 0), 0);
}

function rankCandidates(candidates: PricingModel[], totals: Record<PricingModel, number>): PricingModel[] {
  return [...candidates].sort((a, b) => {
    if (totals[b] !== totals[a]) return totals[b] - totals[a];
    return MODEL_ORDER.indexOf(a) - MODEL_ORDER.indexOf(b);
  });
}

function decidingFactorBetween(
  winner: PricingModel,
  runnerUp: PricingModel,
  dimensionPoints: Record<DimensionKey, ModelPoints>,
): string {
  const bestDimension = DIMENSION_ORDER.reduce((best, dim) => {
    const diff = (dimensionPoints[dim][winner] ?? 0) - (dimensionPoints[dim][runnerUp] ?? 0);
    const bestDiff = (dimensionPoints[best][winner] ?? 0) - (dimensionPoints[best][runnerUp] ?? 0);
    return diff > bestDiff ? dim : best;
  }, DIMENSION_ORDER[0]!);
  return DIMENSION_LABELS[bestDimension];
}

export function scorePricingYourProduct(input: PricingYourProductInput): PricingYourProductResult {
  const dimensionPoints = dimensionPointsFor(input);
  const gated = input.purchasePattern === "one_off";
  const candidates = gated ? MODEL_ORDER.filter((model) => !SUBSCRIPTION_MODELS.includes(model)) : MODEL_ORDER;

  const totals = MODEL_ORDER.reduce((acc, model) => {
    acc[model] = totalFor(model, dimensionPoints);
    return acc;
  }, {} as Record<PricingModel, number>);

  const ranked = rankCandidates(candidates, totals);
  const winner = ranked[0]!;
  const runnerUp = ranked[1] ?? null;

  return {
    recommendedModel: winner,
    rationale: gated ? GATED_RATIONALE : MODEL_RATIONALE[winner],
    runnerUpModel: runnerUp,
    decidingFactor: runnerUp ? decidingFactorBetween(winner, runnerUp, dimensionPoints) : null,
    oneOffGateApplied: gated,
    nextStep: MODEL_NEXT_STEP[winner],
  };
}
