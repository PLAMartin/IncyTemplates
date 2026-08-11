import { z } from "zod";

/**
 * Product Idea Generator tool input/result schemas (spec v4 §37's "guided generator"). Every
 * prior Tool (8/8) is multiple-choice-only — answer fixed-option questions, get a scored or
 * classified verdict. That shape can't produce a genuinely personal idea direction, because
 * two of the three source methods (scratch your own itch, address a niche — see
 * `How I generate app ideas`) are meaningless without the visitor's own specifics. This Tool
 * is the first to add free-text inputs alongside a select — still fully deterministic (the
 * text is only ever echoed into fixed templates in `scoring.ts`, never interpreted by any
 * model) but a genuine UI/mechanic departure. See docs/decisions/0029.
 */
export const ideaMethodSchema = z.enum(["scratch_your_own_itch", "address_a_niche", "improve_existing"]);
export type IdeaMethod = z.infer<typeof ideaMethodSchema>;

export const dailyPracticeCommitmentSchema = z.enum(["not_yet", "willing_to_try", "already_do_it"]);
export type DailyPracticeCommitment = z.infer<typeof dailyPracticeCommitmentSchema>;

export const productIdeaGeneratorInputSchema = z
  .object({
    // Each maps to one of the three idea-sourcing methods from `How I generate app ideas` and
    // is optional on its own — only the object-level refine below requires at least one.
    ownFrustration: z.string().trim().default(""),
    nicheKnowledge: z.string().trim().default(""),
    frequentlyUsedProduct: z.string().trim().default(""),
    dailyPracticeCommitment: dailyPracticeCommitmentSchema,
  })
  .refine((input) => Boolean(input.ownFrustration || input.nicheKnowledge || input.frequentlyUsedProduct), {
    message: "Enter at least one answer to generate an idea direction.",
    path: ["ownFrustration"],
  });
export type ProductIdeaGeneratorInput = z.infer<typeof productIdeaGeneratorInputSchema>;

export const ideaCandidateSchema = z.object({
  method: ideaMethodSchema,
  promptText: z.string(),
  testStep: z.string(),
});
export type IdeaCandidate = z.infer<typeof ideaCandidateSchema>;

export const productIdeaGeneratorResultSchema = z.object({
  candidates: z.array(ideaCandidateSchema),
  recommendedMethod: ideaMethodSchema,
  dailyPracticeNudge: z.string(),
  nextStep: z.string(),
});
export type ProductIdeaGeneratorResult = z.infer<typeof productIdeaGeneratorResultSchema>;
