import { z } from "zod";

/**
 * Lateral Thinking Toolkit tool input/result schemas (spec v4 §37's "interactive prompts").
 * A third distinct Tool mechanic shape, after the named-candidate scoring matrix
 * (docs/decisions/0028) and free-text statement assembly (docs/decisions/0029, 0032): one
 * free-text input generates a fixed set of prompt cards, deliberately with no ranking or
 * recommended "winner." Ranking a handful of creative prompts against each other would
 * contradict the source material's own explicit lesson (*Show me your bad ideas*: generate
 * volume, don't judge early) — every prior Tool has rewarded picking one option, but doing
 * that here would undermine the technique it's teaching. See docs/decisions/0035.
 */
export const lateralThinkingToolkitInputSchema = z.object({
  problemOrIdea: z.string().trim().min(1),
});
export type LateralThinkingToolkitInput = z.infer<typeof lateralThinkingToolkitInputSchema>;

export const lateralThinkingTechniqueSchema = z.enum(["perceptual_change", "random_input", "provocation", "specificity", "scale"]);
export type LateralThinkingTechnique = z.infer<typeof lateralThinkingTechniqueSchema>;

export const promptCardSchema = z.object({
  technique: lateralThinkingTechniqueSchema,
  promptText: z.string(),
});
export type PromptCard = z.infer<typeof promptCardSchema>;

export const lateralThinkingToolkitResultSchema = z.object({
  prompts: z.array(promptCardSchema),
  encouragement: z.string(),
  nextStep: z.string(),
});
export type LateralThinkingToolkitResult = z.infer<typeof lateralThinkingToolkitResultSchema>;
