import { productIdeaAssessorTool } from "./product-idea-assessor";
import { customerDiscoveryKitTool } from "./customer-discovery-kit";
import { betterDecisionMakerTool } from "./better-decision-maker";
import type { ToolDefinition } from "./types";
import { ToolNotAvailableError } from "./types";

/**
 * Compile-time registry (spec v3 §12.3): `it_products.tool_key` is only ever a string
 * pointer into this map, never a code path chosen by untrusted database content. Add a new
 * Tool by importing its `ToolDefinition` and adding one entry here — nothing else in the
 * app should construct a Tool definition ad hoc.
 */
const TOOL_REGISTRY: Record<string, ToolDefinition<unknown, unknown>> = {
  [productIdeaAssessorTool.key]: productIdeaAssessorTool as ToolDefinition<unknown, unknown>,
  [customerDiscoveryKitTool.key]: customerDiscoveryKitTool as ToolDefinition<unknown, unknown>,
  [betterDecisionMakerTool.key]: betterDecisionMakerTool as ToolDefinition<unknown, unknown>,
};

/** Returns the Tool definition for `toolKey`, or null if none is registered. */
export function findToolDefinition(toolKey: string): ToolDefinition<unknown, unknown> | null {
  return TOOL_REGISTRY[toolKey] ?? null;
}

/** Same lookup, throwing `ToolNotAvailableError` (spec §35.4's `TOOL_NOT_AVAILABLE`) instead of returning null. */
export function getToolDefinition(toolKey: string): ToolDefinition<unknown, unknown> {
  const definition = findToolDefinition(toolKey);
  if (!definition) throw new ToolNotAvailableError(toolKey);
  return definition;
}
