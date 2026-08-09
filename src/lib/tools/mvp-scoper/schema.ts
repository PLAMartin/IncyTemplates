import { z } from "zod";

/**
 * MVP Scoper Scope Decider input/result schemas (spec v3 §37's "keep/defer/remove tool").
 * Scores one candidate feature/scope item at a time — run it once per item you're deciding
 * on, the same "single subject" shape Product Idea Assessor and Customer Discovery Kit use,
 * not Better Decision Maker's two-option comparison. The four questions mirror the
 * technique in content/guides/mvp-scoper.mdx: does it answer your riskiest open question,
 * is it actually necessary for core value, how much effort would it take, and could you
 * fake it without building it at all.
 */
export const necessitySchema = z.enum(["nice_to_have", "helps_but_not_essential", "essential_for_core_value"]);
export type Necessity = z.infer<typeof necessitySchema>;

export const riskyQuestionRelevanceSchema = z.enum(["unrelated", "partially_related", "directly_answers"]);
export type RiskyQuestionRelevance = z.infer<typeof riskyQuestionRelevanceSchema>;

export const buildEffortSchema = z.enum(["low", "medium", "high"]);
export type BuildEffort = z.infer<typeof buildEffortSchema>;

/** Could this be delivered manually/"faked" (a concierge, a spreadsheet, a manual process)
 * instead of actually being built, at least for now? */
export const fakeabilitySchema = z.enum(["no", "possibly", "yes_easily"]);
export type Fakeability = z.infer<typeof fakeabilitySchema>;

export const mvpScoperInputSchema = z.object({
  necessity: necessitySchema,
  riskyQuestionRelevance: riskyQuestionRelevanceSchema,
  buildEffort: buildEffortSchema,
  fakeability: fakeabilitySchema,
});
export type MvpScoperInput = z.infer<typeof mvpScoperInputSchema>;

export const classificationSchema = z.enum(["keep", "defer", "remove"]);
export type Classification = z.infer<typeof classificationSchema>;

export const mvpScoperResultSchema = z.object({
  score: z.number().min(0).max(100),
  classification: classificationSchema,
  fakeableOverrideApplied: z.boolean(),
  guidance: z.string(),
  nextStep: z.string(),
});
export type MvpScoperResult = z.infer<typeof mvpScoperResultSchema>;
