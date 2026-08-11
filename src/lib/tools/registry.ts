import { productIdeaAssessorTool } from "./product-idea-assessor";
import { customerDiscoveryKitTool } from "./customer-discovery-kit";
import { betterDecisionMakerTool } from "./better-decision-maker";
import { mvpScoperTool } from "./mvp-scoper";
import { productNamingSystemTool } from "./product-naming-system";
import { firstCustomersPlannerTool } from "./first-customers-planner";
import { productMarketFitTrackerTool } from "./product-market-fit-tracker";
import { pricingYourProductTool } from "./pricing-your-product";
import { productIdeaGeneratorTool } from "./product-idea-generator";
import { businessModelChooserTool } from "./business-model-chooser";
import { decisionFrameworkPickerTool } from "./decision-framework-picker";
import { productPositioningBuilderTool } from "./product-positioning-builder";
import { customerDemandTestTool } from "./customer-demand-test";
import { productPrioritisationToolTool } from "./product-prioritisation-tool";
import { lateralThinkingToolkitTool } from "./lateral-thinking-toolkit";
import { userEngagementDesignerTool } from "./user-engagement-designer";
import { storyBuilderTool } from "./story-builder";
import { startupLaunchPlannerTool } from "./startup-launch-planner";
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
  [mvpScoperTool.key]: mvpScoperTool as ToolDefinition<unknown, unknown>,
  [productNamingSystemTool.key]: productNamingSystemTool as ToolDefinition<unknown, unknown>,
  [firstCustomersPlannerTool.key]: firstCustomersPlannerTool as ToolDefinition<unknown, unknown>,
  [productMarketFitTrackerTool.key]: productMarketFitTrackerTool as ToolDefinition<unknown, unknown>,
  [pricingYourProductTool.key]: pricingYourProductTool as ToolDefinition<unknown, unknown>,
  [productIdeaGeneratorTool.key]: productIdeaGeneratorTool as ToolDefinition<unknown, unknown>,
  [businessModelChooserTool.key]: businessModelChooserTool as ToolDefinition<unknown, unknown>,
  [decisionFrameworkPickerTool.key]: decisionFrameworkPickerTool as ToolDefinition<unknown, unknown>,
  [productPositioningBuilderTool.key]: productPositioningBuilderTool as ToolDefinition<unknown, unknown>,
  [customerDemandTestTool.key]: customerDemandTestTool as ToolDefinition<unknown, unknown>,
  [productPrioritisationToolTool.key]: productPrioritisationToolTool as ToolDefinition<unknown, unknown>,
  [lateralThinkingToolkitTool.key]: lateralThinkingToolkitTool as ToolDefinition<unknown, unknown>,
  [userEngagementDesignerTool.key]: userEngagementDesignerTool as ToolDefinition<unknown, unknown>,
  [storyBuilderTool.key]: storyBuilderTool as ToolDefinition<unknown, unknown>,
  [startupLaunchPlannerTool.key]: startupLaunchPlannerTool as ToolDefinition<unknown, unknown>,
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
