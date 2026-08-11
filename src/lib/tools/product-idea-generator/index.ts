import type { ToolDefinition } from "../types";
import { productIdeaGeneratorInputSchema, productIdeaGeneratorResultSchema } from "./schema";
import type { ProductIdeaGeneratorInput, ProductIdeaGeneratorResult } from "./schema";
import { scoreProductIdeaGenerator } from "./scoring";

export const PRODUCT_IDEA_GENERATOR_TOOL_KEY = "product-idea-generator";

export const productIdeaGeneratorTool: ToolDefinition<ProductIdeaGeneratorInput, ProductIdeaGeneratorResult> = {
  key: PRODUCT_IDEA_GENERATOR_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: productIdeaGeneratorInputSchema,
  resultSchema: productIdeaGeneratorResultSchema,
  run: scoreProductIdeaGenerator,
};

export * from "./schema";
export { scoreProductIdeaGenerator } from "./scoring";
