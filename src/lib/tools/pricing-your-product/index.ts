import type { ToolDefinition } from "../types";
import { pricingYourProductInputSchema, pricingYourProductResultSchema } from "./schema";
import type { PricingYourProductInput, PricingYourProductResult } from "./schema";
import { scorePricingYourProduct } from "./scoring";
import { pricingYourProductCopySchema } from "./copy";

export const PRICING_YOUR_PRODUCT_TOOL_KEY = "pricing-your-product";

export const pricingYourProductTool: ToolDefinition<PricingYourProductInput, PricingYourProductResult> = {
  key: PRICING_YOUR_PRODUCT_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: pricingYourProductInputSchema,
  resultSchema: pricingYourProductResultSchema,
  run: scorePricingYourProduct,
  copySchema: pricingYourProductCopySchema,
};

export * from "./schema";
export { scorePricingYourProduct } from "./scoring";
export { pricingYourProductCopySchema } from "./copy";
