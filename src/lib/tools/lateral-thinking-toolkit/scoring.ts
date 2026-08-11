import type { LateralThinkingTechnique, LateralThinkingToolkitInput, LateralThinkingToolkitResult, PromptCard } from "./schema";

/**
 * Deterministic prompt generation for the Lateral Thinking Prompt Generator (spec v4 §37). No
 * AI is involved, consistent with every prior Tool (docs/decisions/0016) — the visitor's own
 * words are only ever interpolated into one of five fixed template strings, never sent
 * anywhere or interpreted by any model, so the same input always produces the same result.
 *
 * Unlike every prior Tool, there is no ranking, recommendation or "winner" — all five prompts
 * are always generated together, in the source post's own listed order. See `schema.ts` for
 * why (docs/decisions/0035).
 */

// Fixed order — the source post's own listed order (Perceptual change, Random input,
// Provocation, then Specificity and Scale from the companion post).
const TECHNIQUE_ORDER: LateralThinkingTechnique[] = ["perceptual_change", "random_input", "provocation", "specificity", "scale"];

const PROMPT_TEMPLATE: Record<LateralThinkingTechnique, (problem: string) => string> = {
  perceptual_change: (problem) =>
    `Look at "${problem}" from someone else's position entirely — a competitor, a total beginner, or the person most annoyed by it. What would they see that you don't?`,
  random_input: (problem) =>
    `Pick a completely unrelated object at random — the nearest one to you right now. Force a connection: what does it have in common with "${problem}", and what does that suggest?`,
  provocation: (problem) => `State the opposite of what you currently believe about "${problem}". What if that were true instead? Why not?`,
  specificity: (problem) =>
    `Drop the generic description of "${problem}". What's the one small, concrete, sensory detail you're overlooking — the thing an outsider would actually notice first?`,
  scale: (problem) =>
    `Push "${problem}" to an extreme. What would the smallest possible version look like? The biggest? What changes if it happened instantly, or took ten years?`,
};

const ENCOURAGEMENT =
  "Don't judge these yet. The pottery-class lesson: the group that made 30 pots and picked the best beat the group that spent the whole month perfecting one. Write down whatever each prompt sparks, even if it feels bad — quantity comes before quality.";

const NEXT_STEP = "Once one of these sparks a real direction, take it to Product Idea Assessor to work out how much evidence it needs before you commit real time to it.";

export function generateLateralThinkingPrompts(input: LateralThinkingToolkitInput): LateralThinkingToolkitResult {
  const problem = input.problemOrIdea.trim();

  const prompts: PromptCard[] = TECHNIQUE_ORDER.map((technique) => ({
    technique,
    promptText: PROMPT_TEMPLATE[technique](problem),
  }));

  return {
    prompts,
    encouragement: ENCOURAGEMENT,
    nextStep: NEXT_STEP,
  };
}
