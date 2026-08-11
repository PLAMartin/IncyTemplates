import type {
  DecisionFramework,
  DecisionFrameworkPickerInput,
  DecisionFrameworkPickerResult,
  DecisionShape,
  Involvement,
  Precedent,
  TimeWorthInvesting,
} from "./schema";

/**
 * Deterministic scoring for the Decision Framework Recommender (spec v4 §37). No AI is
 * involved, consistent with every prior Tool (docs/decisions/0016) — every number here comes
 * from a fixed lookup table, so the same input always produces the same result and every
 * branch is unit-testable.
 *
 * Reuses the named-candidate scoring-matrix mechanic introduced by Pricing Your Product
 * (docs/decisions/0028) and reused by Business Model Chooser (docs/decisions/0030): four named
 * frameworks scored across four dimensions, ranked, with a runner-up and deciding factor. No
 * disqualification gate — every combination here is a matter of degree, not eligibility.
 */

type DimensionKey = "involvement" | "decisionShape" | "precedent" | "timeWorthInvesting";
type FrameworkPoints = Partial<Record<DecisionFramework, number>>;

// Fixed iteration order so tied totals and deciding-factor ties resolve deterministically
// (first in this list wins).
const FRAMEWORK_ORDER: DecisionFramework[] = ["six_thinking_hats", "first_principles", "razors", "boundary_rule"];
const DIMENSION_ORDER: DimensionKey[] = ["involvement", "decisionShape", "precedent", "timeWorthInvesting"];

const INVOLVEMENT_POINTS: Record<Involvement, FrameworkPoints> = {
  just_me: { first_principles: 1, razors: 1, boundary_rule: 1 },
  multiple_people_or_perspectives_needed: { six_thinking_hats: 3 },
};

const DECISION_SHAPE_POINTS: Record<DecisionShape, FrameworkPoints> = {
  sequence_of_options: { boundary_rule: 3 },
  one_decision_to_reason_through: { six_thinking_hats: 1, first_principles: 1 },
  small_frequent_choice: { razors: 3 },
};

const PRECEDENT_POINTS: Record<Precedent, FrameworkPoints> = {
  clear_precedent_to_copy: { razors: 1, six_thinking_hats: 1 },
  no_clear_precedent: { first_principles: 3 },
};

const TIME_WORTH_INVESTING_POINTS: Record<TimeWorthInvesting, FrameworkPoints> = {
  worth_real_time_and_thought: { six_thinking_hats: 2, first_principles: 2, boundary_rule: 1 },
  not_worth_much_time: { razors: 2 },
};

const FRAMEWORK_RATIONALE: Record<DecisionFramework, string> = {
  six_thinking_hats:
    "Multiple people or perspectives are involved, so systematically switching between fact, feeling, caution, optimism, creativity and control surfaces angles a single viewpoint would miss.",
  first_principles:
    "There's no clear existing approach to copy, so it's worth breaking the problem down to the fundamental truths you're certain of and reasoning back up from there, rather than reasoning by analogy.",
  razors: "This is a small, frequent, low-stakes choice, so a quick rule of thumb will serve you better than deep analysis — save the analysis for decisions that actually warrant it.",
  boundary_rule:
    "You're evaluating a sequence of options one at a time, so the question isn't which one is best in the abstract — it's knowing when to stop searching and commit to a good-enough option.",
};

const FRAMEWORK_NEXT_STEP: Record<DecisionFramework, string> = {
  six_thinking_hats:
    "Run the decision through each hat in turn — facts, feelings, caution, benefits, new ideas, then step back and plan — rather than jumping straight to a conclusion.",
  first_principles: "List the facts you're certain are true, set aside how it's normally done, and reason back up from those fundamentals to a fresh answer.",
  razors: "Pick one rule of thumb that fits — favour the option that opens future doors, or set a personal hourly rate and use it to decide what's worth your time — and apply it without further deliberation.",
  boundary_rule:
    "Decide roughly how many options you expect to see in total, review the first chunk without choosing any of them, then pick the very next one that beats everything you've seen so far.",
};

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  involvement: "whether multiple people or perspectives are involved, or it's just you",
  decisionShape: "the shape of the choice — a sequence of options, one decision to reason through, or a small frequent choice",
  precedent: "whether there's a clear existing approach to copy",
  timeWorthInvesting: "how much time and thought the decision is actually worth",
};

function dimensionPointsFor(input: DecisionFrameworkPickerInput): Record<DimensionKey, FrameworkPoints> {
  return {
    involvement: INVOLVEMENT_POINTS[input.involvement],
    decisionShape: DECISION_SHAPE_POINTS[input.decisionShape],
    precedent: PRECEDENT_POINTS[input.precedent],
    timeWorthInvesting: TIME_WORTH_INVESTING_POINTS[input.timeWorthInvesting],
  };
}

function totalFor(framework: DecisionFramework, dimensionPoints: Record<DimensionKey, FrameworkPoints>): number {
  return DIMENSION_ORDER.reduce((sum, dim) => sum + (dimensionPoints[dim][framework] ?? 0), 0);
}

function rankFrameworks(totals: Record<DecisionFramework, number>): DecisionFramework[] {
  return [...FRAMEWORK_ORDER].sort((a, b) => {
    if (totals[b] !== totals[a]) return totals[b] - totals[a];
    return FRAMEWORK_ORDER.indexOf(a) - FRAMEWORK_ORDER.indexOf(b);
  });
}

function decidingFactorBetween(
  winner: DecisionFramework,
  runnerUp: DecisionFramework,
  dimensionPoints: Record<DimensionKey, FrameworkPoints>,
): string {
  const bestDimension = DIMENSION_ORDER.reduce((best, dim) => {
    const diff = (dimensionPoints[dim][winner] ?? 0) - (dimensionPoints[dim][runnerUp] ?? 0);
    const bestDiff = (dimensionPoints[best][winner] ?? 0) - (dimensionPoints[best][runnerUp] ?? 0);
    return diff > bestDiff ? dim : best;
  }, DIMENSION_ORDER[0]!);
  return DIMENSION_LABELS[bestDimension];
}

export function scoreDecisionFrameworkPicker(input: DecisionFrameworkPickerInput): DecisionFrameworkPickerResult {
  const dimensionPoints = dimensionPointsFor(input);

  const totals = FRAMEWORK_ORDER.reduce((acc, framework) => {
    acc[framework] = totalFor(framework, dimensionPoints);
    return acc;
  }, {} as Record<DecisionFramework, number>);

  const ranked = rankFrameworks(totals);
  const winner = ranked[0]!;
  const runnerUp = ranked[1] ?? null;

  return {
    recommendedFramework: winner,
    rationale: FRAMEWORK_RATIONALE[winner],
    runnerUpFramework: runnerUp,
    decidingFactor: runnerUp ? decidingFactorBetween(winner, runnerUp, dimensionPoints) : null,
    nextStep: FRAMEWORK_NEXT_STEP[winner],
  };
}
