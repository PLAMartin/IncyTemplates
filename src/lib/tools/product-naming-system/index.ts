import type { ToolDefinition } from "../types";
import { productNamingSystemInputSchema, productNamingSystemResultSchema } from "./schema";
import type { ProductNamingSystemInput, ProductNamingSystemResult } from "./schema";
import { scoreProductNamingSystem } from "./scoring";
import { productNamingSystemCopySchema } from "./copy";

export const PRODUCT_NAMING_SYSTEM_TOOL_KEY = "product-naming-system";

export const productNamingSystemTool: ToolDefinition<ProductNamingSystemInput, ProductNamingSystemResult> = {
  key: PRODUCT_NAMING_SYSTEM_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: productNamingSystemInputSchema,
  resultSchema: productNamingSystemResultSchema,
  run: scoreProductNamingSystem,
  copySchema: productNamingSystemCopySchema,
};

export * from "./schema";
export { scoreProductNamingSystem } from "./scoring";
export { productNamingSystemCopySchema } from "./copy";
