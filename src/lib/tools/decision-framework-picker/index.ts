import type { ToolDefinition } from "../types";
import { decisionFrameworkPickerInputSchema, decisionFrameworkPickerResultSchema } from "./schema";
import type { DecisionFrameworkPickerInput, DecisionFrameworkPickerResult } from "./schema";
import { scoreDecisionFrameworkPicker } from "./scoring";

export const DECISION_FRAMEWORK_PICKER_TOOL_KEY = "decision-framework-picker";

export const decisionFrameworkPickerTool: ToolDefinition<DecisionFrameworkPickerInput, DecisionFrameworkPickerResult> = {
  key: DECISION_FRAMEWORK_PICKER_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: decisionFrameworkPickerInputSchema,
  resultSchema: decisionFrameworkPickerResultSchema,
  run: scoreDecisionFrameworkPicker,
};

export * from "./schema";
export { scoreDecisionFrameworkPicker } from "./scoring";
