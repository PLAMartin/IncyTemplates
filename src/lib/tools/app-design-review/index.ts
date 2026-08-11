import type { ToolDefinition } from "../types";
import { appDesignReviewInputSchema, appDesignReviewResultSchema } from "./schema";
import type { AppDesignReviewInput, AppDesignReviewResult } from "./schema";
import { reviewAppDesign } from "./scoring";

export const APP_DESIGN_REVIEW_TOOL_KEY = "app-design-review";

export const appDesignReviewTool: ToolDefinition<AppDesignReviewInput, AppDesignReviewResult> = {
  key: APP_DESIGN_REVIEW_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: appDesignReviewInputSchema,
  resultSchema: appDesignReviewResultSchema,
  run: reviewAppDesign,
};

export * from "./schema";
export { reviewAppDesign } from "./scoring";
