import { z } from "zod";

/**
 * AI Prompt Builder tool input/result schemas (spec v4 §37's "prompt builder"). The third use
 * of the free-text interpolation mechanic (docs/decisions/0029, 0032): the CARE framework's own
 * structure — Context, Action, Result required, Example optional — assembles directly into a
 * single prompt string. Unlike Product Positioning Builder, the select field isn't a lookup
 * into a recommendation: whether to append the "ask me one question at a time" flip instruction
 * is a direct either/or the visitor chooses for themselves. See docs/decisions/0042.
 */
export const aiPromptBuilderInputSchema = z.object({
  contextText: z.string().trim().min(1),
  actionText: z.string().trim().min(1),
  resultText: z.string().trim().min(1),
  exampleText: z.string().trim().default(""),
  includeQuestionFlip: z.enum(["yes_add_it", "no_just_the_prompt"]),
});
export type AiPromptBuilderInput = z.infer<typeof aiPromptBuilderInputSchema>;

export const aiPromptBuilderResultSchema = z.object({
  assembledPrompt: z.string(),
  tip: z.string(),
  nextStep: z.string(),
});
export type AiPromptBuilderResult = z.infer<typeof aiPromptBuilderResultSchema>;
