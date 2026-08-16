import type { ToolDefinition } from "../types";
import { stickyPitchCheckerInputSchema, stickyPitchCheckerResultSchema } from "./schema";
import type { StickyPitchCheckerInput, StickyPitchCheckerResult } from "./schema";
import { checkStickyPitch } from "./scoring";

export const STICKY_PITCH_CHECKER_TOOL_KEY = "sticky-pitch-checker";

export const stickyPitchCheckerTool: ToolDefinition<StickyPitchCheckerInput, StickyPitchCheckerResult> = {
  key: STICKY_PITCH_CHECKER_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: stickyPitchCheckerInputSchema,
  resultSchema: stickyPitchCheckerResultSchema,
  run: checkStickyPitch,
};

export * from "./schema";
export { checkStickyPitch } from "./scoring";
