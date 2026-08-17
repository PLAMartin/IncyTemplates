import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the Writing Editor Tool (spec §14.7.1). Scoped to intro
 * copy, question legends/hint and result-screen labels/buttons — NOT the per-option
 * labels/descriptions (tied to `scoring.ts`'s binary present/absent matching) and NOT the
 * dynamically-composed result heading or the per-rule `state.label` strings (those come from
 * the Tool's result data, not local component copy) — same reasoning as mvp-scoper's and
 * sticky-pitch-checker's copy.ts for what stays hardcoded.
 */
export const writingEditorCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 2 minutes — answer with a specific piece of writing in mind, re-read fresh if you can.",
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
      "You'll get a rule-by-rule review against George Orwell's five writing rules, and a fix tip for the first one that still needs work.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start the review" },
  q_cliched_legend: {
    label: "Question 1 — legend",
    kind: "text",
    defaultValue: "Does your draft lean on any metaphors, similes or phrases you've seen in print before?",
  },
  q_inflated_legend: { label: "Question 2 — legend", kind: "text", defaultValue: "Does it use long or formal words where a short one would do?" },
  q_unnecessary_legend: { label: "Question 3 — legend", kind: "text", defaultValue: "Could you cut words out without losing meaning?" },
  q_passive_legend: { label: "Question 4 — legend", kind: "text", defaultValue: "Does it use the passive voice where the active would work?" },
  q_passive_hint: {
    label: "Question 4 — hint (optional)",
    kind: "text",
    defaultValue: '"The meeting was led by Jane" is passive. "Jane led the meeting" is active.',
  },
  q_jargon_legend: {
    label: "Question 5 — legend",
    kind: "text",
    defaultValue: "Does it use jargon, technical terms or foreign phrases an everyday reader wouldn't know?",
  },
  back_label: { label: "Back button label", kind: "text", defaultValue: "Back" },
  continue_label: { label: "Continue button label", kind: "text", defaultValue: "Continue" },
  see_review_label: { label: "Final step button label", kind: "text", defaultValue: "See my review" },
  error_missing_answer: { label: "Missing-answer error", kind: "text", defaultValue: "Choose an option to continue." },
  error_invalid: {
    label: "Validation error",
    kind: "text",
    defaultValue: "Something's missing — please check every question was answered.",
  },
  fix_tip_label: { label: "Fix-tip label", kind: "text", defaultValue: "Fix tip" },
  next_step_label: { label: "Next-step label", kind: "text", defaultValue: "Next step" },
  copy_button_label: { label: "Copy button label", kind: "text", defaultValue: "Copy result" },
  copy_button_copied_label: { label: "Copy button label (after copying)", kind: "text", defaultValue: "Copied" },
  restart_button_label: { label: "Restart button label", kind: "text", defaultValue: "Review another draft" },
};
