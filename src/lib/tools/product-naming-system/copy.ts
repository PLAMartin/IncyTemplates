import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the Product Naming System Tool (spec §14.7.1's
 * "Tool: intro/instructions, field labels, help text..."). Scoped to intro copy and each
 * question dimension's legend/hint — one field per dimension (memorability/clarity/
 * distinctiveness/availability), not one per Name A/B slot, since `tool-runner.tsx` reuses
 * the same four questions for both names via `nameSteps()`; editing one field updates both
 * slots. The "Name A:"/"Name B:" prefix stays structural/hardcoded, same reasoning as
 * `mvp-scoper/copy.ts`'s exclusion of per-option labels — it identifies which slot the
 * question belongs to, not editorial wording. Rating option labels/descriptions
 * (`RATING_OPTIONS`/`AVAILABILITY_OPTIONS`) also stay hardcoded, coupled to `scoring.ts`.
 */
export const productNamingSystemCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 5–10 minutes — you'll answer the same four questions for Name A, then Name B.",
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll get a score for each name and a recommendation, taking availability into account.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start comparing two names" },
  q_memorability_legend: { label: "Memorability question", kind: "text", defaultValue: "how memorable is it?" },
  q_clarity_legend: {
    label: "Clarity question",
    kind: "text",
    defaultValue: "how clearly does it hint at what the product does?",
  },
  q_distinctiveness_legend: {
    label: "Distinctiveness question",
    kind: "text",
    defaultValue: "how distinct is it from competitors' names?",
  },
  q_availability_legend: { label: "Availability question", kind: "text", defaultValue: "how available is it?" },
  q_availability_hint: {
    label: "Availability question — hint (optional)",
    kind: "text",
    defaultValue: "Domain, social handles and an informal trademark search — as best you can tell right now.",
  },
};
