import type {
  ActionEase,
  HookStage,
  InvestmentDepth,
  RewardQuality,
  TriggerStrength,
  UserEngagementDesignerInput,
  UserEngagementDesignerResult,
} from "./schema";

/**
 * Deterministic weakest-link diagnosis for the Engagement Loop Mapper (spec v4 §37). No AI is
 * involved, consistent with every prior Tool (docs/decisions/0016) — every number here comes
 * from a fixed lookup table, so the same input always produces the same result and every
 * branch is unit-testable.
 *
 * Nir Eyal's Hook Model cycle (Trigger, Action, Reward, Investment) each gets its own strength
 * score (3 = strong, 1 = weak) from one dedicated question — no dimension crosses over to
 * another stage, unlike every named-candidate Tool before this one. The Tool reports the
 * *lowest*-scoring stage, not the highest: the point is to find what to fix first, not what's
 * already working.
 */

// Fixed order — the Hook Model's own cycle order — so tied scores resolve toward the earlier
// stage in the funnel (fix what happens first, first).
const STAGE_ORDER: HookStage[] = ["trigger", "action", "reward", "investment"];

const TRIGGER_SCORE: Record<TriggerStrength, number> = {
  yes_clear_external_trigger: 3,
  sometimes_but_inconsistent: 2,
  no_users_have_to_remember_on_their_own: 1,
};

const ACTION_SCORE: Record<ActionEase, number> = {
  one_simple_step: 3,
  a_few_steps: 2,
  several_steps_or_real_effort: 1,
};

const REWARD_SCORE: Record<RewardQuality, number> = {
  yes_varied_and_satisfying: 3,
  somewhat_but_predictable_or_flat: 2,
  rarely_or_inconsistently: 1,
};

const INVESTMENT_SCORE: Record<InvestmentDepth, number> = {
  yes_they_build_something_that_compounds: 3,
  a_little_but_not_much: 2,
  no_nothing_carries_forward: 1,
};

const STAGE_RATIONALE: Record<HookStage, string> = {
  trigger: "Your weakest link is the trigger — without a reliable prompt, users simply don't come back, no matter how good the rest of the loop is.",
  action: "Your weakest link is the action — if the very next step takes real effort, users drop off between the trigger and the reward.",
  reward: "Your weakest link is the reward — if the payoff is flat or predictable, curiosity fades and the loop stops pulling users back.",
  investment: "Your weakest link is investment — if nothing carries forward, every session starts from zero and there's nothing loading the next trigger.",
};

const STAGE_NEXT_STEP: Record<HookStage, string> = {
  trigger: "Add an external trigger that clearly signals the next action — a notification, an icon, an email — and give it time to become an internal trigger through repetition.",
  action: "Cut the action down to the simplest possible step someone could take in anticipation of the reward — fewer taps, fewer fields, one clear default.",
  reward: "Introduce some variability into what users get back, and make sure it appeals to at least one of tribal, hunter or self-oriented motivation, not just utility.",
  investment: "Give users something to put into the product — content, data, progress, reputation — so returning becomes more valuable than starting elsewhere.",
};

function scoresFor(input: UserEngagementDesignerInput): Record<HookStage, number> {
  return {
    trigger: TRIGGER_SCORE[input.triggerStrength],
    action: ACTION_SCORE[input.actionEase],
    reward: REWARD_SCORE[input.rewardQuality],
    investment: INVESTMENT_SCORE[input.investmentDepth],
  };
}

/** Ascending by score (weakest first), ties broken toward the earlier stage in the funnel. */
function rankWeakestFirst(scores: Record<HookStage, number>): HookStage[] {
  return [...STAGE_ORDER].sort((a, b) => {
    if (scores[a] !== scores[b]) return scores[a] - scores[b];
    return STAGE_ORDER.indexOf(a) - STAGE_ORDER.indexOf(b);
  });
}

export function diagnoseUserEngagement(input: UserEngagementDesignerInput): UserEngagementDesignerResult {
  const scores = scoresFor(input);
  const ranked = rankWeakestFirst(scores);
  const weakest = ranked[0]!;
  const secondWeakest = ranked[1]!;

  return {
    weakestStage: weakest,
    rationale: STAGE_RATIONALE[weakest],
    secondWeakestStage: secondWeakest,
    nextStep: STAGE_NEXT_STEP[weakest],
  };
}
