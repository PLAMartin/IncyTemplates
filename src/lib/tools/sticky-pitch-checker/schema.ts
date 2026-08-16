import { z } from "zod";

/**
 * Sticky Pitch Checker tool input/result schemas (spec v7 §23.2 reuse-taxonomy sourcing —
 * the first family built by reviewing the A Bit Gamey source-post corpus directly, not from
 * spec §37's original portfolio table; see docs/decisions/0057). The fifth use of the
 * completeness-checklist mechanic Story Builder introduced, same polarity as App Design
 * Review: presence of a factor is good, ten required yes/no answers rather than free text —
 * these are self-assessment judgements about an existing pitch, not fields to fill in.
 *
 * Ten factors, merged from two source frameworks that turned out to overlap on two points
 * (Emotional/Emotion, Story/Stories — each source post explicitly cross-references the
 * other's post for exactly these two ideas): Chip & Dan Heath's SUCCESs (memorable) minus
 * nothing, plus Jonah Berger's STEPPS (spreadable) minus its two SUCCESs-duplicate factors.
 */
export const stickyPitchFactorSchema = z.enum([
  "simple",
  "unexpected",
  "concrete",
  "credible",
  "emotional",
  "story",
  "social_currency",
  "triggers",
  "public",
  "practical_value",
]);
export type StickyPitchFactor = z.infer<typeof stickyPitchFactorSchema>;

export const factorGroupSchema = z.enum(["stick", "spread"]);
export type FactorGroup = z.infer<typeof factorGroupSchema>;

export const factorStatusSchema = z.enum(["not_yet", "already_there"]);
export type FactorStatus = z.infer<typeof factorStatusSchema>;

export const stickyPitchCheckerInputSchema = z.object({
  simple: factorStatusSchema,
  unexpected: factorStatusSchema,
  concrete: factorStatusSchema,
  credible: factorStatusSchema,
  emotional: factorStatusSchema,
  story: factorStatusSchema,
  socialCurrency: factorStatusSchema,
  triggers: factorStatusSchema,
  public: factorStatusSchema,
  practicalValue: factorStatusSchema,
});
export type StickyPitchCheckerInput = z.infer<typeof stickyPitchCheckerInputSchema>;

export const factorStateSchema = z.object({
  factor: stickyPitchFactorSchema,
  group: factorGroupSchema,
  label: z.string(),
  present: z.boolean(),
});
export type FactorState = z.infer<typeof factorStateSchema>;

export const stickyPitchCheckerResultSchema = z.object({
  factorStates: z.array(factorStateSchema),
  // 6 "stick" factors (Simple/Unexpected/Concrete/Credible/Emotional/Story) and 4 "spread"
  // factors (Social Currency/Triggers/Public/Practical Value) -- Emotional and Story are
  // grouped under "stick" only, not double-counted, since they're one merged factor each.
  stickCount: z.number().int().min(0).max(6),
  spreadCount: z.number().int().min(0).max(4),
  firstTip: z.string(),
  closingNote: z.string(),
  nextStep: z.string(),
});
export type StickyPitchCheckerResult = z.infer<typeof stickyPitchCheckerResultSchema>;
