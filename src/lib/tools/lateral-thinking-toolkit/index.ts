import type { ToolDefinition } from "../types";
import { lateralThinkingToolkitInputSchema, lateralThinkingToolkitResultSchema } from "./schema";
import type { LateralThinkingToolkitInput, LateralThinkingToolkitResult } from "./schema";
import { generateLateralThinkingPrompts } from "./scoring";

export const LATERAL_THINKING_TOOLKIT_TOOL_KEY = "lateral-thinking-toolkit";

export const lateralThinkingToolkitTool: ToolDefinition<LateralThinkingToolkitInput, LateralThinkingToolkitResult> = {
  key: LATERAL_THINKING_TOOLKIT_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: lateralThinkingToolkitInputSchema,
  resultSchema: lateralThinkingToolkitResultSchema,
  run: generateLateralThinkingPrompts,
};

export * from "./schema";
export { generateLateralThinkingPrompts } from "./scoring";
