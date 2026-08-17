import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the First Customers Planner Tool (spec §14.7.1's
 * "Tool: intro/instructions, field labels, help text, result explanations, disclaimers,
 * CTA labels"). Excludes per-option labels/descriptions and `FIT_COPY`/`CHANNEL_TYPE_LABEL`
 * in tool-result-summary.tsx — those are coupled to `scoring.ts`'s enum values.
 */
export const firstCustomersPlannerCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: { label: "Intro bullet 1", kind: "text", defaultValue: "Takes about 5 minutes — pick one channel to evaluate at a time." },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll get a fit score, a strongest and weakest factor, and one concrete next action.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start scoring a channel" },
  q_channel_type_legend: { label: "Question 1 — legend", kind: "text", defaultValue: "Which channel are you evaluating?" },
  q_audience_presence_legend: {
    label: "Question 2 — legend",
    kind: "text",
    defaultValue: "How much of your target audience is actually active in this channel?",
  },
  q_founder_fit_legend: {
    label: "Question 3 — legend",
    kind: "text",
    defaultValue: "How comfortable and skilled are you at operating this channel?",
  },
  q_effort_to_start_legend: {
    label: "Question 4 — legend",
    kind: "text",
    defaultValue: "How much effort would it take to get a first real result here?",
  },
  q_repeatability_legend: {
    label: "Question 5 — legend",
    kind: "text",
    defaultValue: "Could this channel produce a second and third customer the same way?",
  },
  back_label: { label: "Back button label", kind: "text", defaultValue: "Back" },
  continue_label: { label: "Continue button label", kind: "text", defaultValue: "Continue" },
  see_result_label: { label: "Final step button label", kind: "text", defaultValue: "See my result" },
  choose_option_error: { label: "Unanswered-question error", kind: "text", defaultValue: "Choose an option to continue." },
  result_heading_prefix: { label: "Result heading prefix", kind: "text", defaultValue: "Your result: " },
  score_label: { label: "Score row label", kind: "text", defaultValue: "Fit score" },
  strongest_factor_label: { label: "Strongest factor field label", kind: "text", defaultValue: "Strongest factor" },
  weakest_factor_label: { label: "Weakest factor field label", kind: "text", defaultValue: "Weakest factor" },
  biggest_uncertainty_label: { label: "Biggest uncertainty field label", kind: "text", defaultValue: "Biggest uncertainty" },
  next_step_label: { label: "Next step field label", kind: "text", defaultValue: "Next step" },
  disclaimer: {
    label: "Disclaimer",
    kind: "textarea",
    defaultValue:
      "This score is a structured read on the factors you reported, not a guarantee this channel will work — see it as a prompt for what to check next, not a verdict.",
  },
  copy_result_label: { label: "Copy-result button label", kind: "text", defaultValue: "Copy result" },
  copied_label: { label: "Copied confirmation label", kind: "text", defaultValue: "Copied" },
  restart_label: { label: "Restart button label", kind: "text", defaultValue: "Score another channel" },
};
