import type { ToolDefinition } from "../types";
import { aiAgentDesignerInputSchema, aiAgentDesignerResultSchema } from "./schema";
import type { AiAgentDesignerInput, AiAgentDesignerResult } from "./schema";
import { designAiAgent } from "./scoring";
import { aiAgentDesignerCopySchema } from "./copy";

export const AI_AGENT_DESIGNER_TOOL_KEY = "ai-agent-designer";

export const aiAgentDesignerTool: ToolDefinition<AiAgentDesignerInput, AiAgentDesignerResult> = {
  key: AI_AGENT_DESIGNER_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: aiAgentDesignerInputSchema,
  resultSchema: aiAgentDesignerResultSchema,
  run: designAiAgent,
  copySchema: aiAgentDesignerCopySchema,
};

export * from "./schema";
export { designAiAgent } from "./scoring";
export { aiAgentDesignerCopySchema } from "./copy";
