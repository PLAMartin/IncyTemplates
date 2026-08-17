import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the Customer Demand Test Tool (spec §14.7.1's
 * "Tool: intro/instructions, field labels, help text, result explanations, disclaimers,
 * CTA labels"). Excludes per-option labels/descriptions (coupled to `scoring.ts`'s value
 * mapping) and the result's dynamic content — recommended/runner-up test labels, rationale,
 * deciding factor and next step all come from `scoring.ts`, not static copy.
 */
export const customerDemandTestCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 3 minutes — answer based on your idea as it actually stands today.",
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll get a recommended demand test, a runner-up, and one concrete next step.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start choosing a demand test" },
  q_explainability_legend: {
    label: "Question 1 — legend",
    kind: "text",
    defaultValue: "Is your idea easy to explain in words, or does it need a demo to click?",
  },
  q_manual_fulfilment_legend: {
    label: "Question 2 — legend",
    kind: "text",
    defaultValue: "Could you fulfil this manually, behind the scenes, for a handful of real users?",
  },
  q_existing_platform_legend: {
    label: "Question 3 — legend",
    kind: "text",
    defaultValue: "Is there an existing platform your target customers already use?",
  },
  q_reach_needed_legend: {
    label: "Question 4 — legend",
    kind: "text",
    defaultValue: "How many people do you need to reach for a meaningful signal?",
  },
  q_reach_needed_hint: {
    label: "Question 4 — hint",
    kind: "text",
    defaultValue: "Think about what would actually convince you, not what would be nice to have.",
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
    defaultValue: "Don't ask people if they'd buy — see if they do. Measure real behaviour (clicks, signups, engagement), not opinions.",
  },
  copy_result_label: { label: "Copy-result button label", kind: "text", defaultValue: "Copy result" },
  copied_label: { label: "Copied confirmation label", kind: "text", defaultValue: "Copied" },
  restart_label: { label: "Restart button label", kind: "text", defaultValue: "Choose again" },
};
