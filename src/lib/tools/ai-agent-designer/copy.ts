import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the AI Agent Designer Tool (spec §14.7.1). Scoped to
 * intro copy and each question's legend/hint, same as `mvp-scoper/copy.ts` — deliberately NOT
 * the per-option labels/descriptions, since those are tightly coupled to the gate/pattern
 * logic in `scoring.ts`.
 */
export const aiAgentDesignerCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 3 minutes — answer with a specific AI feature or task in mind.",
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll get a recommended architecture — or told you don't need an agent at all.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start the questionnaire" },
  q_task_predictability_legend: {
    label: "Question 1 — legend",
    kind: "text",
    defaultValue: "Does this task follow a predictable, fixed path?",
  },
  q_task_predictability_hint: { label: "Question 1 — hint (optional)", kind: "text", defaultValue: "" },
  q_needs_self_critique_legend: {
    label: "Question 2 — legend",
    kind: "text",
    defaultValue: "Does quality improve by critiquing and refining the output?",
  },
  q_needs_self_critique_hint: { label: "Question 2 — hint (optional)", kind: "text", defaultValue: "" },
  q_needs_subtask_decomposition_legend: {
    label: "Question 3 — legend",
    kind: "text",
    defaultValue: "Does the task split into subtasks that specialised workers could each handle?",
  },
  q_needs_subtask_decomposition_hint: { label: "Question 3 — hint (optional)", kind: "text", defaultValue: "" },
  q_needs_different_handling_legend: {
    label: "Question 4 — legend",
    kind: "text",
    defaultValue: "Do different kinds of requests need genuinely different handling?",
  },
  q_needs_different_handling_hint: { label: "Question 4 — hint (optional)", kind: "text", defaultValue: "" },
  q_needs_multi_step_reasoning_legend: {
    label: "Question 5 — legend",
    kind: "text",
    defaultValue: "Does it need multi-step reasoning, where each step builds on the last?",
  },
  q_needs_multi_step_reasoning_hint: { label: "Question 5 — hint (optional)", kind: "text", defaultValue: "" },
  q_needs_external_data_legend: {
    label: "Question 6 — legend",
    kind: "text",
    defaultValue: "Does it need current or external information the base model doesn't already have?",
  },
  q_needs_external_data_hint: { label: "Question 6 — hint (optional)", kind: "text", defaultValue: "" },
};
