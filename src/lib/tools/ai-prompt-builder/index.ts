import type { ToolDefinition } from "../types";
import { aiPromptBuilderInputSchema, aiPromptBuilderResultSchema } from "./schema";
import type { AiPromptBuilderInput, AiPromptBuilderResult } from "./schema";
import { buildAiPrompt } from "./scoring";
import { aiPromptBuilderCopySchema } from "./copy";

export const AI_PROMPT_BUILDER_TOOL_KEY = "ai-prompt-builder";

export const aiPromptBuilderTool: ToolDefinition<AiPromptBuilderInput, AiPromptBuilderResult> = {
  key: AI_PROMPT_BUILDER_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: aiPromptBuilderInputSchema,
  resultSchema: aiPromptBuilderResultSchema,
  run: buildAiPrompt,
  copySchema: aiPromptBuilderCopySchema,
};

export * from "./schema";
export { buildAiPrompt } from "./scoring";
export { aiPromptBuilderCopySchema } from "./copy";
