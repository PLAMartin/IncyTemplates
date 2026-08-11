import type {
  ExistingAudience,
  FeedbackStakes,
  HasSomethingToShow,
  LaunchOption,
  Newsworthiness,
  PlanStep,
  StartupLaunchPlannerInput,
  StartupLaunchPlannerResult,
} from "./schema";

/**
 * Deterministic launch-plan ranking for the Launch Plan Generator (spec v4 §37). No AI is
 * involved, consistent with every prior Tool (docs/decisions/0016) — every number here comes
 * from a fixed lookup table, so the same input always produces the same result and every
 * branch is unit-testable.
 *
 * Four named launch options, condensed from the source post's own escalating list (soft
 * launch page, friends and family, network contacts and strangers, social media, online
 * communities, press — the middle four collapsed into two clean candidates), scored across
 * four readiness dimensions. Unlike every prior scoring Tool, the result reports the full
 * ranked order of all four, not just a winner and runner-up — a sequenced plan, not a single
 * recommendation. No disqualification gate.
 */

type DimensionKey = "hasSomethingToShow" | "feedbackStakes" | "existingAudience" | "newsworthiness";
type OptionPoints = Partial<Record<LaunchOption, number>>;

// Fixed order (lowest-exposure to highest, the source post's own progression) so tied totals
// resolve deterministically (first in this list wins).
const OPTION_ORDER: LaunchOption[] = ["soft_launch_page", "friends_and_family", "community_or_social", "press"];
const DIMENSION_ORDER: DimensionKey[] = ["hasSomethingToShow", "feedbackStakes", "existingAudience", "newsworthiness"];

const HAS_SOMETHING_TO_SHOW_POINTS: Record<HasSomethingToShow, OptionPoints> = {
  yes_a_working_version_or_page: { friends_and_family: 2, community_or_social: 2, press: 2 },
  no_just_an_idea_so_far: { soft_launch_page: 3 },
};

const FEEDBACK_STAKES_POINTS: Record<FeedbackStakes, OptionPoints> = {
  want_low_stakes_honest_feedback_first: { friends_and_family: 3 },
  ready_for_public_reaction: { soft_launch_page: 1, community_or_social: 1, press: 1 },
};

const EXISTING_AUDIENCE_POINTS: Record<ExistingAudience, OptionPoints> = {
  yes_i_already_have_some_following_or_community_ties: { community_or_social: 3 },
  no_starting_from_zero: { soft_launch_page: 1, friends_and_family: 1 },
};

const NEWSWORTHINESS_POINTS: Record<Newsworthiness, OptionPoints> = {
  yes_genuinely_novel_or_a_good_story: { press: 3 },
  not_particularly_newsworthy_yet: { soft_launch_page: 1, friends_and_family: 1, community_or_social: 1 },
};

const OPTION_TIP: Record<LaunchOption, string> = {
  soft_launch_page:
    "A page with a short description and a register-interest button needs nothing built yet — good for testing whether the idea alone generates interest.",
  friends_and_family:
    "Share with people you trust and watch how they actually interact with it, not just what they say — useful, but treat it as a signal, not a verdict.",
  community_or_social:
    "Post where your audience already gathers — a relevant online community or your own social channels — in a conversational way, focused on the value you offer, not a sales pitch.",
  press:
    "A press release and outreach to outlets works once you have something genuinely newsworthy to say — don't lead with press before you have a real story.",
};

const OPTION_RATIONALE: Record<LaunchOption, string> = {
  soft_launch_page: "You don't have something to show yet, so a simple page that tests interest without requiring a built product is the lowest-risk place to start.",
  friends_and_family: "You have something to show and want honest feedback at low stakes first, so sharing with people you trust is the natural starting point before going public.",
  community_or_social: "You already have an audience or community ties, so posting where they already gather will get real engagement fastest.",
  press: "You have a genuinely newsworthy story to tell, so press and outreach is worth leading with rather than saving for later.",
};

const NEXT_STEP = "Once you've launched, First Customers Planner is where you turn interest into your first real customers.";

function dimensionPointsFor(input: StartupLaunchPlannerInput): Record<DimensionKey, OptionPoints> {
  return {
    hasSomethingToShow: HAS_SOMETHING_TO_SHOW_POINTS[input.hasSomethingToShow],
    feedbackStakes: FEEDBACK_STAKES_POINTS[input.feedbackStakes],
    existingAudience: EXISTING_AUDIENCE_POINTS[input.existingAudience],
    newsworthiness: NEWSWORTHINESS_POINTS[input.newsworthiness],
  };
}

function totalFor(option: LaunchOption, dimensionPoints: Record<DimensionKey, OptionPoints>): number {
  return DIMENSION_ORDER.reduce((sum, dim) => sum + (dimensionPoints[dim][option] ?? 0), 0);
}

function rankOptions(totals: Record<LaunchOption, number>): LaunchOption[] {
  return [...OPTION_ORDER].sort((a, b) => {
    if (totals[b] !== totals[a]) return totals[b] - totals[a];
    return OPTION_ORDER.indexOf(a) - OPTION_ORDER.indexOf(b);
  });
}

export function generateLaunchPlan(input: StartupLaunchPlannerInput): StartupLaunchPlannerResult {
  const dimensionPoints = dimensionPointsFor(input);

  const totals = OPTION_ORDER.reduce((acc, option) => {
    acc[option] = totalFor(option, dimensionPoints);
    return acc;
  }, {} as Record<LaunchOption, number>);

  const ranked = rankOptions(totals);
  const plan: PlanStep[] = ranked.map((option) => ({ option, tip: OPTION_TIP[option] }));

  return {
    plan,
    rationale: OPTION_RATIONALE[ranked[0]!],
    nextStep: NEXT_STEP,
  };
}
