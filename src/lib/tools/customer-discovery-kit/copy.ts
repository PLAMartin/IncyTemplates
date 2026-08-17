import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the Customer Discovery Kit Tool (spec §14.7.1's
 * "Tool: intro/instructions, field labels, help text, result explanations, disclaimers,
 * CTA labels"). Excludes per-option labels/descriptions and the signal-strength/bias-risk
 * badge copy (`SIGNAL_STRENGTH_COPY`/`BIAS_RISK_COPY` in tool-result-summary.tsx) — those are
 * coupled to `scoring.ts`'s enum values, not static presentation copy.
 */
export const customerDiscoveryKitCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 5–10 minutes — answer honestly about interviews you've already run.",
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll get an evidence-strength score, a bias-risk flag, and one concrete next action.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start the analysis" },
  q_interview_count_legend: { label: "Question 1 — legend", kind: "text", defaultValue: "How many people have you talked to about this?" },
  q_question_style_legend: { label: "Question 2 — legend", kind: "text", defaultValue: "Honestly, how open were your questions?" },
  q_question_style_hint: {
    label: "Question 2 — hint",
    kind: "text",
    defaultValue:
      'Leading questions — describing your idea first, or asking "would you use this" — invalidate the rest of the evidence, whatever else you heard.',
  },
  q_evidence_type_legend: { label: "Question 3 — legend", kind: "text", defaultValue: "What kind of evidence did you actually hear?" },
  q_commitment_signal_legend: {
    label: "Question 4 — legend",
    kind: "text",
    defaultValue: "Has anyone shown a costly commitment to solving this?",
  },
  q_commitment_signal_hint: {
    label: "Question 4 — hint",
    kind: "text",
    defaultValue: "Money spent, time invested, or a workaround they've actually built — not just interest.",
  },
  q_pattern_consistency_legend: {
    label: "Question 5 — legend",
    kind: "text",
    defaultValue: "How consistent is what you're hearing across interviews?",
  },
  back_label: { label: "Back button label", kind: "text", defaultValue: "Back" },
  continue_label: { label: "Continue button label", kind: "text", defaultValue: "Continue" },
  see_result_label: { label: "Final step button label", kind: "text", defaultValue: "See my result" },
  choose_option_error: { label: "Unanswered-question error", kind: "text", defaultValue: "Choose an option to continue." },
  result_heading: { label: "Result heading", kind: "text", defaultValue: "Your result" },
  score_label: { label: "Score row label", kind: "text", defaultValue: "Evidence strength score" },
  high_bias_warning: {
    label: "High-bias-risk warning",
    kind: "textarea",
    defaultValue: "This score is capped — mostly leading questions mean the pattern above can't be trusted yet, whatever the other answers said.",
  },
  strongest_area_label: { label: "Strongest area field label", kind: "text", defaultValue: "Strongest area" },
  weakest_area_label: { label: "Weakest area field label", kind: "text", defaultValue: "Weakest area" },
  biggest_uncertainty_label: { label: "Biggest uncertainty field label", kind: "text", defaultValue: "Biggest uncertainty" },
  next_evidence_action_label: { label: "Next evidence action field label", kind: "text", defaultValue: "Next evidence action" },
  disclaimer: {
    label: "Disclaimer",
    kind: "textarea",
    defaultValue:
      "This score is a structured read on the interviews you reported, not a guarantee anyone will buy anything — see it as a prompt for what to check next, not a verdict.",
  },
  copy_result_label: { label: "Copy-result button label", kind: "text", defaultValue: "Copy result" },
  copied_label: { label: "Copied confirmation label", kind: "text", defaultValue: "Copied" },
  restart_label: { label: "Restart button label", kind: "text", defaultValue: "Start again" },
};
