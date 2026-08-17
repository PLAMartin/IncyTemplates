import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the Product/Market Fit Tracker Tool (spec §14.7.1's
 * "Tool: intro/instructions, field labels, help text..."). Scoped to intro copy and each
 * question's legend/hint, same as `mvp-scoper/copy.ts` — NOT the per-option labels/
 * descriptions (tightly coupled to `scoring.ts`) and NOT the result-summary component, which
 * mvp-scoper's own reference implementation also leaves entirely hardcoded.
 */
export const productMarketFitTrackerCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 5 minutes — answer based on real users, not intentions.",
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll get a fit score, a strongest and weakest signal, and one concrete next step.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start checking fit" },
  q_disappointment_legend: {
    label: "Question 1 — legend",
    kind: "text",
    defaultValue: "How would your users feel if they could no longer use this product?",
  },
  q_disappointment_hint: {
    label: "Question 1 — hint (optional)",
    kind: "text",
    defaultValue: "The Sean Ellis test — the single most reliable proxy for genuine product-market fit.",
  },
  q_retention_legend: {
    label: "Question 2 — legend",
    kind: "text",
    defaultValue: "Do people who try it keep coming back on their own?",
  },
  q_retention_hint: { label: "Question 2 — hint (optional)", kind: "text", defaultValue: "" },
  q_organic_growth_legend: {
    label: "Question 3 — legend",
    kind: "text",
    defaultValue: "Are new users arriving without you paying for them or personally chasing them?",
  },
  q_organic_growth_hint: { label: "Question 3 — hint (optional)", kind: "text", defaultValue: "" },
  q_referral_legend: {
    label: "Question 4 — legend",
    kind: "text",
    defaultValue: "Are people recommending it to others without being asked?",
  },
  q_referral_hint: { label: "Question 4 — hint (optional)", kind: "text", defaultValue: "" },
  q_paying_intent_legend: {
    label: "Question 5 — legend",
    kind: "text",
    defaultValue: "Would people actually pay for this — or are they already paying?",
  },
  q_paying_intent_hint: { label: "Question 5 — hint (optional)", kind: "text", defaultValue: "" },
};
