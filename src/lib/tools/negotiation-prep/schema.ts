import { z } from "zod";

/**
 * Negotiation Prep tool input/result schemas (spec v6 §37's "preparation sheet" family).
 * The fourth use of the completeness-checklist mechanic Story Builder introduced (docs/
 * decisions/0037): the source post's three named tactics — BATNA (fallback), Anchoring,
 * MESOs (multiple equivalent offers) — aren't alternatives to choose between, they're
 * complementary prep steps a visitor should ideally complete all three of before a real
 * negotiation. This Tool checks which of the three the visitor has already prepared, same
 * shape as Story Builder, not a ranked or scored result. See docs/decisions/0055.
 */
export const negotiationPrepInputSchema = z
  .object({
    batna: z.string().trim().default(""),
    anchor: z.string().trim().default(""),
    mesos: z.string().trim().default(""),
  })
  .refine((input) => Boolean(input.batna || input.anchor || input.mesos), {
    message: "Enter at least one element to check your negotiation prep.",
    path: ["batna"],
  });
export type NegotiationPrepInput = z.infer<typeof negotiationPrepInputSchema>;

export const negotiationTacticSchema = z.enum(["batna", "anchor", "mesos"]);
export type NegotiationTactic = z.infer<typeof negotiationTacticSchema>;

export const negotiationTacticStateSchema = z.object({
  tactic: negotiationTacticSchema,
  text: z.string(),
  present: z.boolean(),
});
export type NegotiationTacticState = z.infer<typeof negotiationTacticStateSchema>;

export const negotiationPrepResultSchema = z.object({
  tactics: z.array(negotiationTacticStateSchema),
  prepSummary: z.string(),
  nextTip: z.string(),
  nextStep: z.string(),
});
export type NegotiationPrepResult = z.infer<typeof negotiationPrepResultSchema>;
