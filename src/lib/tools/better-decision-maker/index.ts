import type { ToolDefinition } from "../types";
import { betterDecisionMakerInputSchema, betterDecisionMakerResultSchema } from "./schema";
import type { BetterDecisionMakerInput, BetterDecisionMakerResult } from "./schema";
import { scoreBetterDecisionMaker } from "./scoring";
import { betterDecisionMakerCopySchema } from "./copy";

export const BETTER_DECISION_MAKER_TOOL_KEY = "better-decision-maker";

export const betterDecisionMakerTool: ToolDefinition<BetterDecisionMakerInput, BetterDecisionMakerResult> = {
  key: BETTER_DECISION_MAKER_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: betterDecisionMakerInputSchema,
  resultSchema: betterDecisionMakerResultSchema,
  run: scoreBetterDecisionMaker,
  copySchema: betterDecisionMakerCopySchema,
};

export * from "./schema";
export { scoreBetterDecisionMaker } from "./scoring";
export { betterDecisionMakerCopySchema } from "./copy";
