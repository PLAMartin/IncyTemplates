import { z } from "zod";

/**
 * App Design Review tool input/result schemas (spec v4 §37's "self-assessment"). The third use
 * of the completeness-checklist mechanic Story Builder introduced (docs/decisions/0037), back
 * to its original polarity: presence of one of Dieter Rams' ten design principles in the
 * visitor's own product is good, unlike Writing Editor's inverted checklist (docs/decisions/
 * 0040) where presence meant a problem. Ten required yes/no answers, not free text — these are
 * self-assessment judgements about an existing product. See docs/decisions/0041.
 */
export const ramsPrincipleSchema = z.enum([
  "innovative",
  "useful",
  "aesthetic",
  "understandable",
  "unobtrusive",
  "honest",
  "long_lasting",
  "thorough",
  "environmentally_friendly",
  "as_little_as_possible",
]);
export type RamsPrinciple = z.infer<typeof ramsPrincipleSchema>;

export const principleStatusSchema = z.enum(["not_yet", "already_there"]);
export type PrincipleStatus = z.infer<typeof principleStatusSchema>;

export const appDesignReviewInputSchema = z.object({
  innovative: principleStatusSchema,
  useful: principleStatusSchema,
  aesthetic: principleStatusSchema,
  understandable: principleStatusSchema,
  unobtrusive: principleStatusSchema,
  honest: principleStatusSchema,
  longLasting: principleStatusSchema,
  thorough: principleStatusSchema,
  environmentallyFriendly: principleStatusSchema,
  asLittleAsPossible: principleStatusSchema,
});
export type AppDesignReviewInput = z.infer<typeof appDesignReviewInputSchema>;

export const principleStateSchema = z.object({
  principle: ramsPrincipleSchema,
  label: z.string(),
  present: z.boolean(),
});
export type PrincipleState = z.infer<typeof principleStateSchema>;

export const appDesignReviewResultSchema = z.object({
  principleStates: z.array(principleStateSchema),
  firstTip: z.string(),
  closingNote: z.string(),
  nextStep: z.string(),
});
export type AppDesignReviewResult = z.infer<typeof appDesignReviewResultSchema>;
