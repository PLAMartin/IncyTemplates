import type { ToolDefinition } from "../types";
import { productPositioningBuilderInputSchema, productPositioningBuilderResultSchema } from "./schema";
import type { ProductPositioningBuilderInput, ProductPositioningBuilderResult } from "./schema";
import { scoreProductPositioningBuilder } from "./scoring";

export const PRODUCT_POSITIONING_BUILDER_TOOL_KEY = "product-positioning-builder";

export const productPositioningBuilderTool: ToolDefinition<ProductPositioningBuilderInput, ProductPositioningBuilderResult> = {
  key: PRODUCT_POSITIONING_BUILDER_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: productPositioningBuilderInputSchema,
  resultSchema: productPositioningBuilderResultSchema,
  run: scoreProductPositioningBuilder,
};

export * from "./schema";
export { scoreProductPositioningBuilder } from "./scoring";
