import type { ToolDefinition } from "../types";
import { customerDiscoveryEvidenceInputSchema, customerDiscoveryEvidenceResultSchema } from "./schema";
import type { CustomerDiscoveryEvidenceInput, CustomerDiscoveryEvidenceResult } from "./schema";
import { scoreCustomerDiscoveryEvidence } from "./scoring";

export const CUSTOMER_DISCOVERY_KIT_TOOL_KEY = "customer-discovery-kit";

export const customerDiscoveryKitTool: ToolDefinition<CustomerDiscoveryEvidenceInput, CustomerDiscoveryEvidenceResult> = {
  key: CUSTOMER_DISCOVERY_KIT_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: customerDiscoveryEvidenceInputSchema,
  resultSchema: customerDiscoveryEvidenceResultSchema,
  run: scoreCustomerDiscoveryEvidence,
};

export * from "./schema";
export { scoreCustomerDiscoveryEvidence } from "./scoring";
