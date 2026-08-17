import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the Pricing Your Product Tool (spec v8 §10.11.5). Scoped
 * to intro copy, question legends/hints, button/nav labels, validation errors and the result
 * screen's static labels/disclaimer — NOT `MODEL_COPY` in tool-result-summary.tsx (keyed off
 * the fixed `PricingModel` enum, same role as an option label) or the "Subscription models
 * ruled out" badge (tightly coupled to the `oneOffGateApplied` gate), and NOT each question's
 * option label/description (coupled to the branching values in scoring.ts) — same reasoning
 * as mvp-scoper/copy.ts's exclusions.
 */
export const pricingYourProductCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 3 minutes — answer based on how you actually plan to sell, not what sounds impressive.",
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll get a recommended pricing model, a runner-up, and one concrete next step.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start choosing a pricing model" },
  q_purchase_pattern_legend: {
    label: "Question 1 — legend",
    kind: "text",
    defaultValue: "Do customers get value from this once, or does it keep delivering value over time?",
  },
  q_purchase_pattern_hint: { label: "Question 1 — hint (optional)", kind: "text", defaultValue: "" },
  q_value_metric_legend: {
    label: "Question 2 — legend",
    kind: "text",
    defaultValue: "Does the value scale with something you could count — seats, usage, projects?",
  },
  q_value_metric_hint: { label: "Question 2 — hint (optional)", kind: "text", defaultValue: "" },
  q_customer_type_legend: { label: "Question 3 — legend", kind: "text", defaultValue: "Who's the primary buyer?" },
  q_customer_type_hint: { label: "Question 3 — hint (optional)", kind: "text", defaultValue: "" },
  q_price_visibility_legend: {
    label: "Question 4 — legend",
    kind: "text",
    defaultValue: "How easily can your customers compare your price to competitors'?",
  },
  q_price_visibility_hint: {
    label: "Question 4 — hint (optional)",
    kind: "text",
    defaultValue: "Think about whether a prospective customer could put your price next to a competitor's in the same tab.",
  },
  back_button: { label: "Back button label", kind: "text", defaultValue: "Back" },
  continue_button: { label: "Continue button label", kind: "text", defaultValue: "Continue" },
  final_step_button: { label: "Final step button label", kind: "text", defaultValue: "See my result" },
  error_choose_option: { label: "Validation error — no option chosen", kind: "text", defaultValue: "Choose an option to continue." },
  error_missing: {
    label: "Validation error — incomplete answers",
    kind: "text",
    defaultValue: "Something's missing — please check every question was answered.",
  },
  result_runner_up_label: { label: "Result — runner-up field label", kind: "text", defaultValue: "Runner-up" },
  result_deciding_factor_label: { label: "Result — deciding factor field label", kind: "text", defaultValue: "Deciding factor" },
  result_next_step_label: { label: "Result — next-step field label", kind: "text", defaultValue: "Next step" },
  result_disclaimer: {
    label: "Result — disclaimer",
    kind: "textarea",
    defaultValue:
      "This is a starting recommendation based on today's answers, not a permanent choice — revisit it once you have real customers and real pricing conversations to test it against.",
  },
  result_copy_button: { label: "Result — copy button label", kind: "text", defaultValue: "Copy result" },
  result_copied_label: { label: "Result — copied confirmation label", kind: "text", defaultValue: "Copied" },
  result_restart_button: { label: "Result — restart button label", kind: "text", defaultValue: "Choose again" },
};
