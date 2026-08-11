import type { ToolDefinition } from "../types";
import { storyBuilderInputSchema, storyBuilderResultSchema } from "./schema";
import type { StoryBuilderInput, StoryBuilderResult } from "./schema";
import { checkStoryStructure } from "./scoring";

export const STORY_BUILDER_TOOL_KEY = "story-builder";

export const storyBuilderTool: ToolDefinition<StoryBuilderInput, StoryBuilderResult> = {
  key: STORY_BUILDER_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: storyBuilderInputSchema,
  resultSchema: storyBuilderResultSchema,
  run: checkStoryStructure,
};

export * from "./schema";
export { checkStoryStructure } from "./scoring";
