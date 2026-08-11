import type {
  Deadlines,
  EverythingAchievable,
  ProductPrioritisationToolInput,
  ProductPrioritisationToolResult,
  SchedulingStrategy,
  ValueVariation,
  WhatWouldHelpMost,
} from "./schema";

/**
 * Deterministic scoring for the Priority Scorer (spec v4 §37). No AI is involved, consistent
 * with every prior Tool (docs/decisions/0016) — every number here comes from a fixed lookup
 * table, so the same input always produces the same result and every branch is unit-testable.
 *
 * Four named scheduling strategies, straight from the source post's own list, scored across
 * four dimensions, ranked, with a runner-up and deciding factor. No disqualification gate:
 * every combination here is a matter of degree, not eligibility.
 */

type DimensionKey = "deadlines" | "everythingAchievable" | "valueVariation" | "whatWouldHelpMost";
type StrategyPoints = Partial<Record<SchedulingStrategy, number>>;

// Fixed iteration order (the source post's own listed order) so tied totals and
// deciding-factor ties resolve deterministically (first in this list wins).
const STRATEGY_ORDER: SchedulingStrategy[] = [
  "earliest_due_date",
  "moores_algorithm",
  "shortest_processing_time",
  "weighted_processing_time",
];
const DIMENSION_ORDER: DimensionKey[] = ["deadlines", "everythingAchievable", "valueVariation", "whatWouldHelpMost"];

const DEADLINES_POINTS: Record<Deadlines, StrategyPoints> = {
  yes_hard_deadlines: { earliest_due_date: 2, moores_algorithm: 2 },
  no_flexible_timing: { shortest_processing_time: 2, weighted_processing_time: 2 },
};

const EVERYTHING_ACHIEVABLE_POINTS: Record<EverythingAchievable, StrategyPoints> = {
  yes_its_all_achievable: { earliest_due_date: 2, shortest_processing_time: 1 },
  no_something_has_to_give: { moores_algorithm: 3 },
};

const VALUE_VARIATION_POINTS: Record<ValueVariation, StrategyPoints> = {
  yes_some_matter_much_more: { weighted_processing_time: 3 },
  roughly_equally_important: { shortest_processing_time: 2, earliest_due_date: 1 },
};

const WHAT_WOULD_HELP_MOST_POINTS: Record<WhatWouldHelpMost, StrategyPoints> = {
  momentum_and_fewer_open_tasks: { shortest_processing_time: 3 },
  confidence_nothing_important_slips: { weighted_processing_time: 2, earliest_due_date: 1 },
};

const STRATEGY_RATIONALE: Record<SchedulingStrategy, string> = {
  earliest_due_date:
    "Your tasks have hard deadlines and everything is realistically achievable, so completing whichever task is due soonest minimises how badly anything slips — task size doesn't matter here, only the deadline does.",
  moores_algorithm:
    "You can't realistically hit every deadline, so the priority isn't avoiding lateness — it's minimising how many tasks end up overdue by deliberately dropping the most time-consuming one first.",
  shortest_processing_time:
    "Your tasks don't have hard deadlines or wildly different value, so knocking out the shortest task first reduces your total number of open tasks fastest, building momentum and cutting cognitive load.",
  weighted_processing_time:
    "Your tasks vary a lot in how much they actually matter, so ranking by value divided by duration — and doing the highest-value-per-time task first — gets the most important work done, not just the easiest.",
};

const STRATEGY_NEXT_STEP: Record<SchedulingStrategy, string> = {
  earliest_due_date: "List every task with its deadline, ignore how long each one takes, and work strictly in order of nearest deadline first.",
  moores_algorithm: "Accept that not everything will get done on time. Sort by deadline, then deliberately drop or delay your single most time-consuming task first to save the rest.",
  shortest_processing_time: "Estimate how long each task will actually take, and knock out the shortest one first, then the next shortest, to build momentum fast.",
  weighted_processing_time: "For each task, estimate its value and its duration, divide one by the other, and work through them in order of that ratio, highest first.",
};

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  deadlines: "whether your tasks have hard deadlines or flexible timing",
  everythingAchievable: "whether everything is realistically achievable or something has to give",
  valueVariation: "whether your tasks vary a lot in value or are roughly equally important",
  whatWouldHelpMost: "what would help most right now — momentum or confidence nothing important slips",
};

function dimensionPointsFor(input: ProductPrioritisationToolInput): Record<DimensionKey, StrategyPoints> {
  return {
    deadlines: DEADLINES_POINTS[input.deadlines],
    everythingAchievable: EVERYTHING_ACHIEVABLE_POINTS[input.everythingAchievable],
    valueVariation: VALUE_VARIATION_POINTS[input.valueVariation],
    whatWouldHelpMost: WHAT_WOULD_HELP_MOST_POINTS[input.whatWouldHelpMost],
  };
}

function totalFor(strategy: SchedulingStrategy, dimensionPoints: Record<DimensionKey, StrategyPoints>): number {
  return DIMENSION_ORDER.reduce((sum, dim) => sum + (dimensionPoints[dim][strategy] ?? 0), 0);
}

function rankStrategies(totals: Record<SchedulingStrategy, number>): SchedulingStrategy[] {
  return [...STRATEGY_ORDER].sort((a, b) => {
    if (totals[b] !== totals[a]) return totals[b] - totals[a];
    return STRATEGY_ORDER.indexOf(a) - STRATEGY_ORDER.indexOf(b);
  });
}

function decidingFactorBetween(
  winner: SchedulingStrategy,
  runnerUp: SchedulingStrategy,
  dimensionPoints: Record<DimensionKey, StrategyPoints>,
): string {
  const bestDimension = DIMENSION_ORDER.reduce((best, dim) => {
    const diff = (dimensionPoints[dim][winner] ?? 0) - (dimensionPoints[dim][runnerUp] ?? 0);
    const bestDiff = (dimensionPoints[best][winner] ?? 0) - (dimensionPoints[best][runnerUp] ?? 0);
    return diff > bestDiff ? dim : best;
  }, DIMENSION_ORDER[0]!);
  return DIMENSION_LABELS[bestDimension];
}

export function scoreProductPrioritisationTool(input: ProductPrioritisationToolInput): ProductPrioritisationToolResult {
  const dimensionPoints = dimensionPointsFor(input);

  const totals = STRATEGY_ORDER.reduce((acc, strategy) => {
    acc[strategy] = totalFor(strategy, dimensionPoints);
    return acc;
  }, {} as Record<SchedulingStrategy, number>);

  const ranked = rankStrategies(totals);
  const winner = ranked[0]!;
  const runnerUp = ranked[1] ?? null;

  return {
    recommendedStrategy: winner,
    rationale: STRATEGY_RATIONALE[winner],
    runnerUpStrategy: runnerUp,
    decidingFactor: runnerUp ? decidingFactorBetween(winner, runnerUp, dimensionPoints) : null,
    nextStep: STRATEGY_NEXT_STEP[winner],
  };
}
