import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the Meeting Reset Tool (spec v8 §10.11.5). Scoped to
 * intro copy, question legends/hints, button/nav labels, validation errors and the result
 * screen's static copy — deliberately NOT `VERDICT_COPY` in tool-result-summary.tsx (verdict
 * label doubles as the keep/change tone switch driving styling, and not each question's
 * option label/description (tightly coupled to the branching values in scoring.ts) — same
 * reasoning as mvp-scoper/copy.ts's exclusions.
 */
export const meetingResetCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 2 minutes — answer based on a specific meeting, recurring or proposed.",
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll get a clear verdict — keep it, trim it, replace it, or cancel it.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start the diagnostic" },
  q_purpose_legend: { label: "Question 1 — legend", kind: "text", defaultValue: "Does this meeting have a clear, specific purpose?" },
  q_purpose_hint: { label: "Question 1 — hint (optional)", kind: "text", defaultValue: "" },
  q_interaction_legend: { label: "Question 2 — legend", kind: "text", defaultValue: "What kind of interaction does this need?" },
  q_interaction_hint: { label: "Question 2 — hint (optional)", kind: "text", defaultValue: "" },
  q_decision_legend: {
    label: "Question 3 — legend",
    kind: "text",
    defaultValue: "Does the group need to make a decision or align on something?",
  },
  q_decision_hint: { label: "Question 3 — hint (optional)", kind: "text", defaultValue: "" },
  q_attendee_legend: { label: "Question 4 — legend", kind: "text", defaultValue: "Is everyone on the invite list actually necessary?" },
  q_attendee_hint: {
    label: "Question 4 — hint (optional)",
    kind: "text",
    defaultValue: "Be honest about who's there out of habit rather than genuine need.",
  },
  back_button: { label: "Back button label", kind: "text", defaultValue: "Back" },
  continue_button: { label: "Continue button label", kind: "text", defaultValue: "Continue" },
  final_step_button: { label: "Final step button label", kind: "text", defaultValue: "See my verdict" },
  error_choose_option: { label: "Validation error — no option chosen", kind: "text", defaultValue: "Choose an option to continue." },
  error_missing: {
    label: "Validation error — incomplete answers",
    kind: "text",
    defaultValue: "Something's missing — please check every question was answered.",
  },
  result_next_step_label: { label: "Result — next-step field label", kind: "text", defaultValue: "Next step" },
  result_footer_note: {
    label: "Result — footer note",
    kind: "textarea",
    defaultValue: "Revisit this for recurring meetings whenever their purpose or attendee list changes — a verdict here isn't permanent.",
  },
  result_copy_button: { label: "Result — copy button label", kind: "text", defaultValue: "Copy result" },
  result_copied_label: { label: "Result — copied confirmation label", kind: "text", defaultValue: "Copied" },
  result_restart_button: { label: "Result — restart button label", kind: "text", defaultValue: "Check another" },
};
