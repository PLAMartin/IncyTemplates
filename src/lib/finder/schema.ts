import { z } from "zod";

/**
 * Next Step Finder input/result schemas (spec v3 §22). Three questions, not the spec's
 * full five-question example set — §22.2 explicitly frames its list as "for example," and
 * §22's own design principle ("should not force users to know [Guide/Template/Tool] labels
 * if a better recommendation is clear") is best served by asking fewer, more load-bearing
 * questions rather than padding out to five. `outcome` does the work of both the spec's
 * "what are you working on" and "which journey stage" questions at once, since every
 * outcome option maps directly to exactly one of the published frameworks (each of
 * which already has its own single journey stage) — see docs/decisions/0026.
 */
export const outcomeSchema = z.enum([
  "assess_idea",
  "gather_evidence",
  "make_a_decision",
  "scope_the_build",
  "choose_a_name",
  "find_customers",
  "check_fit",
  "choose_pricing",
  "generate_ideas",
  "choose_business_model",
  "pick_a_decision_framework",
  "build_positioning",
  "test_demand",
  "not_sure",
]);
export type Outcome = z.infer<typeof outcomeSchema>;

/** How much work the visitor has already done — the spec's "how much evidence/work have
 * you already done" question, used as the *default* output-type guess unless
 * `outputPreference` overrides it. */
export const progressSchema = z.enum(["nothing_yet", "some_thinking_or_evidence", "clear_decision_or_scope"]);
export type Progress = z.infer<typeof progressSchema>;

/** The spec's "learn / structure the work / get an interactive result" question, plus a
 * "no preference" option so a visitor who doesn't have one isn't forced to pick — the
 * recommendation then falls back to `progress`'s inference instead. */
export const outputPreferenceSchema = z.enum(["learn", "structure_it_myself", "interactive_result", "no_preference"]);
export type OutputPreference = z.infer<typeof outputPreferenceSchema>;

export const finderInputSchema = z.object({
  outcome: outcomeSchema,
  progress: progressSchema,
  outputPreference: outputPreferenceSchema,
});
export type FinderInput = z.infer<typeof finderInputSchema>;

export const finderOutputTypeSchema = z.enum(["guide", "template", "tool"]);
export type FinderOutputType = z.infer<typeof finderOutputTypeSchema>;

export const finderRecommendationSchema = z.object({
  frameworkSlug: z.string(),
  outputType: finderOutputTypeSchema,
  reason: z.string(),
});
export type FinderRecommendation = z.infer<typeof finderRecommendationSchema>;

export const finderResultSchema = z.object({
  primary: finderRecommendationSchema,
  // Spec §22.3: "up to two supporting/next-step recommendations."
  supporting: z.array(finderRecommendationSchema).max(2),
  isFreeStart: z.boolean(),
});
export type FinderResult = z.infer<typeof finderResultSchema>;

/**
 * Minimal projection of a published framework and its outputs that `resolveNextStep` needs
 * — deliberately not the full `Framework`/`ProductSummary` types, so the rules engine (and
 * its unit tests) don't depend on the full catalogue shape. The UI layer is responsible for
 * projecting real fetched data into this shape and, afterwards, resolving a `FinderResult`
 * back into actual `ProductSummary` objects to render.
 */
export type FinderFrameworkOption = {
  /** The framework's DB id — unused by the rules engine itself (which only ever compares
   * slugs), kept here so the UI layer can look real products up by `framework_id` after
   * `resolveNextStep` returns a slug-based recommendation, without a second parallel list. */
  id: string;
  slug: string;
  name: string;
  outcomeStatement: string;
  nextStepFrameworkSlug: string | null;
  outputs: { productType: FinderOutputType; accessType: "free" | "paid" }[];
};
