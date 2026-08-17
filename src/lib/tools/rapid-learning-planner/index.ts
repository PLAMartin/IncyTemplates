import type { ToolDefinition } from "../types";
import { rapidLearningPlannerInputSchema, rapidLearningPlannerResultSchema } from "./schema";
import type { RapidLearningPlannerInput, RapidLearningPlannerResult } from "./schema";
import { checkRapidLearningPlan } from "./scoring";
import { rapidLearningPlannerCopySchema } from "./copy";

export const RAPID_LEARNING_PLANNER_TOOL_KEY = "rapid-learning-planner";

export const rapidLearningPlannerTool: ToolDefinition<RapidLearningPlannerInput, RapidLearningPlannerResult> = {
  key: RAPID_LEARNING_PLANNER_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: rapidLearningPlannerInputSchema,
  resultSchema: rapidLearningPlannerResultSchema,
  run: checkRapidLearningPlan,
  copySchema: rapidLearningPlannerCopySchema,
};

export * from "./schema";
export { checkRapidLearningPlan } from "./scoring";
export { rapidLearningPlannerCopySchema } from "./copy";
