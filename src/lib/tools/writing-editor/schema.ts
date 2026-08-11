import { z } from "zod";

/**
 * Writing Editor tool input/result schemas (spec v4 §37's "structured editing review"). The
 * second use of the completeness-checklist mechanic Story Builder introduced (docs/decisions/
 * 0037), inverted: Story Builder checks presence of five required parts against free text this
 * Tool checks presence of five undesired problems against five required yes/no answers, drawn
 * from George Orwell's "Politics and the English Language" rules. Flagged (present: true) means
 * the draft still has the problem; an all-clean result is the best outcome, the inverse of
 * Story Builder's presence-is-good shape. See docs/decisions/0040.
 */
export const orwellRuleSchema = z.enum(["cliched_language", "inflated_vocabulary", "unnecessary_words", "passive_voice", "jargon"]);
export type OrwellRule = z.infer<typeof orwellRuleSchema>;

export const ruleStatusSchema = z.enum(["still_a_problem", "already_clean"]);
export type RuleStatus = z.infer<typeof ruleStatusSchema>;

export const writingEditorInputSchema = z.object({
  clichedLanguage: ruleStatusSchema,
  inflatedVocabulary: ruleStatusSchema,
  unnecessaryWords: ruleStatusSchema,
  passiveVoice: ruleStatusSchema,
  jargon: ruleStatusSchema,
});
export type WritingEditorInput = z.infer<typeof writingEditorInputSchema>;

export const ruleStateSchema = z.object({
  rule: orwellRuleSchema,
  label: z.string(),
  present: z.boolean(),
});
export type RuleState = z.infer<typeof ruleStateSchema>;

export const writingEditorResultSchema = z.object({
  ruleStates: z.array(ruleStateSchema),
  firstFixTip: z.string(),
  closingNote: z.string(),
  nextStep: z.string(),
});
export type WritingEditorResult = z.infer<typeof writingEditorResultSchema>;
