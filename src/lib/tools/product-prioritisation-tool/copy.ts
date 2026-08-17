import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the Product Prioritisation Tool (spec §14.7.1's
 * "Tool: intro/instructions, field labels, help text..."). Scoped to intro copy and each
 * question's legend/hint, same as `mvp-scoper/copy.ts` — NOT the per-option labels/
 * descriptions (tightly coupled to `scoring.ts`).
 */
export const productPrioritisationToolCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 3 minutes — answer based on your task list as it actually stands today.",
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll get a recommended scheduling strategy, a runner-up, and one concrete next step.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start scoring your priorities" },
  q_deadlines_legend: {
    label: "Question 1 — legend",
    kind: "text",
    defaultValue: "Do your tasks have hard deadlines, or is timing flexible?",
  },
  q_deadlines_hint: { label: "Question 1 — hint (optional)", kind: "text", defaultValue: "" },
  q_everything_achievable_legend: {
    label: "Question 2 — legend",
    kind: "text",
    defaultValue: "Is everything realistically achievable, or does something have to give?",
  },
  q_everything_achievable_hint: { label: "Question 2 — hint (optional)", kind: "text", defaultValue: "" },
  q_value_variation_legend: {
    label: "Question 3 — legend",
    kind: "text",
    defaultValue: "Do your tasks vary a lot in how much they actually matter?",
  },
  q_value_variation_hint: { label: "Question 3 — hint (optional)", kind: "text", defaultValue: "" },
  q_what_would_help_most_legend: {
    label: "Question 4 — legend",
    kind: "text",
    defaultValue: "What would help most right now?",
  },
  q_what_would_help_most_hint: {
    label: "Question 4 — hint (optional)",
    kind: "text",
    defaultValue: "Think about what's actually holding you back today, not what sounds more disciplined.",
  },
};
