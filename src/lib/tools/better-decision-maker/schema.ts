import { z } from "zod";

/**
 * Better Decision Maker Expected Value Comparator input/result schemas (spec v3 §37's
 * "expected-value tool"). Unlike Product Idea Assessor and Customer Discovery Kit's Tools
 * (both score a single subject), this Tool compares exactly two options side by side —
 * the guide's core technique (content/guides/better-decision-maker.mdx) is "estimate
 * expected value for each option, then let reversibility break a close call," which only
 * makes sense with something to compare against.
 */
export const likelihoodSchema = z.enum(["low", "medium", "high"]);
export type Likelihood = z.infer<typeof likelihoodSchema>;

export const impactSchema = z.enum(["small", "moderate", "large"]);
export type Impact = z.infer<typeof impactSchema>;

export const effortSchema = z.enum(["low", "medium", "high"]);
export type Effort = z.infer<typeof effortSchema>;

/** "Two-way door" / "one-way door" — the reversibility framing the guide teaches: how easy
 * an option is to back out of if it turns out to be wrong. */
export const reversibilitySchema = z.enum(["two_way_door", "one_way_door"]);
export type Reversibility = z.infer<typeof reversibilitySchema>;

export const betterDecisionMakerInputSchema = z.object({
  optionALikelihood: likelihoodSchema,
  optionAImpact: impactSchema,
  optionAEffort: effortSchema,
  optionAReversibility: reversibilitySchema,
  optionBLikelihood: likelihoodSchema,
  optionBImpact: impactSchema,
  optionBEffort: effortSchema,
  optionBReversibility: reversibilitySchema,
});
export type BetterDecisionMakerInput = z.infer<typeof betterDecisionMakerInputSchema>;

export const recommendationSchema = z.enum(["option_a", "option_b", "too_close_to_call"]);
export type Recommendation = z.infer<typeof recommendationSchema>;

export const confidenceSchema = z.enum(["clear", "close"]);
export type Confidence = z.infer<typeof confidenceSchema>;

export const betterDecisionMakerResultSchema = z.object({
  optionAExpectedValue: z.number().min(0).max(100),
  optionBExpectedValue: z.number().min(0).max(100),
  recommendation: recommendationSchema,
  confidence: confidenceSchema,
  guidance: z.string(),
  nextStep: z.string(),
});
export type BetterDecisionMakerResult = z.infer<typeof betterDecisionMakerResultSchema>;
