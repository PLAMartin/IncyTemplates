import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the Startup Launch Planner Tool (spec §14.7.1). Scoped
 * to intro/question copy, the four output-plan option labels (pure display strings keyed by
 * `LaunchOption` — safe, since scoring/matching keys off the enum values, not this label
 * text) and result-screen copy — NOT the per-question option labels/descriptions, which stay
 * hardcoded since they're tightly coupled to `scoring.ts`'s input matching (same reasoning as
 * mvp-scoper's copy.ts).
 */
export const startupLaunchPlannerCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 3 minutes — answer based on where your launch actually stands today.",
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll get a full launch plan, in order, not just a single recommendation.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start planning my launch" },
  q_has_something_legend: { label: "Question 1 — legend", kind: "text", defaultValue: "Do you have something to show yet?" },
  q_feedback_stakes_legend: {
    label: "Question 2 — legend",
    kind: "text",
    defaultValue: "Do you want low-stakes honest feedback first, or are you ready for public reaction?",
  },
  q_existing_audience_legend: {
    label: "Question 3 — legend",
    kind: "text",
    defaultValue: "Do you already have some following or community ties?",
  },
  q_newsworthiness_legend: {
    label: "Question 4 — legend",
    kind: "text",
    defaultValue: "Is there something genuinely novel or a good story here?",
  },
  q_newsworthiness_hint: {
    label: "Question 4 — hint (optional)",
    kind: "text",
    defaultValue: "Be honest — most launches aren't press-worthy yet, and that's fine.",
  },
  back_label: { label: "Back button label", kind: "text", defaultValue: "Back" },
  continue_label: { label: "Continue button label", kind: "text", defaultValue: "Continue" },
  see_plan_label: { label: "Final step button label", kind: "text", defaultValue: "See my plan" },
  error_missing_answer: { label: "Missing-answer error", kind: "text", defaultValue: "Choose an option to continue." },
  error_invalid: {
    label: "Validation error",
    kind: "text",
    defaultValue: "Something's missing — please check every question was answered.",
  },
  result_heading: { label: "Result heading", kind: "text", defaultValue: "Your launch plan" },
  start_here_badge: { label: "\"Start here\" badge", kind: "text", defaultValue: "Start here" },
  next_step_label: { label: "Next-step label", kind: "text", defaultValue: "Next step" },
  footer_note: {
    label: "Footer note",
    kind: "textarea",
    defaultValue: "Launching isn't one-and-done — most successful products launch early, often, and more than once.",
  },
  copy_button_label: { label: "Copy button label", kind: "text", defaultValue: "Copy result" },
  copy_button_copied_label: { label: "Copy button label (after copying)", kind: "text", defaultValue: "Copied" },
  restart_button_label: { label: "Restart button label", kind: "text", defaultValue: "Choose again" },
  option_soft_launch_page_label: { label: "Plan option — soft launch page", kind: "text", defaultValue: "Soft launch page" },
  option_friends_and_family_label: { label: "Plan option — friends and family", kind: "text", defaultValue: "Friends and family" },
  option_community_or_social_label: { label: "Plan option — community or social", kind: "text", defaultValue: "Community or social" },
  option_press_label: { label: "Plan option — press", kind: "text", defaultValue: "Press" },
};
