import type { ToolDefinition } from "../types";
import { firstCustomersPlannerInputSchema, firstCustomersPlannerResultSchema } from "./schema";
import type { FirstCustomersPlannerInput, FirstCustomersPlannerResult } from "./schema";
import { scoreFirstCustomersPlanner } from "./scoring";

export const FIRST_CUSTOMERS_PLANNER_TOOL_KEY = "first-customers-planner";

export const firstCustomersPlannerTool: ToolDefinition<FirstCustomersPlannerInput, FirstCustomersPlannerResult> = {
  key: FIRST_CUSTOMERS_PLANNER_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: firstCustomersPlannerInputSchema,
  resultSchema: firstCustomersPlannerResultSchema,
  run: scoreFirstCustomersPlanner,
};

export * from "./schema";
export { scoreFirstCustomersPlanner } from "./scoring";
