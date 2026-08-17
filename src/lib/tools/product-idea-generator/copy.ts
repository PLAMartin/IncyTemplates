import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the Product Idea Generator Tool (spec v8 §10.11.5).
 * Scoped to intro copy, the three free-text steps' legend/placeholder/hint (the entirety of
 * their content — no option label/description to exclude there), the select step's legend
 * only (its option label/description are coupled to the `DailyPracticeCommitment` enum),
 * button/nav labels, validation errors, and the result screen's static labels/disclaimer —
 * NOT `METHOD_COPY` in tool-result-summary.tsx (keyed off the fixed `IdeaMethod` enum, same
 * role as an option label).
 */
export const productIdeaGeneratorCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 3 minutes — answer whichever questions apply to you, and skip the rest.",
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: { label: "Intro bullet 3", kind: "text", defaultValue: "You'll get a personalised idea direction and a first test step." },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start generating ideas" },
  q_own_frustration_legend: {
    label: "Question 1 — legend",
    kind: "text",
    defaultValue: "What's something in your daily life or work that quietly annoys you or wastes your time?",
  },
  q_own_frustration_placeholder: {
    label: "Question 1 — placeholder",
    kind: "text",
    defaultValue: "e.g. Chasing up invoices that are just sitting unpaid",
  },
  q_own_frustration_hint: { label: "Question 1 — hint", kind: "text", defaultValue: "Optional — skip if nothing comes to mind." },
  q_niche_knowledge_legend: {
    label: "Question 2 — legend",
    kind: "text",
    defaultValue: "What specific group of people or world do you understand well from the inside?",
  },
  q_niche_knowledge_placeholder: { label: "Question 2 — placeholder", kind: "text", defaultValue: "e.g. Amateur triathlon coaches" },
  q_niche_knowledge_hint: {
    label: "Question 2 — hint",
    kind: "text",
    defaultValue: "A hobby, a job, a community — anywhere you're already an insider. Optional.",
  },
  q_frequently_used_product_legend: {
    label: "Question 3 — legend",
    kind: "text",
    defaultValue: "Name a product or app you use often that you think could be better.",
  },
  q_frequently_used_product_placeholder: { label: "Question 3 — placeholder", kind: "text", defaultValue: "e.g. My gym's booking app" },
  q_frequently_used_product_hint: { label: "Question 3 — hint", kind: "text", defaultValue: "Optional — skip if nothing comes to mind." },
  q_daily_practice_legend: {
    label: "Question 4 — legend",
    kind: "text",
    defaultValue: "How ready are you to commit to noting down ideas daily?",
  },
  back_button: { label: "Back button label", kind: "text", defaultValue: "Back" },
  continue_button: { label: "Continue button label", kind: "text", defaultValue: "Continue" },
  final_step_button: { label: "Final step button label", kind: "text", defaultValue: "See my result" },
  error_choose_option: { label: "Validation error — no option chosen", kind: "text", defaultValue: "Choose an option to continue." },
  error_incomplete: {
    label: "Validation error — nothing entered",
    kind: "text",
    defaultValue: "Enter at least one answer above to generate an idea direction — use Back to add one.",
  },
  result_heading: { label: "Result — heading", kind: "text", defaultValue: "Your idea direction" },
  result_test_step_label: { label: "Result — first test step field label", kind: "text", defaultValue: "First test step" },
  result_daily_practice_label: { label: "Result — daily practice field label", kind: "text", defaultValue: "Daily practice" },
  result_next_step_label: { label: "Result — next-step field label", kind: "text", defaultValue: "Next step" },
  result_others_heading: { label: "Result — 'also worth exploring' heading", kind: "text", defaultValue: "Also worth exploring" },
  result_disclaimer: {
    label: "Result — disclaimer",
    kind: "textarea",
    defaultValue:
      "These are starting directions based on today's answers, not finished ideas — the point is to give you something concrete to test, not a guaranteed winner.",
  },
  result_copy_button: { label: "Result — copy button label", kind: "text", defaultValue: "Copy result" },
  result_copied_label: { label: "Result — copied confirmation label", kind: "text", defaultValue: "Copied" },
  result_restart_button: { label: "Result — restart button label", kind: "text", defaultValue: "Start again" },
};
