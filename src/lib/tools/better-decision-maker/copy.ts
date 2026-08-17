import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the Better Decision Maker Tool (spec §14.7.1). Scoped to
 * intro copy and the four shared question templates (each asked once per option, "Option A:"/
 * "Option B:" prefix stays structural/hardcoded) — deliberately NOT the Likelihood/Impact/
 * Effort/Reversibility option labels/descriptions, since those are tightly coupled to the
 * scoring values in `scoring.ts`.
 */
export const betterDecisionMakerCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 5–10 minutes — you'll answer the same four questions for Option A, then Option B.",
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll get an expected-value score for each option and one clear next step.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start the comparison" },
  q_likelihood_legend: { label: "Likelihood question — legend", kind: "text", defaultValue: "how likely is it to work out?" },
  q_impact_legend: { label: "Impact question — legend", kind: "text", defaultValue: "how big is the impact if it works?" },
  q_effort_legend: { label: "Effort question — legend", kind: "text", defaultValue: "how much effort would it take to attempt?" },
  q_reversibility_legend: { label: "Reversibility question — legend", kind: "text", defaultValue: "is this a one-way or two-way door?" },
  q_reversibility_hint: {
    label: "Reversibility question — hint",
    kind: "text",
    defaultValue: "Could you easily reverse this and try something else if it turns out to be wrong?",
  },
};
