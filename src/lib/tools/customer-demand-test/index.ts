import type { ToolDefinition } from "../types";
import { customerDemandTestInputSchema, customerDemandTestResultSchema } from "./schema";
import type { CustomerDemandTestInput, CustomerDemandTestResult } from "./schema";
import { scoreCustomerDemandTest } from "./scoring";

export const CUSTOMER_DEMAND_TEST_TOOL_KEY = "customer-demand-test";

export const customerDemandTestTool: ToolDefinition<CustomerDemandTestInput, CustomerDemandTestResult> = {
  key: CUSTOMER_DEMAND_TEST_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: customerDemandTestInputSchema,
  resultSchema: customerDemandTestResultSchema,
  run: scoreCustomerDemandTest,
};

export * from "./schema";
export { scoreCustomerDemandTest } from "./scoring";
