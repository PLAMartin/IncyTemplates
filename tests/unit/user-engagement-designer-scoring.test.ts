import { describe, expect, it } from "vitest";
import { diagnoseUserEngagement } from "@/lib/tools/user-engagement-designer/scoring";
import type { UserEngagementDesignerInput } from "@/lib/tools/user-engagement-designer/schema";

function input(overrides: Partial<UserEngagementDesignerInput> = {}): UserEngagementDesignerInput {
  return {
    triggerStrength: "yes_clear_external_trigger",
    actionEase: "one_simple_step",
    rewardQuality: "yes_varied_and_satisfying",
    investmentDepth: "yes_they_build_something_that_compounds",
    ...overrides,
  };
}

describe("diagnoseUserEngagement — each stage is independently reachable as weakest", () => {
  it("flags trigger as weakest when it's the only weak answer", () => {
    const result = diagnoseUserEngagement(input({ triggerStrength: "no_users_have_to_remember_on_their_own" }));
    expect(result.weakestStage).toBe("trigger");
  });

  it("flags action as weakest when it's the only weak answer", () => {
    const result = diagnoseUserEngagement(input({ actionEase: "several_steps_or_real_effort" }));
    expect(result.weakestStage).toBe("action");
  });

  it("flags reward as weakest when it's the only weak answer", () => {
    const result = diagnoseUserEngagement(input({ rewardQuality: "rarely_or_inconsistently" }));
    expect(result.weakestStage).toBe("reward");
  });

  it("flags investment as weakest when it's the only weak answer", () => {
    const result = diagnoseUserEngagement(input({ investmentDepth: "no_nothing_carries_forward" }));
    expect(result.weakestStage).toBe("investment");
  });
});

describe("diagnoseUserEngagement — ties resolve toward the earlier funnel stage", () => {
  it("picks trigger over action/reward/investment when all are equally weak", () => {
    const result = diagnoseUserEngagement({
      triggerStrength: "sometimes_but_inconsistent",
      actionEase: "a_few_steps",
      rewardQuality: "somewhat_but_predictable_or_flat",
      investmentDepth: "a_little_but_not_much",
    });
    expect(result.weakestStage).toBe("trigger");
    expect(result.secondWeakestStage).toBe("action");
  });
});

describe("diagnoseUserEngagement — result includes rationale and next step", () => {
  it("returns non-empty rationale and next step for the weakest stage", () => {
    const result = diagnoseUserEngagement(input({ rewardQuality: "rarely_or_inconsistently" }));
    expect(result.rationale.length).toBeGreaterThan(0);
    expect(result.nextStep.length).toBeGreaterThan(0);
  });
});

describe("diagnoseUserEngagement — determinism", () => {
  it("the same input always produces the same result", () => {
    const sample = input({ actionEase: "a_few_steps" });
    expect(diagnoseUserEngagement(sample)).toEqual(diagnoseUserEngagement(sample));
  });
});
