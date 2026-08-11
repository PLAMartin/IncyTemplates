import { describe, expect, it } from "vitest";
import { designAiAgent } from "@/lib/tools/ai-agent-designer/scoring";
import type { AiAgentDesignerInput } from "@/lib/tools/ai-agent-designer/schema";

function input(overrides: Partial<AiAgentDesignerInput> = {}): AiAgentDesignerInput {
  return {
    taskPredictability: "needs_flexibility_and_judgement",
    needsExternalData: "no_training_data_is_enough",
    needsMultiStepReasoning: "no_a_single_step_is_enough",
    needsDifferentHandling: "no_one_handling_path_is_enough",
    needsSubtaskDecomposition: "no_its_one_cohesive_task",
    needsSelfCritique: "no_a_single_pass_is_enough",
    ...overrides,
  };
}

describe("designAiAgent — each verdict has a reachable case", () => {
  it("recommends a workflow when the task is predictable", () => {
    const result = designAiAgent(input({ taskPredictability: "fixed_predictable_path" }));
    expect(result.verdict).toBe("workflow_not_agent");
  });

  it("recommends Evaluator-Optimiser when quality improves with iteration", () => {
    const result = designAiAgent(input({ needsSelfCritique: "yes_quality_improves_with_iteration" }));
    expect(result.verdict).toBe("evaluator_optimiser");
  });

  it("recommends Orchestrator-Worker when the task splits into specialised subtasks", () => {
    const result = designAiAgent(input({ needsSubtaskDecomposition: "yes_can_split_into_specialised_subtasks" }));
    expect(result.verdict).toBe("orchestrator_worker");
  });

  it("recommends Routing System when different requests need different handling", () => {
    const result = designAiAgent(input({ needsDifferentHandling: "yes_different_requests_need_different_handling" }));
    expect(result.verdict).toBe("routing_system");
  });

  it("recommends Prompt Chaining when the task needs sequential reasoning", () => {
    const result = designAiAgent(input({ needsMultiStepReasoning: "yes_needs_sequential_steps" }));
    expect(result.verdict).toBe("prompt_chaining");
  });

  it("recommends Augmented LLM as the fallback agentic case", () => {
    const result = designAiAgent(input({ needsExternalData: "yes_needs_current_or_external_data" }));
    expect(result.verdict).toBe("augmented_llm");
  });

  it("recommends Augmented LLM when nothing else is flagged and the task still isn't predictable", () => {
    const result = designAiAgent(input());
    expect(result.verdict).toBe("augmented_llm");
  });
});

describe("designAiAgent — gate priority order", () => {
  it("the predictability gate wins regardless of every other answer", () => {
    const result = designAiAgent({
      taskPredictability: "fixed_predictable_path",
      needsExternalData: "yes_needs_current_or_external_data",
      needsMultiStepReasoning: "yes_needs_sequential_steps",
      needsDifferentHandling: "yes_different_requests_need_different_handling",
      needsSubtaskDecomposition: "yes_can_split_into_specialised_subtasks",
      needsSelfCritique: "yes_quality_improves_with_iteration",
    });
    expect(result.verdict).toBe("workflow_not_agent");
  });

  it("self-critique wins over subtask decomposition when both are flagged", () => {
    const result = designAiAgent(
      input({ needsSelfCritique: "yes_quality_improves_with_iteration", needsSubtaskDecomposition: "yes_can_split_into_specialised_subtasks" }),
    );
    expect(result.verdict).toBe("evaluator_optimiser");
  });

  it("subtask decomposition wins over routing when both are flagged", () => {
    const result = designAiAgent(
      input({ needsSubtaskDecomposition: "yes_can_split_into_specialised_subtasks", needsDifferentHandling: "yes_different_requests_need_different_handling" }),
    );
    expect(result.verdict).toBe("orchestrator_worker");
  });

  it("routing wins over multi-step reasoning when both are flagged", () => {
    const result = designAiAgent(
      input({ needsDifferentHandling: "yes_different_requests_need_different_handling", needsMultiStepReasoning: "yes_needs_sequential_steps" }),
    );
    expect(result.verdict).toBe("routing_system");
  });

  it("multi-step reasoning wins over external data when both are flagged", () => {
    const result = designAiAgent(input({ needsMultiStepReasoning: "yes_needs_sequential_steps", needsExternalData: "yes_needs_current_or_external_data" }));
    expect(result.verdict).toBe("prompt_chaining");
  });
});

describe("designAiAgent — result includes rationale and next step", () => {
  it("returns non-empty rationale and next step for every verdict", () => {
    const result = designAiAgent(input());
    expect(result.rationale.length).toBeGreaterThan(0);
    expect(result.nextStep.length).toBeGreaterThan(0);
  });
});

describe("designAiAgent — determinism", () => {
  it("the same input always produces the same result", () => {
    const sample = input({ needsMultiStepReasoning: "yes_needs_sequential_steps" });
    expect(designAiAgent(sample)).toEqual(designAiAgent(sample));
  });
});
