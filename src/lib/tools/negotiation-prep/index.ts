import type { ToolDefinition } from "../types";
import { negotiationPrepInputSchema, negotiationPrepResultSchema } from "./schema";
import type { NegotiationPrepInput, NegotiationPrepResult } from "./schema";
import { checkNegotiationPrep } from "./scoring";
import { negotiationPrepCopySchema } from "./copy";

export const NEGOTIATION_PREP_TOOL_KEY = "negotiation-prep";

export const negotiationPrepTool: ToolDefinition<NegotiationPrepInput, NegotiationPrepResult> = {
  key: NEGOTIATION_PREP_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: negotiationPrepInputSchema,
  resultSchema: negotiationPrepResultSchema,
  run: checkNegotiationPrep,
  copySchema: negotiationPrepCopySchema,
};

export * from "./schema";
export { checkNegotiationPrep } from "./scoring";
export { negotiationPrepCopySchema } from "./copy";
