import type { ToolDefinition } from "../types";
import { mvpScoperInputSchema, mvpScoperResultSchema } from "./schema";
import type { MvpScoperInput, MvpScoperResult } from "./schema";
import { scoreMvpScoper } from "./scoring";

export const MVP_SCOPER_TOOL_KEY = "mvp-scoper";

export const mvpScoperTool: ToolDefinition<MvpScoperInput, MvpScoperResult> = {
  key: MVP_SCOPER_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: mvpScoperInputSchema,
  resultSchema: mvpScoperResultSchema,
  run: scoreMvpScoper,
};

export * from "./schema";
export { scoreMvpScoper } from "./scoring";
