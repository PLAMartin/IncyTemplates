import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the Business Model Chooser Tool (spec §14.7.1). Scoped
 * to intro copy and each question's legend/hint, same as `mvp-scoper/copy.ts` — deliberately
 * NOT the per-option labels/descriptions, since those are tightly coupled to the scoring
 * values in `scoring.ts`.
 */
export const businessModelChooserCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 3 minutes — answer based on how your product actually works, not what sounds impressive.",
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll get a recommended business model, a runner-up, and one concrete next step.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start choosing a business model" },
  q_audience_structure_legend: {
    label: "Question 1 — legend",
    kind: "text",
    defaultValue: "Does your product connect two different kinds of users, or serve one kind of user directly?",
  },
  q_audience_structure_hint: { label: "Question 1 — hint (optional)", kind: "text", defaultValue: "" },
  q_payer_legend: { label: "Question 2 — legend", kind: "text", defaultValue: "Who actually pays you money?" },
  q_payer_hint: { label: "Question 2 — hint (optional)", kind: "text", defaultValue: "" },
  q_value_delivery_pattern_legend: {
    label: "Question 3 — legend",
    kind: "text",
    defaultValue: "How does your product deliver value — ongoing access, or discrete completed transactions?",
  },
  q_value_delivery_pattern_hint: { label: "Question 3 — hint (optional)", kind: "text", defaultValue: "" },
  q_growth_lever_legend: { label: "Question 4 — legend", kind: "text", defaultValue: "What's the most realistic way you'll actually grow?" },
  q_growth_lever_hint: {
    label: "Question 4 — hint (optional)",
    kind: "text",
    defaultValue: "Think about how your first hundred users will actually arrive, not how you'd like them to.",
  },
};
