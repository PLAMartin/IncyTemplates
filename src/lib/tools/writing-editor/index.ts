import type { ToolDefinition } from "../types";
import { writingEditorInputSchema, writingEditorResultSchema } from "./schema";
import type { WritingEditorInput, WritingEditorResult } from "./schema";
import { reviewWritingStructure } from "./scoring";

export const WRITING_EDITOR_TOOL_KEY = "writing-editor";

export const writingEditorTool: ToolDefinition<WritingEditorInput, WritingEditorResult> = {
  key: WRITING_EDITOR_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: writingEditorInputSchema,
  resultSchema: writingEditorResultSchema,
  run: reviewWritingStructure,
};

export * from "./schema";
export { reviewWritingStructure } from "./scoring";
