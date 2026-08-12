import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the MVP Scoper Tool (spec §14.7.1's
 * "Tool: intro/instructions, field labels, help text..."). Scoped to intro
 * copy, the CTA and each question's legend/hint — deliberately NOT the
 * per-option labels/descriptions, since those are tightly coupled to the
 * scoring values in `scoring.ts`/`schema.ts` and editing wording there
 * without touching the underlying value mapping risks confusing wording
 * that no longer matches what the option actually scores. A safe
 * second-pass extension, not this one.
 */
export const mvpScoperCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 5 minutes — answer for one candidate feature at a time.",
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll get a Keep, Defer or Remove verdict and one concrete next step.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start scoring a feature" },
  q_necessity_legend: {
    label: "Question 1 — legend",
    kind: "text",
    defaultValue: "How necessary is this feature to your product's core value?",
  },
  q_necessity_hint: { label: "Question 1 — hint (optional)", kind: "text", defaultValue: "" },
  q_risky_legend: {
    label: "Question 2 — legend",
    kind: "text",
    defaultValue: "How relevant is this to your riskiest open question?",
  },
  q_risky_hint: {
    label: "Question 2 — hint (optional)",
    kind: "text",
    defaultValue: "The one thing you're least sure of — will people actually use it, will they pay, will they come back.",
  },
  q_effort_legend: { label: "Question 3 — legend", kind: "text", defaultValue: "How much effort would it take to build?" },
  q_effort_hint: { label: "Question 3 — hint (optional)", kind: "text", defaultValue: "" },
  q_fakeability_legend: {
    label: "Question 4 — legend",
    kind: "text",
    defaultValue: "Could you deliver this manually instead of building it, at least for now?",
  },
  q_fakeability_hint: {
    label: "Question 4 — hint (optional)",
    kind: "text",
    defaultValue: "A concierge process, a spreadsheet, a one-off email — anything that avoids writing code.",
  },
};
