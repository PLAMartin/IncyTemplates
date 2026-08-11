import type { ToolDefinition } from "../types";
import { businessModelChooserInputSchema, businessModelChooserResultSchema } from "./schema";
import type { BusinessModelChooserInput, BusinessModelChooserResult } from "./schema";
import { scoreBusinessModelChooser } from "./scoring";

export const BUSINESS_MODEL_CHOOSER_TOOL_KEY = "business-model-chooser";

export const businessModelChooserTool: ToolDefinition<BusinessModelChooserInput, BusinessModelChooserResult> = {
  key: BUSINESS_MODEL_CHOOSER_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: businessModelChooserInputSchema,
  resultSchema: businessModelChooserResultSchema,
  run: scoreBusinessModelChooser,
};

export * from "./schema";
export { scoreBusinessModelChooser } from "./scoring";
