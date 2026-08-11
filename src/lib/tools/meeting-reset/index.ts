import type { ToolDefinition } from "../types";
import { meetingResetInputSchema, meetingResetResultSchema } from "./schema";
import type { MeetingResetInput, MeetingResetResult } from "./schema";
import { diagnoseMeetingUsefulness } from "./scoring";

export const MEETING_RESET_TOOL_KEY = "meeting-reset";

export const meetingResetTool: ToolDefinition<MeetingResetInput, MeetingResetResult> = {
  key: MEETING_RESET_TOOL_KEY,
  schemaVersion: 1,
  inputSchema: meetingResetInputSchema,
  resultSchema: meetingResetResultSchema,
  run: diagnoseMeetingUsefulness,
};

export * from "./schema";
export { diagnoseMeetingUsefulness } from "./scoring";
