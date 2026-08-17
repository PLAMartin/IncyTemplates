import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the Rapid Learning Planner Tool (spec §14.7.1's
 * "Tool: intro/instructions, field labels, help text..."). All four steps are free text
 * (no options to exclude, unlike most other Tools) — every legend/placeholder/hint is
 * editable.
 */
export const rapidLearningPlannerCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 3 minutes — think of a specific skill you're learning and fill in what you've already planned.",
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll see which of the four DSSS steps are ready, and a tip for what to plan next.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start checking your plan" },
  q_deconstruction_legend: {
    label: "Question 1 — legend",
    kind: "text",
    defaultValue: "Deconstruction — what are the smaller, independent parts of this skill?",
  },
  q_deconstruction_placeholder: {
    label: "Question 1 — placeholder",
    kind: "text",
    defaultValue: "e.g. Prompting effectively, understanding project structure, debugging, iterating on outputs.",
  },
  q_deconstruction_hint: {
    label: "Question 1 — hint",
    kind: "text",
    defaultValue: "Break the skill down before doing anything else. Leave blank if you haven't done this yet.",
  },
  q_selection_legend: {
    label: "Question 2 — legend",
    kind: "text",
    defaultValue: "Selection — which few parts give you most of the value?",
  },
  q_selection_placeholder: {
    label: "Question 2 — placeholder",
    kind: "text",
    defaultValue: "e.g. Rapid prototyping, debugging, turning ideas into working demos.",
  },
  q_selection_hint: {
    label: "Question 2 — hint",
    kind: "text",
    defaultValue: "The 20% that gets you 80% of the way there. Leave blank if you haven't decided this yet.",
  },
  q_sequencing_legend: {
    label: "Question 3 — legend",
    kind: "text",
    defaultValue: "Sequencing — what order will you learn those parts in?",
  },
  q_sequencing_placeholder: {
    label: "Question 3 — placeholder",
    kind: "text",
    defaultValue: "e.g. Prompting, then structured iteration, then debugging, then small projects.",
  },
  q_sequencing_hint: {
    label: "Question 3 — hint",
    kind: "text",
    defaultValue: "Not just what to learn — when. Leave blank if you haven't planned this yet.",
  },
  q_stakes_legend: {
    label: "Question 4 — legend",
    kind: "text",
    defaultValue: "Stakes — what accountability will keep you going once the novelty wears off?",
  },
  q_stakes_placeholder: {
    label: "Question 4 — placeholder",
    kind: "text",
    defaultValue: "e.g. Post weekly progress updates publicly.",
  },
  q_stakes_hint: {
    label: "Question 4 — hint",
    kind: "text",
    defaultValue: "A commitment, deadline or consequence real enough to matter. Leave blank if you haven't set this yet.",
  },
};
