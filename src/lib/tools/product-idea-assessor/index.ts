import type { ToolDefinition } from "../types";
import { productIdeaAssessorInputSchema, productIdeaAssessorResultSchema } from "./schema";
import type { ProductIdeaAssessorInput, ProductIdeaAssessorResult } from "./schema";
import { scoreProductIdeaAssessor } from "./scoring";
import { productIdeaAssessorCopySchema } from "./copy";

export const PRODUCT_IDEA_ASSESSOR_TOOL_KEY = "product-idea-assessor";

export const productIdeaAssessorTool: ToolDefinition<ProductIdeaAssessorInput, ProductIdeaAssessorResult> = {
  key: PRODUCT_IDEA_ASSESSOR_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: productIdeaAssessorInputSchema,
  resultSchema: productIdeaAssessorResultSchema,
  run: scoreProductIdeaAssessor,
  copySchema: productIdeaAssessorCopySchema,
};

export * from "./schema";
export { scoreProductIdeaAssessor } from "./scoring";
export { productIdeaAssessorCopySchema } from "./copy";
