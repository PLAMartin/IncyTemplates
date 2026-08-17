import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the User Engagement Designer Tool (spec §14.7.1). Scoped
 * to intro copy, question legends/hint, the four hook-stage display labels (pure display
 * strings keyed by `HookStage` — safe, diagnosis logic keys off the enum, not this label
 * text), and result-screen copy — NOT the per-question option labels/descriptions, which stay
 * hardcoded (tightly coupled to `scoring.ts`'s input matching, same reasoning as mvp-scoper's
 * copy.ts).
 */
export const userEngagementDesignerCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 3 minutes — answer based on your product as it actually works today.",
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll get your weakest engagement-loop link and one concrete next step.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start mapping your loop" },
  q_trigger_legend: {
    label: "Question 1 — legend",
    kind: "text",
    defaultValue: "Do users have a clear, reliable trigger prompting them back to your product?",
  },
  q_action_legend: { label: "Question 2 — legend", kind: "text", defaultValue: "Once triggered, how easy is the very next action?" },
  q_reward_legend: { label: "Question 3 — legend", kind: "text", defaultValue: "Does the action reliably pay off with something rewarding?" },
  q_investment_legend: {
    label: "Question 4 — legend",
    kind: "text",
    defaultValue: "Do users put anything into the product that makes it more valuable to return to?",
  },
  q_investment_hint: {
    label: "Question 4 — hint (optional)",
    kind: "text",
    defaultValue: "Think about data, content, progress or reputation that carries forward between sessions.",
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
  stage_trigger_label: { label: "Stage label — Trigger", kind: "text", defaultValue: "Trigger" },
  stage_action_label: { label: "Stage label — Action", kind: "text", defaultValue: "Action" },
  stage_reward_label: { label: "Stage label — Reward", kind: "text", defaultValue: "Reward" },
  stage_investment_label: { label: "Stage label — Investment", kind: "text", defaultValue: "Investment" },
  result_heading_prefix: { label: "Result heading prefix", kind: "text", defaultValue: "Your weakest link:" },
  also_worth_strengthening_label: { label: "\"Also worth strengthening\" label", kind: "text", defaultValue: "Also worth strengthening" },
  next_step_label: { label: "Next-step label", kind: "text", defaultValue: "Next step" },
  footer_note: {
    label: "Footer note",
    kind: "textarea",
    defaultValue:
      "This points at where to focus first, not a permanent verdict — revisit it as your product changes, and strengthen the loop one link at a time.",
  },
  copy_button_label: { label: "Copy button label", kind: "text", defaultValue: "Copy result" },
  copy_button_copied_label: { label: "Copy button label (after copying)", kind: "text", defaultValue: "Copied" },
  restart_button_label: { label: "Restart button label", kind: "text", defaultValue: "Choose again" },
};
