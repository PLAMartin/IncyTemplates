import type { ToolDefinition } from "../types";
import { productMarketFitTrackerInputSchema, productMarketFitTrackerResultSchema } from "./schema";
import type { ProductMarketFitTrackerInput, ProductMarketFitTrackerResult } from "./schema";
import { scoreProductMarketFitTracker } from "./scoring";
import { productMarketFitTrackerCopySchema } from "./copy";

export const PRODUCT_MARKET_FIT_TRACKER_TOOL_KEY = "product-market-fit-tracker";

export const productMarketFitTrackerTool: ToolDefinition<ProductMarketFitTrackerInput, ProductMarketFitTrackerResult> = {
  key: PRODUCT_MARKET_FIT_TRACKER_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: productMarketFitTrackerInputSchema,
  resultSchema: productMarketFitTrackerResultSchema,
  run: scoreProductMarketFitTracker,
  copySchema: productMarketFitTrackerCopySchema,
};

export * from "./schema";
export { scoreProductMarketFitTracker } from "./scoring";
export { productMarketFitTrackerCopySchema } from "./copy";
