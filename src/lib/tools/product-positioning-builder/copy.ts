import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the Product Positioning Builder Tool (spec §14.7.1's
 * "Tool: intro/instructions, field labels, help text..."). Scoped to intro copy, each
 * free-text step's legend/placeholder/hint, and the cut-through-approach select's legend —
 * NOT that select's option labels/descriptions, which feed directly into the assembled
 * positioning statement in `scoring.ts` (same exclusion reasoning as `mvp-scoper/copy.ts`).
 */
export const productPositioningBuilderCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: 'Takes about 3 minutes — answer with a specific customer and outcome in mind, not "everyone."',
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll get a positioning statement and a recommended way to cut through the noise.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start building your positioning" },
  q_ideal_customer_legend: { label: "Question 1 — legend", kind: "text", defaultValue: "Who's your ideal customer?" },
  q_ideal_customer_placeholder: {
    label: "Question 1 — placeholder",
    kind: "text",
    defaultValue: "e.g. solo founders validating a new product idea",
  },
  q_ideal_customer_hint: {
    label: "Question 1 — hint",
    kind: "text",
    defaultValue: 'Be specific — a real kind of person, not "everyone."',
  },
  q_desired_action_legend: {
    label: "Question 2 — legend",
    kind: "text",
    defaultValue: "What action do you want them to take with your product?",
  },
  q_desired_action_placeholder: {
    label: "Question 2 — placeholder",
    kind: "text",
    defaultValue: "e.g. score their idea in under five minutes",
  },
  q_desired_action_hint: {
    label: "Question 2 — hint",
    kind: "text",
    defaultValue: "The specific thing they do, not the feature that lets them do it.",
  },
  q_desired_outcome_legend: {
    label: "Question 3 — legend",
    kind: "text",
    defaultValue: "What outcome do they get from that action?",
  },
  q_desired_outcome_placeholder: {
    label: "Question 3 — placeholder",
    kind: "text",
    defaultValue: "e.g. know exactly how much evidence they still need before committing",
  },
  q_desired_outcome_hint: { label: "Question 3 — hint", kind: "text", defaultValue: "The result they walk away with." },
  q_admired_identity_legend: {
    label: "Question 4 — legend",
    kind: "text",
    defaultValue: "What do your ideal customers admire or aspire to be?",
  },
  q_admired_identity_placeholder: {
    label: "Question 4 — placeholder",
    kind: "text",
    defaultValue: "e.g. founders who ship fast and validate rigorously, not ones who guess",
  },
  q_admired_identity_hint: {
    label: "Question 4 — hint",
    kind: "text",
    defaultValue: "Optional — skip if nothing comes to mind.",
  },
  q_cut_through_legend: {
    label: "Question 5 — legend",
    kind: "text",
    defaultValue: "What's the most realistic way you'll cut through the noise?",
  },
};
