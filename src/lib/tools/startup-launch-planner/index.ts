import type { ToolDefinition } from "../types";
import { startupLaunchPlannerInputSchema, startupLaunchPlannerResultSchema } from "./schema";
import type { StartupLaunchPlannerInput, StartupLaunchPlannerResult } from "./schema";
import { generateLaunchPlan } from "./scoring";
import { startupLaunchPlannerCopySchema } from "./copy";

export const STARTUP_LAUNCH_PLANNER_TOOL_KEY = "startup-launch-planner";

export const startupLaunchPlannerTool: ToolDefinition<StartupLaunchPlannerInput, StartupLaunchPlannerResult> = {
  key: STARTUP_LAUNCH_PLANNER_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: startupLaunchPlannerInputSchema,
  resultSchema: startupLaunchPlannerResultSchema,
  run: generateLaunchPlan,
  copySchema: startupLaunchPlannerCopySchema,
};

export * from "./schema";
export { generateLaunchPlan } from "./scoring";
export { startupLaunchPlannerCopySchema } from "./copy";
