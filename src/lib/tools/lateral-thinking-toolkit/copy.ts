import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the Lateral Thinking Toolkit Tool (spec §14.7.1's
 * "Tool: intro/instructions, field labels, help text, result explanations, disclaimers,
 * CTA labels"). Excludes `TECHNIQUE_COPY`'s labels in tool-result-summary.tsx (coupled to
 * `scoring.ts`'s enum values) and the result's dynamic content (`prompts`, `encouragement`,
 * `nextStep` all come from `scoring.ts`).
 */
export const lateralThinkingToolkitCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 2 minutes — describe whatever you're stuck on in a sentence or two.",
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll get five prompts, one per technique, to jog your thinking from different angles.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start generating prompts" },
  question_label: { label: "Question label", kind: "text", defaultValue: "What problem or idea are you stuck on?" },
  question_hint: {
    label: "Question hint",
    kind: "text",
    defaultValue: "A sentence or two is plenty — you don't need to have it fully worked out.",
  },
  question_placeholder: {
    label: "Textarea placeholder",
    kind: "text",
    defaultValue: "e.g. I can't work out how to make our onboarding feel less generic",
  },
  generate_label: { label: "Generate button label", kind: "text", defaultValue: "Generate prompts" },
  empty_input_error: {
    label: "Empty-input error",
    kind: "text",
    defaultValue: "Describe the problem or idea you're stuck on to generate prompts.",
  },
  result_heading: { label: "Result heading", kind: "text", defaultValue: "Your prompts" },
  next_step_label: { label: "Next step field label", kind: "text", defaultValue: "Next step" },
  copy_result_label: { label: "Copy-result button label", kind: "text", defaultValue: "Copy result" },
  copied_label: { label: "Copied confirmation label", kind: "text", defaultValue: "Copied" },
  restart_label: { label: "Restart button label", kind: "text", defaultValue: "Start again" },
};
