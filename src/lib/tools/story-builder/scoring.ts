import type { PatedElement, PatedElementState, StoryBuilderInput, StoryBuilderResult } from "./schema";

/**
 * Deterministic structure checking for the Story Structure Checker (spec v4 §37). No AI is
 * involved, consistent with every prior Tool (docs/decisions/0016) — the visitor's own text is
 * only ever echoed back and checked for presence, never interpreted or rewritten by any model.
 *
 * Checks all five story-spine elements against the visitor's own text, in the source post's
 * own listed order, and surfaces a craft tip for the first missing one — filling gaps in
 * order, the same way the framework itself is taught step by step.
 */

const ELEMENT_ORDER: PatedElement[] = ["place", "action", "thought", "emotion", "dialogue"];

const ELEMENT_LABEL: Record<PatedElement, string> = {
  place: "Place",
  action: "Action",
  thought: "Thought",
  emotion: "Emotion (shown)",
  dialogue: "Dialogue",
};

const ELEMENT_TIP: Record<PatedElement, string> = {
  place: "Start with one clear noun — a place your reader can stand in, like \"airport\" or \"boardroom.\" Skip the decor list; naming the place does the work.",
  action: "Use verbs to show what you're doing right now in the scene. The story should already be happening, not about to start.",
  thought: "Let the reader hear your head, not your résumé — write the raw, slightly messy thought you actually had, not a tidy summary of the feeling.",
  emotion: "Don't name the emotion — show the body doing something: a shaking hand, a too-quick laugh. Let the reader supply the label.",
  dialogue: "Let other people in the scene talk. One specific line of dialogue does more work than a sentence describing how someone felt.",
};

const ALL_COMPLETE_TIP =
  "Every element is there. Read the spine back and cut anything that doesn't earn its place — add detail where it helps, cut where it doesn't.";

const NEXT_STEP = "Once your story spine holds together, First Customers Planner is where you put it to work finding real customers.";

function assembleSpine(elements: PatedElementState[]): string {
  return elements
    .filter((e) => e.present)
    .map((e) => `${ELEMENT_LABEL[e.element]}: ${e.text}`)
    .join("\n");
}

export function checkStoryStructure(input: StoryBuilderInput): StoryBuilderResult {
  const elements: PatedElementState[] = ELEMENT_ORDER.map((element) => {
    const text = input[element].trim();
    return { element, text, present: text.length > 0 };
  });

  const firstMissing = elements.find((e) => !e.present);

  return {
    elements,
    storySpine: assembleSpine(elements),
    nextTip: firstMissing ? ELEMENT_TIP[firstMissing.element] : ALL_COMPLETE_TIP,
    nextStep: NEXT_STEP,
  };
}
