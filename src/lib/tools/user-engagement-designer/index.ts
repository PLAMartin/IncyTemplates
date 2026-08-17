import type { ToolDefinition } from "../types";
import { userEngagementDesignerInputSchema, userEngagementDesignerResultSchema } from "./schema";
import type { UserEngagementDesignerInput, UserEngagementDesignerResult } from "./schema";
import { diagnoseUserEngagement } from "./scoring";
import { userEngagementDesignerCopySchema } from "./copy";

export const USER_ENGAGEMENT_DESIGNER_TOOL_KEY = "user-engagement-designer";

export const userEngagementDesignerTool: ToolDefinition<UserEngagementDesignerInput, UserEngagementDesignerResult> = {
  key: USER_ENGAGEMENT_DESIGNER_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: userEngagementDesignerInputSchema,
  resultSchema: userEngagementDesignerResultSchema,
  run: diagnoseUserEngagement,
  copySchema: userEngagementDesignerCopySchema,
};

export * from "./schema";
export { diagnoseUserEngagement } from "./scoring";
export { userEngagementDesignerCopySchema } from "./copy";
