import type { AiPromptBuilderInput, AiPromptBuilderResult } from "./schema";

/**
 * Deterministic prompt assembly for the Prompt Builder (spec v4 §37). No AI is involved,
 * consistent with every prior Tool (docs/decisions/0016) — the visitor's own text is only ever
 * interpolated into the CARE framework's fixed structure, never sent anywhere or rewritten by a
 * model.
 */

const QUESTION_FLIP_INSTRUCTION =
  "Now ask me one question at a time, waiting for my answer in between, to help me think this through.";

const TIP =
  "Don't settle for the first result. If it's too vague, add specificity; if it's off-topic, rephrase; if it's too much, split it into smaller prompts — and tell the chatbot directly what to change, the same way you'd give a colleague feedback.";

const NEXT_STEP = "Paste this into a chatbot, then refine it based on the reply — save the version that works well in your prompt template for next time.";

function assemblePrompt(input: AiPromptBuilderInput): string {
  const lines = [`Context: ${input.contextText}`, `Action: ${input.actionText}`, `Result: ${input.resultText}`];
  if (input.exampleText) {
    lines.push(`Example: ${input.exampleText}`);
  }
  if (input.includeQuestionFlip === "yes_add_it") {
    lines.push("", QUESTION_FLIP_INSTRUCTION);
  }
  return lines.join("\n");
}

export function buildAiPrompt(input: AiPromptBuilderInput): AiPromptBuilderResult {
  return {
    assembledPrompt: assemblePrompt(input),
    tip: TIP,
    nextStep: NEXT_STEP,
  };
}
