import type { ToolDefinition } from "../types";
import { customerDiscoveryEvidenceInputSchema, customerDiscoveryEvidenceResultSchema } from "./schema";
import type { CustomerDiscoveryEvidenceInput, CustomerDiscoveryEvidenceResult } from "./schema";
import { scoreCustomerDiscoveryEvidence } from "./scoring";
import { customerDiscoveryKitCopySchema } from "./copy";

export const CUSTOMER_DISCOVERY_KIT_TOOL_KEY = "customer-discovery-kit";

export const customerDiscoveryKitTool: ToolDefinition<CustomerDiscoveryEvidenceInput, CustomerDiscoveryEvidenceResult> = {
  key: CUSTOMER_DISCOVERY_KIT_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: customerDiscoveryEvidenceInputSchema,
  resultSchema: customerDiscoveryEvidenceResultSchema,
  run: scoreCustomerDiscoveryEvidence,
  copySchema: customerDiscoveryKitCopySchema,
};

export * from "./schema";
export { scoreCustomerDiscoveryEvidence } from "./scoring";
export { customerDiscoveryKitCopySchema } from "./copy";
