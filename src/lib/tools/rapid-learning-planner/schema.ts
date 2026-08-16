import { z } from "zod";

/**
 * Rapid Learning Planner tool input/result schemas (spec v7 §23.2 reuse-taxonomy sourcing —
 * the second family built by reading real posts in /admin/source-posts rather than from spec
 * §37's original portfolio table; see docs/decisions/0060). The sixth use of the
 * completeness-checklist mechanic Story Builder introduced, and the third built from optional
 * free-text fields checked for presence rather than yes/no self-assessment (Story Builder
 * 0037, Negotiation Prep 0055) — Tim Ferriss's DSSS framework (Deconstruction, Selection,
 * Sequencing, Stakes) is four planning steps for one specific skill, not properties of an
 * existing artifact, so free text fits the same way it did for those two families.
 */
export const rapidLearningStepSchema = z.enum(["deconstruction", "selection", "sequencing", "stakes"]);
export type RapidLearningStep = z.infer<typeof rapidLearningStepSchema>;

export const rapidLearningPlannerInputSchema = z
  .object({
    deconstruction: z.string().trim().default(""),
    selection: z.string().trim().default(""),
    sequencing: z.string().trim().default(""),
    stakes: z.string().trim().default(""),
  })
  .refine((input) => Boolean(input.deconstruction || input.selection || input.sequencing || input.stakes), {
    message: "Enter at least one step to check your learning plan.",
    path: ["deconstruction"],
  });
export type RapidLearningPlannerInput = z.infer<typeof rapidLearningPlannerInputSchema>;

export const rapidLearningStepStateSchema = z.object({
  step: rapidLearningStepSchema,
  text: z.string(),
  present: z.boolean(),
});
export type RapidLearningStepState = z.infer<typeof rapidLearningStepStateSchema>;

export const rapidLearningPlannerResultSchema = z.object({
  steps: z.array(rapidLearningStepStateSchema),
  planSummary: z.string(),
  nextTip: z.string(),
  nextStep: z.string(),
});
export type RapidLearningPlannerResult = z.infer<typeof rapidLearningPlannerResultSchema>;
