import { z } from "zod";

/**
 * Product Positioning Builder tool input/result schemas (spec v4 §37's "statement builder").
 * Unlike the last three Tools (Pricing Your Product, Business Model Chooser, Decision
 * Framework Picker), this isn't a named-candidate scoring matrix — the source material (*How
 * to build a brand that makes money*) doesn't contain a generic "for X who Y" positioning
 * template to score against, and inventing one would mean shipping content not actually
 * grounded in the source post. Instead this reuses Product Idea Generator's free-text
 * interpolation mechanic (docs/decisions/0029): three required and one optional free-text
 * field assembled into a positioning statement using the source post's own "pair an action
 * with a product to reach a desired outcome, tied to what the customer admires" formula, plus
 * one direct-lookup select for which of the source post's five "get past the brain's bouncer"
 * cut-through tactics fits. See docs/decisions/0032.
 */
export const cutThroughApproachSchema = z.enum([
  "problem_people_actively_worry_about",
  "unusual_or_unexpected_offer",
  "visually_or_emotionally_striking",
  "can_give_away_something_valuable_upfront",
  "building_repeated_content_over_time",
]);
export type CutThroughApproach = z.infer<typeof cutThroughApproachSchema>;

export const productPositioningBuilderInputSchema = z.object({
  idealCustomer: z.string().trim().min(1),
  desiredAction: z.string().trim().min(1),
  desiredOutcome: z.string().trim().min(1),
  admiredIdentity: z.string().trim().default(""),
  cutThroughApproach: cutThroughApproachSchema,
});
export type ProductPositioningBuilderInput = z.infer<typeof productPositioningBuilderInputSchema>;

export const cutThroughTacticSchema = z.enum(["scary", "strange", "sexy", "free_gift", "familiar"]);
export type CutThroughTactic = z.infer<typeof cutThroughTacticSchema>;

export const productPositioningBuilderResultSchema = z.object({
  positioningStatement: z.string(),
  recommendedTactic: cutThroughTacticSchema,
  tacticExplanation: z.string(),
  nextStep: z.string(),
});
export type ProductPositioningBuilderResult = z.infer<typeof productPositioningBuilderResultSchema>;
