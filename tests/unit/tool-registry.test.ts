import { describe, expect, it } from "vitest";
import { findToolDefinition, getToolDefinition } from "@/lib/tools/registry";
import { ToolNotAvailableError } from "@/lib/tools/types";
import { PRODUCT_IDEA_ASSESSOR_TOOL_KEY } from "@/lib/tools/product-idea-assessor";
import { CUSTOMER_DISCOVERY_KIT_TOOL_KEY } from "@/lib/tools/customer-discovery-kit";

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
});
