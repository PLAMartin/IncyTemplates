import { z } from "zod";

/**
 * Customer Demand Test tool input/result schemas (spec v4 §37's "test selector"). Reverts to
 * the named-candidate scoring-matrix mechanic (docs/decisions/0028, 0030, 0031) after Product
 * Positioning Builder's departure (docs/decisions/0032) — the source material here (*Before
 * building it, test if anyone wants it*) genuinely names four comparable pretotyping
 * techniques (Fake Door Test, Wizard of Oz, YouTube MVP, The Infiltrator), so the scoring shape
 * fits without inventing anything. See docs/decisions/0033.
 */
export const explainabilitySchema = z.enum(["easy_to_explain_in_words", "needs_a_demo_to_click"]);
export type Explainability = z.infer<typeof explainabilitySchema>;

export const manualFulfilmentSchema = z.enum(["could_fulfil_manually", "cant_fake_it_manually"]);
export type ManualFulfilment = z.infer<typeof manualFulfilmentSchema>;

export const existingPlatformSchema = z.enum(["yes_fits_an_existing_platform", "no_need_my_own_channel"]);
export type ExistingPlatform = z.infer<typeof existingPlatformSchema>;

export const reachNeededSchema = z.enum(["a_handful_of_real_users", "as_wide_as_possible"]);
export type ReachNeeded = z.infer<typeof reachNeededSchema>;

export const customerDemandTestInputSchema = z.object({
  explainability: explainabilitySchema,
  manualFulfilment: manualFulfilmentSchema,
  existingPlatform: existingPlatformSchema,
  reachNeeded: reachNeededSchema,
});
export type CustomerDemandTestInput = z.infer<typeof customerDemandTestInputSchema>;

export const pretotypeTestSchema = z.enum(["fake_door_test", "wizard_of_oz", "youtube_mvp", "the_infiltrator"]);
export type PretotypeTest = z.infer<typeof pretotypeTestSchema>;

export const customerDemandTestResultSchema = z.object({
  recommendedTest: pretotypeTestSchema,
  rationale: z.string(),
  runnerUpTest: pretotypeTestSchema.nullable(),
  decidingFactor: z.string().nullable(),
  nextStep: z.string(),
});
export type CustomerDemandTestResult = z.infer<typeof customerDemandTestResultSchema>;
