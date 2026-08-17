import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the Product Idea Assessor Tool (spec v8 §10.11.5).
 * Scoped to intro copy, question legends/hints, button/nav labels and validation errors —
 * NOT each question's option label/description (coupled to the branching values in
 * scoring.ts, same reasoning as mvp-scoper/copy.ts's exclusions), and NOT the result screen
 * (rendered by the shared `src/components/tools/tool-result-summary.tsx`, used by several
 * Tools — out of scope for a single Tool's copySchema; that component has no per-tool
 * hardcoded copy of its own to extract).
 */
export const productIdeaAssessorCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: { label: "Intro bullet 1", kind: "text", defaultValue: "Takes about 5–10 minutes — five questions, answered honestly." },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll get a scored readiness verdict and one concrete next action.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start the assessment" },
  q_classification_legend: { label: "Question 1 — legend", kind: "text", defaultValue: "How would you classify this idea?" },
  q_classification_hint: {
    label: "Question 1 — hint (optional)",
    kind: "text",
    defaultValue: "See the Product Idea Assessor guide if you're not sure which category fits.",
  },
  q_problem_evidence_legend: {
    label: "Question 2 — legend",
    kind: "text",
    defaultValue: "How much evidence do you have that the problem itself is real?",
  },
  q_problem_evidence_hint: { label: "Question 2 — hint (optional)", kind: "text", defaultValue: "" },
  q_behaviour_evidence_legend: {
    label: "Question 3 — legend",
    kind: "text",
    defaultValue: "Is anyone already trying to solve this problem for themselves?",
  },
  q_behaviour_evidence_hint: { label: "Question 3 — hint (optional)", kind: "text", defaultValue: "" },
  q_differentiation_clarity_legend: {
    label: "Question 4 — legend",
    kind: "text",
    defaultValue: "How clear is the specific improvement your idea makes?",
  },
  q_differentiation_clarity_hint: {
    label: "Question 4 — hint (optional)",
    kind: "text",
    defaultValue: "Most relevant for Improve ideas, but worth answering honestly either way.",
  },
  q_target_specificity_legend: { label: "Question 5 — legend", kind: "text", defaultValue: "How specific is your target user?" },
  q_target_specificity_hint: { label: "Question 5 — hint (optional)", kind: "text", defaultValue: "" },
  back_button: { label: "Back button label", kind: "text", defaultValue: "Back" },
  continue_button: { label: "Continue button label", kind: "text", defaultValue: "Continue" },
  final_step_button: { label: "Final step button label", kind: "text", defaultValue: "See my result" },
  error_choose_option: { label: "Validation error — no option chosen", kind: "text", defaultValue: "Choose an option to continue." },
  error_missing: {
    label: "Validation error — incomplete answers",
    kind: "text",
    defaultValue: "Something's missing — please check every question was answered.",
  },
};
