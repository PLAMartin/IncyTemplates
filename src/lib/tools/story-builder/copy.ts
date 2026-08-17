import type { ToolCopySchema } from "../types";

/**
 * Declared admin-editable fields for the Story Builder Tool (spec §14.7.1). Every step here
 * is free text (no scored/branching options to exclude, unlike most other Tools), so the full
 * legend/placeholder/hint set is editable, plus the result-screen element labels (pure
 * display strings keyed by `PatedElement` — safe, the structure check keys off the element
 * name, not this label text).
 */
export const storyBuilderCopySchema: ToolCopySchema = {
  intro_heading: { label: "Intro heading", kind: "text", defaultValue: "Before you start" },
  intro_bullet_1: {
    label: "Intro bullet 1",
    kind: "text",
    defaultValue: "Takes about 3 minutes — paste whatever you already have for each part, and skip the rest.",
  },
  intro_bullet_2: {
    label: "Intro bullet 2",
    kind: "text",
    defaultValue: "Nothing is saved or sent anywhere — this runs entirely in your browser.",
  },
  intro_bullet_3: {
    label: "Intro bullet 3",
    kind: "text",
    defaultValue: "You'll see which parts of your story spine are there, and a tip for what to add next.",
  },
  intro_cta: { label: "Start button label", kind: "text", defaultValue: "Start checking your story" },
  q_place_legend: { label: "Place — legend", kind: "text", defaultValue: "Place — where does the scene happen?" },
  q_place_placeholder: { label: "Place — placeholder", kind: "text", defaultValue: "e.g. The lift hums as it carries me up to the 7th floor." },
  q_place_hint: {
    label: "Place — hint",
    kind: "text",
    defaultValue: "One clear noun does more than a list of decor. Leave blank if you haven't written this part yet.",
  },
  q_action_legend: { label: "Action — legend", kind: "text", defaultValue: "Action — what are you doing right now, in the moment?" },
  q_action_placeholder: { label: "Action — placeholder", kind: "text", defaultValue: "e.g. I shuffle my notes, pretending to read." },
  q_action_hint: {
    label: "Action — hint",
    kind: "text",
    defaultValue: "Use verbs — the story should already be happening. Leave blank if you haven't written this part yet.",
  },
  q_thought_legend: { label: "Thought — legend", kind: "text", defaultValue: "Thought — what's going through your head?" },
  q_thought_placeholder: {
    label: "Thought — placeholder",
    kind: "text",
    defaultValue: "e.g. If asked about market growth rates then I'm in trouble.",
  },
  q_thought_hint: {
    label: "Thought — hint",
    kind: "text",
    defaultValue: "Raw and slightly messy reads as real. Leave blank if you haven't written this part yet.",
  },
  q_emotion_legend: { label: "Emotion — legend", kind: "text", defaultValue: "Emotion — shown, not named" },
  q_emotion_placeholder: {
    label: "Emotion — placeholder",
    kind: "text",
    defaultValue: "e.g. I can feel my hands shaking as my pulse quickens.",
  },
  q_emotion_hint: {
    label: "Emotion — hint",
    kind: "text",
    defaultValue: "Show the body doing something rather than naming the feeling. Leave blank if you haven't written this part yet.",
  },
  q_dialogue_legend: { label: "Dialogue — legend", kind: "text", defaultValue: "Dialogue — what does someone in the scene say?" },
  q_dialogue_placeholder: {
    label: "Dialogue — placeholder",
    kind: "text",
    defaultValue: 'e.g. "Hello, Phil. You\'re early," my manager says.',
  },
  q_dialogue_hint: {
    label: "Dialogue — hint",
    kind: "text",
    defaultValue: "One specific line beats a sentence describing how someone felt. Leave blank if you haven't written this part yet.",
  },
  back_label: { label: "Back button label", kind: "text", defaultValue: "Back" },
  continue_label: { label: "Continue button label", kind: "text", defaultValue: "Continue" },
  final_step_label: { label: "Final step button label", kind: "text", defaultValue: "Check my structure" },
  error_no_elements: {
    label: "No-elements error",
    kind: "text",
    defaultValue: "Enter at least one element above to check your story spine — use Back to add one.",
  },
  element_place_label: { label: "Result element label — Place", kind: "text", defaultValue: "Place" },
  element_action_label: { label: "Result element label — Action", kind: "text", defaultValue: "Action" },
  element_thought_label: { label: "Result element label — Thought", kind: "text", defaultValue: "Thought" },
  element_emotion_label: { label: "Result element label — Emotion", kind: "text", defaultValue: "Emotion (shown)" },
  element_dialogue_label: { label: "Result element label — Dialogue", kind: "text", defaultValue: "Dialogue" },
  not_written_yet_label: { label: "\"Not written yet\" note", kind: "text", defaultValue: "Not written yet." },
  story_spine_heading: { label: "Story spine preview heading", kind: "text", defaultValue: "Your story spine so far" },
  tip_label: { label: "Tip label", kind: "text", defaultValue: "Tip" },
  next_step_label: { label: "Next-step label", kind: "text", defaultValue: "Next step" },
  copy_button_label: { label: "Copy button label", kind: "text", defaultValue: "Copy result" },
  copy_button_copied_label: { label: "Copy button label (after copying)", kind: "text", defaultValue: "Copied" },
  restart_button_label: { label: "Restart button label", kind: "text", defaultValue: "Start again" },
};
