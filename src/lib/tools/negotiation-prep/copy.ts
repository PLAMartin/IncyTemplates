import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the Negotiation Prep Tool (spec v8 §10.11.5). Scoped to
 * intro copy, each step's legend/placeholder/hint (all three are the entirety of that field's
 * content here — this Tool's steps are free-text, not multiple-choice, so there's no
 * option-label/description to exclude the way mvp-scoper/meeting-reset do), button/nav
 * labels, the validation error, and the result screen's static labels. `TACTIC_LABEL` in
 * tool-result-summary.tsx and the dynamic result heading stay hardcoded — the former is keyed
 * off the fixed `NegotiationTactic` enum (same role as an option label), the latter is a
 * computed sentence built from a missing-count, not a fixed string to swap in.
 */
export const negotiationPrepCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 3 minutes — think of a specific upcoming negotiation and fill in what you've already prepared.",
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll see which of the three tactics are ready, and a tip for what to prepare next.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start checking your prep" },
  q_batna_legend: {
    label: "Question 1 — legend",
    kind: "text",
    defaultValue: "Fallback — what will you do if this negotiation doesn't produce a deal?",
  },
  q_batna_placeholder: {
    label: "Question 1 — placeholder",
    kind: "text",
    defaultValue: "e.g. Keep the current supplier for another year and revisit pricing then.",
  },
  q_batna_hint: {
    label: "Question 1 — hint",
    kind: "text",
    defaultValue: "Your BATNA (Best Alternative to a Negotiated Agreement). Leave blank if you haven't decided this yet.",
  },
  q_anchor_legend: {
    label: "Question 2 — legend",
    kind: "text",
    defaultValue: "Anchor — what's the first number or position you'll put on the table?",
  },
  q_anchor_placeholder: { label: "Question 2 — placeholder", kind: "text", defaultValue: "e.g. Open at 25% below asking price." },
  q_anchor_hint: {
    label: "Question 2 — hint",
    kind: "text",
    defaultValue: "The first figure mentioned sets the tone for everything that follows. Leave blank if you haven't decided this yet.",
  },
  q_mesos_legend: {
    label: "Question 3 — legend",
    kind: "text",
    defaultValue: "Multiple offers — what two or three alternative offers could you put forward?",
  },
  q_mesos_placeholder: {
    label: "Question 3 — placeholder",
    kind: "text",
    defaultValue: "e.g. Standard rate for 12 months, or a lower rate for 24 months, or a higher rate with an option to buy after 12.",
  },
  q_mesos_hint: {
    label: "Question 3 — hint",
    kind: "text",
    defaultValue: "Each equally acceptable to you, but trading off differently. Leave blank if you haven't prepared these yet.",
  },
  back_button: { label: "Back button label", kind: "text", defaultValue: "Back" },
  continue_button: { label: "Continue button label", kind: "text", defaultValue: "Continue" },
  final_step_button: { label: "Final step button label", kind: "text", defaultValue: "Check my prep" },
  error_incomplete: {
    label: "Validation error — nothing entered",
    kind: "text",
    defaultValue: "Enter at least one element above to check your negotiation prep — use Back to add one.",
  },
  result_not_prepared: { label: "Result — 'not prepared yet' note", kind: "text", defaultValue: "Not prepared yet." },
  result_prep_summary_heading: { label: "Result — prep summary heading", kind: "text", defaultValue: "Your prep so far" },
  result_tip_label: { label: "Result — tip field label", kind: "text", defaultValue: "Tip" },
  result_next_step_label: { label: "Result — next-step field label", kind: "text", defaultValue: "Next step" },
  result_copy_button: { label: "Result — copy button label", kind: "text", defaultValue: "Copy result" },
  result_copied_label: { label: "Result — copied confirmation label", kind: "text", defaultValue: "Copied" },
  result_restart_button: { label: "Result — restart button label", kind: "text", defaultValue: "Start again" },
};
