import { describe, expect, it } from "vitest";
import { scoreDecisionFrameworkPicker } from "@/lib/tools/decision-framework-picker/scoring";
import type { DecisionFrameworkPickerInput } from "@/lib/tools/decision-framework-picker/schema";

describe("scoreDecisionFrameworkPicker — each candidate has a reachable winning case", () => {
  it("recommends Six Thinking Hats when multiple perspectives are involved in one decision with precedent worth real time", () => {
    const input: DecisionFrameworkPickerInput = {
      involvement: "multiple_people_or_perspectives_needed",
      decisionShape: "one_decision_to_reason_through",
      precedent: "clear_precedent_to_copy",
      timeWorthInvesting: "worth_real_time_and_thought",
    };
    const result = scoreDecisionFrameworkPicker(input);
    expect(result.recommendedFramework).toBe("six_thinking_hats");
    expect(result.runnerUpFramework).toBe("first_principles");
    expect(result.decidingFactor).toBe("whether multiple people or perspectives are involved, or it's just you");
  });

  it("recommends First Principles Thinking for a solo decision with no precedent worth real time", () => {
    const input: DecisionFrameworkPickerInput = {
      involvement: "just_me",
      decisionShape: "one_decision_to_reason_through",
      precedent: "no_clear_precedent",
      timeWorthInvesting: "worth_real_time_and_thought",
    };
    const result = scoreDecisionFrameworkPicker(input);
    expect(result.recommendedFramework).toBe("first_principles");
    expect(result.runnerUpFramework).toBe("six_thinking_hats");
    expect(result.decidingFactor).toBe("whether there's a clear existing approach to copy");
  });

  it("recommends Razors for a small frequent solo choice with precedent not worth much time", () => {
    const input: DecisionFrameworkPickerInput = {
      involvement: "just_me",
      decisionShape: "small_frequent_choice",
      precedent: "clear_precedent_to_copy",
      timeWorthInvesting: "not_worth_much_time",
    };
    const result = scoreDecisionFrameworkPicker(input);
    expect(result.recommendedFramework).toBe("razors");
  });

  it("recommends the Boundary Rule for a sequence of options", () => {
    const input: DecisionFrameworkPickerInput = {
      involvement: "just_me",
      decisionShape: "sequence_of_options",
      precedent: "clear_precedent_to_copy",
      timeWorthInvesting: "worth_real_time_and_thought",
    };
    const result = scoreDecisionFrameworkPicker(input);
    expect(result.recommendedFramework).toBe("boundary_rule");
  });
});

describe("scoreDecisionFrameworkPicker — no gate, every combination just ranks", () => {
  it("always returns a recommended and runner-up framework, never disqualifying any candidate", () => {
    const result = scoreDecisionFrameworkPicker({
      involvement: "just_me",
      decisionShape: "one_decision_to_reason_through",
      precedent: "clear_precedent_to_copy",
      timeWorthInvesting: "not_worth_much_time",
    });
    expect(result.recommendedFramework).toBeTruthy();
    expect(result.runnerUpFramework).toBeTruthy();
  });
});

describe("scoreDecisionFrameworkPicker — determinism", () => {
  it("the same input always produces the same result", () => {
    const input: DecisionFrameworkPickerInput = {
      involvement: "multiple_people_or_perspectives_needed",
      decisionShape: "small_frequent_choice",
      precedent: "no_clear_precedent",
      timeWorthInvesting: "worth_real_time_and_thought",
    };
    const first = scoreDecisionFrameworkPicker(input);
    const second = scoreDecisionFrameworkPicker(input);
    expect(first).toEqual(second);
  });
});
