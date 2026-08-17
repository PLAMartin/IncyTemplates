import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the AI Prompt Builder Tool (spec §14.7.1). Scoped to
 * intro copy and each step's legend/hint/placeholder, same as `mvp-scoper/copy.ts` —
 * deliberately NOT the select step's option labels/descriptions, since those are tightly
 * coupled to the assembly logic in `scoring.ts`.
 */
export const aiPromptBuilderCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 3 minutes — answer with a specific task in mind, the one you actually want a chatbot's help with.",
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll get a ready-to-paste prompt, built from the CARE framework.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start building your prompt" },
  q_context_text_legend: {
    label: "Context step — legend",
    kind: "text",
    defaultValue: "Context — who or what should the chatbot act as, and what's the situation?",
  },
  q_context_text_hint: { label: "Context step — hint", kind: "text", defaultValue: "Set the scene — who's involved, and in what role." },
  q_context_text_placeholder: {
    label: "Context step — placeholder",
    kind: "text",
    defaultValue: "e.g. You're a nutritionist helping a busy parent plan meals.",
  },
  q_action_text_legend: { label: "Action step — legend", kind: "text", defaultValue: "Action — what should the chatbot actually do?" },
  q_action_text_hint: { label: "Action step — hint", kind: "text", defaultValue: "The specific action, not just the topic." },
  q_action_text_placeholder: {
    label: "Action step — placeholder",
    kind: "text",
    defaultValue: "e.g. Create a 7-day vegetarian meal plan with calorie counts and recipes.",
  },
  q_result_text_legend: {
    label: "Result step — legend",
    kind: "text",
    defaultValue: "Result — what format or output do you want back?",
  },
  q_result_text_hint: {
    label: "Result step — hint",
    kind: "text",
    defaultValue: "Be specific about structure — table, list, word count, tone.",
  },
  q_result_text_placeholder: {
    label: "Result step — placeholder",
    kind: "text",
    defaultValue: "e.g. A table with one row per day, plus a shopping list at the end.",
  },
  q_example_text_legend: { label: "Example step — legend", kind: "text", defaultValue: "Example — have something to guide the style?" },
  q_example_text_hint: { label: "Example step — hint", kind: "text", defaultValue: "Optional — skip if you don't have one." },
  q_example_text_placeholder: {
    label: "Example step — placeholder",
    kind: "text",
    defaultValue: "e.g. Day 1 – Breakfast: overnight oats (320 cal)...",
  },
  q_include_question_flip_legend: {
    label: "Question-flip step — legend",
    kind: "text",
    defaultValue: "Should the chatbot ask you questions first, instead of answering straight away?",
  },
};
