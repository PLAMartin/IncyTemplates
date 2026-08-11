import { z } from "zod";

/**
 * Story Builder tool input/result schemas (spec v4 §37's "structure checker"). A sixth
 * distinct Tool mechanic: the source material's five-step story spine (Place, Action,
 * Thought, Emotion, Dialogue) isn't a set of alternatives to score, a weakest link to
 * diagnose, or a statement to assemble — it's a fixed checklist every scene needs all five
 * parts of. This Tool checks which of the five the visitor has already written and which are
 * still missing, rather than ranking or recommending anything. See docs/decisions/0037.
 */
export const storyBuilderInputSchema = z
  .object({
    place: z.string().trim().default(""),
    action: z.string().trim().default(""),
    thought: z.string().trim().default(""),
    emotion: z.string().trim().default(""),
    dialogue: z.string().trim().default(""),
  })
  .refine((input) => Boolean(input.place || input.action || input.thought || input.emotion || input.dialogue), {
    message: "Enter at least one element to check your story spine.",
    path: ["place"],
  });
export type StoryBuilderInput = z.infer<typeof storyBuilderInputSchema>;

export const patedElementSchema = z.enum(["place", "action", "thought", "emotion", "dialogue"]);
export type PatedElement = z.infer<typeof patedElementSchema>;

export const patedElementStateSchema = z.object({
  element: patedElementSchema,
  text: z.string(),
  present: z.boolean(),
});
export type PatedElementState = z.infer<typeof patedElementStateSchema>;

export const storyBuilderResultSchema = z.object({
  elements: z.array(patedElementStateSchema),
  storySpine: z.string(),
  nextTip: z.string(),
  nextStep: z.string(),
});
export type StoryBuilderResult = z.infer<typeof storyBuilderResultSchema>;
