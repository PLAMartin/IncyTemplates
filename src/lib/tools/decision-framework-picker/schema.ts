import { z } from "zod";

/**
 * Decision Framework Picker tool input/result schemas (spec v4 §37's "framework picker").
 * Reuses the named-candidate scoring-matrix mechanic (docs/decisions/0028, 0030) a third time:
 * four named thinking techniques scored across four dimensions, with a runner-up and deciding
 * factor, no gate.
 *
 * The four candidates are deliberately distinct from Better Decision Maker's four techniques
 * (reversibility, inversion, simple rules, expected value — see
 * `content/seed/catalogue.ts`'s Decision Worksheet description) so this family recommends a
 * genuinely different menu rather than re-picking what Better Decision Maker already bundles
 * into one process. See docs/decisions/0031.
 */
export const involvementSchema = z.enum(["just_me", "multiple_people_or_perspectives_needed"]);
export type Involvement = z.infer<typeof involvementSchema>;

export const decisionShapeSchema = z.enum(["sequence_of_options", "one_decision_to_reason_through", "small_frequent_choice"]);
export type DecisionShape = z.infer<typeof decisionShapeSchema>;

export const precedentSchema = z.enum(["clear_precedent_to_copy", "no_clear_precedent"]);
export type Precedent = z.infer<typeof precedentSchema>;

export const timeWorthInvestingSchema = z.enum(["worth_real_time_and_thought", "not_worth_much_time"]);
export type TimeWorthInvesting = z.infer<typeof timeWorthInvestingSchema>;

export const decisionFrameworkPickerInputSchema = z.object({
  involvement: involvementSchema,
  decisionShape: decisionShapeSchema,
  precedent: precedentSchema,
  timeWorthInvesting: timeWorthInvestingSchema,
});
export type DecisionFrameworkPickerInput = z.infer<typeof decisionFrameworkPickerInputSchema>;

export const decisionFrameworkSchema = z.enum(["six_thinking_hats", "first_principles", "razors", "boundary_rule"]);
export type DecisionFramework = z.infer<typeof decisionFrameworkSchema>;

export const decisionFrameworkPickerResultSchema = z.object({
  recommendedFramework: decisionFrameworkSchema,
  rationale: z.string(),
  runnerUpFramework: decisionFrameworkSchema.nullable(),
  decidingFactor: z.string().nullable(),
  nextStep: z.string(),
});
export type DecisionFrameworkPickerResult = z.infer<typeof decisionFrameworkPickerResultSchema>;
