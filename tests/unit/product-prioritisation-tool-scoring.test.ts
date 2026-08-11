import { describe, expect, it } from "vitest";
import { scoreProductPrioritisationTool } from "@/lib/tools/product-prioritisation-tool/scoring";
import type { ProductPrioritisationToolInput } from "@/lib/tools/product-prioritisation-tool/schema";

describe("scoreProductPrioritisationTool — each candidate has a reachable winning case", () => {
  it("recommends Earliest Due Date when deadlines are hard and everything is achievable", () => {
    const input: ProductPrioritisationToolInput = {
      deadlines: "yes_hard_deadlines",
      everythingAchievable: "yes_its_all_achievable",
      valueVariation: "roughly_equally_important",
      whatWouldHelpMost: "confidence_nothing_important_slips",
    };
    const result = scoreProductPrioritisationTool(input);
    expect(result.recommendedStrategy).toBe("earliest_due_date");
    expect(result.runnerUpStrategy).toBe("shortest_processing_time");
    expect(result.decidingFactor).toBe("whether your tasks have hard deadlines or flexible timing");
  });

  it("recommends Moore's Algorithm when deadlines are hard but something has to give", () => {
    const input: ProductPrioritisationToolInput = {
      deadlines: "yes_hard_deadlines",
      everythingAchievable: "no_something_has_to_give",
      valueVariation: "yes_some_matter_much_more",
      whatWouldHelpMost: "momentum_and_fewer_open_tasks",
    };
    const result = scoreProductPrioritisationTool(input);
    expect(result.recommendedStrategy).toBe("moores_algorithm");
    expect(result.decidingFactor).toBe("whether everything is realistically achievable or something has to give");
  });

  it("recommends Shortest Processing Time when timing is flexible, tasks are equally important, and momentum would help most", () => {
    const input: ProductPrioritisationToolInput = {
      deadlines: "no_flexible_timing",
      everythingAchievable: "yes_its_all_achievable",
      valueVariation: "roughly_equally_important",
      whatWouldHelpMost: "momentum_and_fewer_open_tasks",
    };
    const result = scoreProductPrioritisationTool(input);
    expect(result.recommendedStrategy).toBe("shortest_processing_time");
    expect(result.runnerUpStrategy).toBe("earliest_due_date");
  });

  it("recommends Weighted Processing Time when tasks vary a lot in value and confidence matters most", () => {
    const input: ProductPrioritisationToolInput = {
      deadlines: "no_flexible_timing",
      everythingAchievable: "yes_its_all_achievable",
      valueVariation: "yes_some_matter_much_more",
      whatWouldHelpMost: "confidence_nothing_important_slips",
    };
    const result = scoreProductPrioritisationTool(input);
    expect(result.recommendedStrategy).toBe("weighted_processing_time");
    expect(result.decidingFactor).toBe("whether your tasks vary a lot in value or are roughly equally important");
  });
});

describe("scoreProductPrioritisationTool — no gate, every combination just ranks", () => {
  it("always returns a recommended and runner-up strategy, never disqualifying any candidate", () => {
    const result = scoreProductPrioritisationTool({
      deadlines: "yes_hard_deadlines",
      everythingAchievable: "yes_its_all_achievable",
      valueVariation: "roughly_equally_important",
      whatWouldHelpMost: "momentum_and_fewer_open_tasks",
    });
    expect(result.recommendedStrategy).toBeTruthy();
    expect(result.runnerUpStrategy).toBeTruthy();
  });
});

describe("scoreProductPrioritisationTool — determinism", () => {
  it("the same input always produces the same result", () => {
    const input: ProductPrioritisationToolInput = {
      deadlines: "yes_hard_deadlines",
      everythingAchievable: "no_something_has_to_give",
      valueVariation: "roughly_equally_important",
      whatWouldHelpMost: "confidence_nothing_important_slips",
    };
    const first = scoreProductPrioritisationTool(input);
    const second = scoreProductPrioritisationTool(input);
    expect(first).toEqual(second);
  });
});
