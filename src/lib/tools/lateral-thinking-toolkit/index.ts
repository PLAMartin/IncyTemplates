import type { ToolDefinition } from "../types";
import { lateralThinkingToolkitInputSchema, lateralThinkingToolkitResultSchema } from "./schema";
import type { LateralThinkingToolkitInput, LateralThinkingToolkitResult } from "./schema";
import { generateLateralThinkingPrompts } from "./scoring";
import { lateralThinkingToolkitCopySchema } from "./copy";

export const LATERAL_THINKING_TOOLKIT_TOOL_KEY = "lateral-thinking-toolkit";

export const lateralThinkingToolkitTool: ToolDefinition<LateralThinkingToolkitInput, LateralThinkingToolkitResult> = {
  key: LATERAL_THINKING_TOOLKIT_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: lateralThinkingToolkitInputSchema,
  resultSchema: lateralThinkingToolkitResultSchema,
  run: generateLateralThinkingPrompts,
  copySchema: lateralThinkingToolkitCopySchema,
};

export * from "./schema";
export { generateLateralThinkingPrompts } from "./scoring";
export { lateralThinkingToolkitCopySchema } from "./copy";
