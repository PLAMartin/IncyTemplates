import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the Sticky Pitch Checker Tool (spec §14.7.1). Scoped to
 * intro copy, each factor's legend/hint, navigation/result labels — NOT the per-option
 * "Not yet"/"Already there" descriptions (tied to `options()`'s binary present/absent
 * scoring in `scoring.ts`) and NOT the dynamically-composed result heading (its pluralised
 * "N factor(s) still missing" phrasing is derived from `missingCount`, not a fixed string —
 * same reasoning as mvp-scoper's copy.ts for what stays hardcoded).
 */
export const stickyPitchCheckerCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 3–4 minutes — ten quick questions with a specific pitch or message in mind.",
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue:
      "You'll get a factor-by-factor check against what makes an idea stick and what makes it spread, and a tip for the first one that still needs work.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start the check" },
  q_simple_legend: {
    label: "Simple — legend",
    kind: "text",
    defaultValue: "Simple — is the pitch boiled down to one core, profound idea?",
  },
  q_simple_hint: {
    label: "Simple — hint (optional)",
    kind: "text",
    defaultValue: "If you're making several points at once, none of them will be remembered.",
  },
  q_unexpected_legend: { label: "Unexpected — legend", kind: "text", defaultValue: "Unexpected — does it break the pattern people expect?" },
  q_concrete_legend: {
    label: "Concrete — legend",
    kind: "text",
    defaultValue: "Concrete — is it expressed in terms of human actions and the senses, not abstractions?",
  },
  q_credible_legend: {
    label: "Credible — legend",
    kind: "text",
    defaultValue: "Credible — is there something concrete backing it up, not just your own say-so?",
  },
  q_emotional_legend: {
    label: "Emotional — legend",
    kind: "text",
    defaultValue: "Emotional — does it make people feel something, not just understand it?",
  },
  q_story_legend: {
    label: "Story — legend",
    kind: "text",
    defaultValue: "Story — is it wrapped in something people can mentally picture themselves in?",
  },
  q_social_currency_legend: {
    label: "Social Currency — legend",
    kind: "text",
    defaultValue: "Social Currency — does sharing it make the person sharing look good?",
  },
  q_triggers_legend: {
    label: "Triggers — legend",
    kind: "text",
    defaultValue: "Triggers — is it tied to something already in your audience's everyday environment?",
  },
  q_triggers_hint: {
    label: "Triggers — hint (optional)",
    kind: "text",
    defaultValue: "A trigger that occurs frequently, near the moment the idea is actually useful, works best.",
  },
  q_public_legend: {
    label: "Public — legend",
    kind: "text",
    defaultValue: "Public — is its use visible to other people, not just the person using it?",
  },
  q_practical_value_legend: {
    label: "Practical Value — legend",
    kind: "text",
    defaultValue: "Practical Value — is the value packaged so it's easy to pass on?",
  },
  q_practical_value_hint: {
    label: "Practical Value — hint (optional)",
    kind: "text",
    defaultValue: "A specific, quantified detail travels further than a vague claim.",
  },
  back_label: { label: "Back button label", kind: "text", defaultValue: "Back" },
  continue_label: { label: "Continue button label", kind: "text", defaultValue: "Continue" },
  see_result_label: { label: "Final step button label", kind: "text", defaultValue: "See my result" },
  error_missing_answer: { label: "Missing-answer error", kind: "text", defaultValue: "Choose an option to continue." },
  error_invalid: {
    label: "Validation error",
    kind: "text",
    defaultValue: "Something's missing — please check every question was answered.",
  },
  stick_group_title: { label: "\"Makes it stick\" group title", kind: "text", defaultValue: "Makes it stick" },
  spread_group_title: { label: "\"Makes it spread\" group title", kind: "text", defaultValue: "Makes it spread" },
  tip_label: { label: "Tip label", kind: "text", defaultValue: "Tip" },
  next_step_label: { label: "Next-step label", kind: "text", defaultValue: "Next step" },
  copy_button_label: { label: "Copy button label", kind: "text", defaultValue: "Copy result" },
  copy_button_copied_label: { label: "Copy button label (after copying)", kind: "text", defaultValue: "Copied" },
  restart_button_label: { label: "Restart button label", kind: "text", defaultValue: "Check another pitch" },
};
