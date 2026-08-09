import { describe, expect, it } from "vitest";
import { findToolDefinition, getToolDefinition } from "@/lib/tools/registry";
import { ToolNotAvailableError } from "@/lib/tools/types";
import { PRODUCT_IDEA_ASSESSOR_TOOL_KEY } from "@/lib/tools/product-idea-assessor";
import { CUSTOMER_DISCOVERY_KIT_TOOL_KEY } from "@/lib/tools/customer-discovery-kit";
import { BETTER_DECISION_MAKER_TOOL_KEY } from "@/lib/tools/better-decision-maker";
import { MVP_SCOPER_TOOL_KEY } from "@/lib/tools/mvp-scoper";
import { PRODUCT_NAMING_SYSTEM_TOOL_KEY } from "@/lib/tools/product-naming-system";
import { FIRST_CUSTOMERS_PLANNER_TOOL_KEY } from "@/lib/tools/first-customers-planner";

describe("tool registry", () => {
  it("resolves a known tool_key to its definition", () => {
    const definition = findToolDefinition(PRODUCT_IDEA_ASSESSOR_TOOL_KEY);
    expect(definition).not.toBeNull();
    expect(definition?.key).toBe(PRODUCT_IDEA_ASSESSOR_TOOL_KEY);
    expect(definition?.schemaVersion).toBe(1);
  });

  it("findToolDefinition returns null (never throws, never runs arbitrary code) for an unknown key", () => {
    expect(findToolDefinition("not-a-real-tool")).toBeNull();
    expect(findToolDefinition("'; DROP TABLE it_products; --")).toBeNull();
  });

  it("getToolDefinition throws a typed TOOL_NOT_AVAILABLE error for an unknown key", () => {
    expect(() => getToolDefinition("not-a-real-tool")).toThrow(ToolNotAvailableError);
  });

  it("the registered run() function actually executes the deterministic scoring logic", () => {
    const definition = getToolDefinition(PRODUCT_IDEA_ASSESSOR_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      classification: "copy",
      behaviourEvidence: "committed",
      problemEvidence: "validated",
      differentiationClarity: "clear",
      targetSpecificity: "specific",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { evidenceQualityScore: number };
    expect(parsedResult.evidenceQualityScore).toBe(100);
  });

  it("rejects malformed input via the registered input schema (TOOL_INPUT_INVALID path)", () => {
    const definition = getToolDefinition(PRODUCT_IDEA_ASSESSOR_TOOL_KEY);
    const parsed = definition.inputSchema.safeParse({ classification: "not-a-real-classification" });
    expect(parsed.success).toBe(false);
  });

  it("resolves the second registered tool (Customer Discovery Kit) independently of the first", () => {
    const definition = getToolDefinition(CUSTOMER_DISCOVERY_KIT_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      interviewCount: "more_than_ten",
      questionStyle: "mostly_open",
      evidenceType: "consistent_past_behaviour",
      commitmentSignal: "money_or_switching_cost",
      patternConsistency: "strong_pattern",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { evidenceStrengthScore: number };
    expect(parsedResult.evidenceStrengthScore).toBe(100);
  });

  it("resolves the third registered tool (Better Decision Maker) independently of the first two", () => {
    const definition = getToolDefinition(BETTER_DECISION_MAKER_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      optionALikelihood: "high",
      optionAImpact: "large",
      optionAEffort: "low",
      optionAReversibility: "two_way_door",
      optionBLikelihood: "low",
      optionBImpact: "small",
      optionBEffort: "high",
      optionBReversibility: "one_way_door",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { recommendation: string };
    expect(parsedResult.recommendation).toBe("option_a");
  });

  it("resolves the fourth registered tool (MVP Scoper) independently of the others", () => {
    const definition = getToolDefinition(MVP_SCOPER_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      necessity: "essential_for_core_value",
      riskyQuestionRelevance: "directly_answers",
      buildEffort: "low",
      fakeability: "no",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { classification: string };
    expect(parsedResult.classification).toBe("keep");
  });

  it("resolves the fifth registered tool (Product Naming System) independently of the others", () => {
    const definition = getToolDefinition(PRODUCT_NAMING_SYSTEM_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      nameAMemorability: "high",
      nameAClarity: "high",
      nameADistinctiveness: "high",
      nameAAvailability: "fully_available",
      nameBMemorability: "low",
      nameBClarity: "low",
      nameBDistinctiveness: "low",
      nameBAvailability: "fully_available",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { recommendation: string };
    expect(parsedResult.recommendation).toBe("name_a");
  });

  it("resolves the sixth and final registered tool (First Customers Planner) independently of the others", () => {
    const definition = getToolDefinition(FIRST_CUSTOMERS_PLANNER_TOOL_KEY);
    const parsedInput = definition.inputSchema.parse({
      channelType: "cold_outreach",
      audiencePresence: "high",
      founderFit: "high",
      effortToStart: "low",
      repeatability: "high",
    });
    const result = definition.run(parsedInput);
    const parsedResult = definition.resultSchema.parse(result) as { fit: string };
    expect(parsedResult.fit).toBe("strong_fit");
  });
});
