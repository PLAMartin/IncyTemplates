import { z } from "zod";

/**
 * Startup Launch Planner tool input/result schemas (spec v4 §37's "plan generator"). Reuses
 * the named-candidate scoring matrix (docs/decisions/0028) but returns the *full ranked
 * order* of all four candidates as a sequenced plan, not just a winner and runner-up — a
 * genuine "plan," matching spec's naming, built on the same proven scoring mechanism. See
 * docs/decisions/0038.
 */
export const hasSomethingToShowSchema = z.enum(["yes_a_working_version_or_page", "no_just_an_idea_so_far"]);
export type HasSomethingToShow = z.infer<typeof hasSomethingToShowSchema>;

export const feedbackStakesSchema = z.enum(["want_low_stakes_honest_feedback_first", "ready_for_public_reaction"]);
export type FeedbackStakes = z.infer<typeof feedbackStakesSchema>;

export const existingAudienceSchema = z.enum(["yes_i_already_have_some_following_or_community_ties", "no_starting_from_zero"]);
export type ExistingAudience = z.infer<typeof existingAudienceSchema>;

export const newsworthinessSchema = z.enum(["yes_genuinely_novel_or_a_good_story", "not_particularly_newsworthy_yet"]);
export type Newsworthiness = z.infer<typeof newsworthinessSchema>;

export const startupLaunchPlannerInputSchema = z.object({
  hasSomethingToShow: hasSomethingToShowSchema,
  feedbackStakes: feedbackStakesSchema,
  existingAudience: existingAudienceSchema,
  newsworthiness: newsworthinessSchema,
});
export type StartupLaunchPlannerInput = z.infer<typeof startupLaunchPlannerInputSchema>;

export const launchOptionSchema = z.enum(["soft_launch_page", "friends_and_family", "community_or_social", "press"]);
export type LaunchOption = z.infer<typeof launchOptionSchema>;

export const planStepSchema = z.object({
  option: launchOptionSchema,
  tip: z.string(),
});
export type PlanStep = z.infer<typeof planStepSchema>;

export const startupLaunchPlannerResultSchema = z.object({
  plan: z.array(planStepSchema),
  rationale: z.string(),
  nextStep: z.string(),
});
export type StartupLaunchPlannerResult = z.infer<typeof startupLaunchPlannerResultSchema>;
