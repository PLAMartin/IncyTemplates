import { z } from "zod";

/**
 * User Engagement Designer tool input/result schemas (spec v4 §37's "mapper"). Inverts the
 * usual named-candidate scoring matrix (docs/decisions/0028): rather than scoring several
 * candidates against shared dimensions and picking the highest, each of Nir Eyal's four Hook
 * Model stages — Trigger, Action, Reward, Investment — is scored from its own single question,
 * and the Tool surfaces the *weakest* link, the one worth strengthening first. No dimension
 * feeds more than one stage, so there's no "deciding factor" to report the way prior Tools
 * have one — each stage's score already fully explains itself. See docs/decisions/0036.
 */
export const triggerStrengthSchema = z.enum(["yes_clear_external_trigger", "sometimes_but_inconsistent", "no_users_have_to_remember_on_their_own"]);
export type TriggerStrength = z.infer<typeof triggerStrengthSchema>;

export const actionEaseSchema = z.enum(["one_simple_step", "a_few_steps", "several_steps_or_real_effort"]);
export type ActionEase = z.infer<typeof actionEaseSchema>;

export const rewardQualitySchema = z.enum(["yes_varied_and_satisfying", "somewhat_but_predictable_or_flat", "rarely_or_inconsistently"]);
export type RewardQuality = z.infer<typeof rewardQualitySchema>;

export const investmentDepthSchema = z.enum(["yes_they_build_something_that_compounds", "a_little_but_not_much", "no_nothing_carries_forward"]);
export type InvestmentDepth = z.infer<typeof investmentDepthSchema>;

export const userEngagementDesignerInputSchema = z.object({
  triggerStrength: triggerStrengthSchema,
  actionEase: actionEaseSchema,
  rewardQuality: rewardQualitySchema,
  investmentDepth: investmentDepthSchema,
});
export type UserEngagementDesignerInput = z.infer<typeof userEngagementDesignerInputSchema>;

export const hookStageSchema = z.enum(["trigger", "action", "reward", "investment"]);
export type HookStage = z.infer<typeof hookStageSchema>;

export const userEngagementDesignerResultSchema = z.object({
  weakestStage: hookStageSchema,
  rationale: z.string(),
  secondWeakestStage: hookStageSchema,
  nextStep: z.string(),
});
export type UserEngagementDesignerResult = z.infer<typeof userEngagementDesignerResultSchema>;
