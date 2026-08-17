import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the Decision Framework Picker Tool (spec §14.7.1's
 * "Tool: intro/instructions, field labels, help text, result explanations, disclaimers,
 * CTA labels"). Excludes per-option labels/descriptions and `FRAMEWORK_COPY`'s labels in
 * tool-result-summary.tsx — those are coupled to `scoring.ts`'s enum values.
 */
export const decisionFrameworkPickerCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 3 minutes — answer based on the decision actually in front of you.",
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll get a recommended thinking framework, a runner-up, and one concrete next step.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start picking a framework" },
  q_involvement_legend: {
    label: "Question 1 — legend",
    kind: "text",
    defaultValue: "Are multiple people or perspectives involved, or is it just you?",
  },
  q_decision_shape_legend: { label: "Question 2 — legend", kind: "text", defaultValue: "What shape is this choice?" },
  q_precedent_legend: {
    label: "Question 3 — legend",
    kind: "text",
    defaultValue: "Is there a clear existing approach you could copy?",
  },
  q_time_worth_investing_legend: {
    label: "Question 4 — legend",
    kind: "text",
    defaultValue: "How much time and thought is this decision actually worth?",
  },
  q_time_worth_investing_hint: {
    label: "Question 4 — hint",
    kind: "text",
    defaultValue: "Be honest — most decisions deserve less deliberation than they get.",
  },
  back_label: { label: "Back button label", kind: "text", defaultValue: "Back" },
  continue_label: { label: "Continue button label", kind: "text", defaultValue: "Continue" },
  see_result_label: { label: "Final step button label", kind: "text", defaultValue: "See my result" },
  choose_option_error: { label: "Unanswered-question error", kind: "text", defaultValue: "Choose an option to continue." },
  result_heading_prefix: { label: "Result heading prefix", kind: "text", defaultValue: "Your result: " },
  runner_up_label: { label: "Runner-up field label", kind: "text", defaultValue: "Runner-up" },
  deciding_factor_label: { label: "Deciding factor field label", kind: "text", defaultValue: "Deciding factor" },
  next_step_label: { label: "Next step field label", kind: "text", defaultValue: "Next step" },
  disclaimer: {
    label: "Disclaimer",
    kind: "textarea",
    defaultValue:
      "This points you at a technique worth trying today, not a permanent rule — different decisions call for different frameworks, so expect to come back and answer differently next time.",
  },
  copy_result_label: { label: "Copy-result button label", kind: "text", defaultValue: "Copy result" },
  copied_label: { label: "Copied confirmation label", kind: "text", defaultValue: "Copied" },
  restart_label: { label: "Restart button label", kind: "text", defaultValue: "Choose again" },
};
