import type {
  AudienceStructure,
  BusinessModel,
  BusinessModelChooserInput,
  BusinessModelChooserResult,
  GrowthLever,
  Payer,
  ValueDeliveryPattern,
} from "./schema";

/**
 * Deterministic scoring for the Business Model Recommender (spec v4 §37). No AI is involved,
 * consistent with every prior Tool (docs/decisions/0016) — every number here comes from a
 * fixed lookup table, so the same input always produces the same result and every branch is
 * unit-testable.
 *
 * Reuses Pricing Your Product's named-candidate scoring-matrix mechanic (docs/decisions/0028):
 * four named business models — the source material's own "top 3" (SaaS, Marketplace,
 * Transactional) plus Advertising, the most structurally distinct of its "other business
 * models" — scored against four dimensions, with a runner-up and deciding factor. Unlike
 * Pricing Your Product, there's no disqualification gate: every combination here is a matter
 * of degree, not eligibility.
 */

type DimensionKey = "audienceStructure" | "payer" | "valueDeliveryPattern" | "growthLever";
type ModelPoints = Partial<Record<BusinessModel, number>>;

// Fixed iteration order so tied totals and deciding-factor ties resolve deterministically
// (first in this list wins) — the source post's own "top 3" order, then Advertising.
const MODEL_ORDER: BusinessModel[] = ["saas", "marketplace", "transactional", "advertising"];
const DIMENSION_ORDER: DimensionKey[] = ["audienceStructure", "payer", "valueDeliveryPattern", "growthLever"];

const AUDIENCE_STRUCTURE_POINTS: Record<AudienceStructure, ModelPoints> = {
  two_sided: { marketplace: 3 },
  one_sided: { saas: 1, transactional: 1, advertising: 1 },
};

const PAYER_POINTS: Record<Payer, ModelPoints> = {
  end_user_directly: { saas: 3 },
  a_third_party: { advertising: 3 },
  whoever_initiates_a_transaction: { transactional: 2, marketplace: 2 },
};

const VALUE_DELIVERY_PATTERN_POINTS: Record<ValueDeliveryPattern, ModelPoints> = {
  ongoing_access: { saas: 2, advertising: 1 },
  discrete_transactions: { marketplace: 2, transactional: 2 },
};

const GROWTH_LEVER_POINTS: Record<GrowthLever, ModelPoints> = {
  self_serve_or_sales_led: { saas: 2 },
  network_effects: { marketplace: 3 },
  audience_scale: { advertising: 2, transactional: 1 },
};

const MODEL_RATIONALE: Record<BusinessModel, string> = {
  saas: "Your customers pay you directly and get ongoing value from continued access, so recurring software access is the natural fit.",
  marketplace:
    "You're connecting two different kinds of users who need each other, so sitting between them and taking a cut as they transact is the natural fit.",
  transactional:
    "Value is delivered in discrete completed transactions and whoever initiates one pays a fee, so taking a small cut of each transaction is the natural fit.",
  advertising: "Someone other than your end user is paying, so monetising attention by selling it to advertisers is the natural fit.",
};

const MODEL_NEXT_STEP: Record<BusinessModel, string> = {
  saas: "Define what a subscriber gets for their monthly or annual fee, and start tracking MRR and retention from day one.",
  marketplace: "Solve the cold-start problem first — line up a small supply on one side before you worry about the other.",
  transactional: "Work out the smallest fee that still makes the unit economics work, and find the first flow of transactions you can plug into.",
  advertising: "Work out how large an engaged audience you actually need before advertisers will pay for access to it — and whether you can realistically reach that scale.",
};

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  audienceStructure: "whether your product connects two distinct kinds of users or serves one directly",
  payer: "who actually pays you",
  valueDeliveryPattern: "whether value is delivered as ongoing access or in discrete transactions",
  growthLever: "the growth lever you can realistically pull",
};

function dimensionPointsFor(input: BusinessModelChooserInput): Record<DimensionKey, ModelPoints> {
  return {
    audienceStructure: AUDIENCE_STRUCTURE_POINTS[input.audienceStructure],
    payer: PAYER_POINTS[input.payer],
    valueDeliveryPattern: VALUE_DELIVERY_PATTERN_POINTS[input.valueDeliveryPattern],
    growthLever: GROWTH_LEVER_POINTS[input.growthLever],
  };
}

function totalFor(model: BusinessModel, dimensionPoints: Record<DimensionKey, ModelPoints>): number {
  return DIMENSION_ORDER.reduce((sum, dim) => sum + (dimensionPoints[dim][model] ?? 0), 0);
}

function rankModels(totals: Record<BusinessModel, number>): BusinessModel[] {
  return [...MODEL_ORDER].sort((a, b) => {
    if (totals[b] !== totals[a]) return totals[b] - totals[a];
    return MODEL_ORDER.indexOf(a) - MODEL_ORDER.indexOf(b);
  });
}

function decidingFactorBetween(
  winner: BusinessModel,
  runnerUp: BusinessModel,
  dimensionPoints: Record<DimensionKey, ModelPoints>,
): string {
  const bestDimension = DIMENSION_ORDER.reduce((best, dim) => {
    const diff = (dimensionPoints[dim][winner] ?? 0) - (dimensionPoints[dim][runnerUp] ?? 0);
    const bestDiff = (dimensionPoints[best][winner] ?? 0) - (dimensionPoints[best][runnerUp] ?? 0);
    return diff > bestDiff ? dim : best;
  }, DIMENSION_ORDER[0]!);
  return DIMENSION_LABELS[bestDimension];
}

export function scoreBusinessModelChooser(input: BusinessModelChooserInput): BusinessModelChooserResult {
  const dimensionPoints = dimensionPointsFor(input);

  const totals = MODEL_ORDER.reduce((acc, model) => {
    acc[model] = totalFor(model, dimensionPoints);
    return acc;
  }, {} as Record<BusinessModel, number>);

  const ranked = rankModels(totals);
  const winner = ranked[0]!;
  const runnerUp = ranked[1] ?? null;

  return {
    recommendedModel: winner,
    rationale: MODEL_RATIONALE[winner],
    runnerUpModel: runnerUp,
    decidingFactor: runnerUp ? decidingFactorBetween(winner, runnerUp, dimensionPoints) : null,
    nextStep: MODEL_NEXT_STEP[winner],
  };
}
