import type { ToolDefinition } from "../types";
import { productPrioritisationToolInputSchema, productPrioritisationToolResultSchema } from "./schema";
import type { ProductPrioritisationToolInput, ProductPrioritisationToolResult } from "./schema";
import { scoreProductPrioritisationTool } from "./scoring";

export const PRODUCT_PRIORITISATION_TOOL_TOOL_KEY = "product-prioritisation-tool";

export const productPrioritisationToolTool: ToolDefinition<ProductPrioritisationToolInput, ProductPrioritisationToolResult> = {
  key: PRODUCT_PRIORITISATION_TOOL_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: productPrioritisationToolInputSchema,
  resultSchema: productPrioritisationToolResultSchema,
  run: scoreProductPrioritisationTool,
};

export * from "./schema";
export { scoreProductPrioritisationTool } from "./scoring";
