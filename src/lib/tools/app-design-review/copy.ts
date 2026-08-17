import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the App Design Review Tool (spec §14.7.1). Scoped to
 * intro copy and each question's legend/hint, same as `mvp-scoper/copy.ts` — deliberately NOT
 * the "Not yet"/"Already there" option descriptions, since those are generated per-step by
 * `options()` and tightly coupled to the fixed `not_yet`/`already_there` scoring values.
 */
export const appDesignReviewCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 3–4 minutes — ten quick questions with a specific product or screen in mind.",
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll get a rule-by-rule review against Dieter Rams' ten principles of good design, and a tip for the first one that still needs work.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start the self-assessment" },
  q_innovative_legend: {
    label: "Question 1 — legend",
    kind: "text",
    defaultValue: "Innovative — does it take a genuinely original approach, grounded in what's actually possible today?",
  },
  q_innovative_hint: { label: "Question 1 — hint (optional)", kind: "text", defaultValue: "" },
  q_useful_legend: { label: "Question 2 — legend", kind: "text", defaultValue: "Useful — does every part of it help someone actually use the product?" },
  q_useful_hint: { label: "Question 2 — hint (optional)", kind: "text", defaultValue: "" },
  q_aesthetic_legend: { label: "Question 3 — legend", kind: "text", defaultValue: "Aesthetic — is it well executed, not just decorated?" },
  q_aesthetic_hint: { label: "Question 3 — hint (optional)", kind: "text", defaultValue: "" },
  q_understandable_legend: { label: "Question 4 — legend", kind: "text", defaultValue: "Understandable — is it close to self-explanatory?" },
  q_understandable_hint: {
    label: "Question 4 — hint (optional)",
    kind: "text",
    defaultValue: "If you need a tooltip to explain what something does, it isn't quite there yet.",
  },
  q_unobtrusive_legend: {
    label: "Question 5 — legend",
    kind: "text",
    defaultValue: "Unobtrusive — does the design stay out of the way, rather than drawing attention to itself?",
  },
  q_unobtrusive_hint: { label: "Question 5 — hint (optional)", kind: "text", defaultValue: "" },
  q_honest_legend: {
    label: "Question 6 — legend",
    kind: "text",
    defaultValue: "Honest — does it avoid overstating what the product can actually do?",
  },
  q_honest_hint: { label: "Question 6 — hint (optional)", kind: "text", defaultValue: "" },
  q_long_lasting_legend: { label: "Question 7 — legend", kind: "text", defaultValue: "Long-lasting — would it still look right in five years?" },
  q_long_lasting_hint: { label: "Question 7 — hint (optional)", kind: "text", defaultValue: "" },
  q_thorough_legend: { label: "Question 8 — legend", kind: "text", defaultValue: "Thorough — has the small stuff been cared for?" },
  q_thorough_hint: {
    label: "Question 8 — hint (optional)",
    kind: "text",
    defaultValue: "Spacing, edge cases, error states — nothing left arbitrary or unfinished.",
  },
  q_environmentally_friendly_legend: {
    label: "Question 9 — legend",
    kind: "text",
    defaultValue: "Environmentally friendly — is it lean and efficient?",
  },
  q_environmentally_friendly_hint: { label: "Question 9 — hint (optional)", kind: "text", defaultValue: "" },
  q_as_little_as_possible_legend: {
    label: "Question 10 — legend",
    kind: "text",
    defaultValue: "As little design as possible — is it cut down to the essentials?",
  },
  q_as_little_as_possible_hint: { label: "Question 10 — hint (optional)", kind: "text", defaultValue: "" },
};
