import type { AgentVerdict, AiAgentDesignerInput, AiAgentDesignerResult } from "./schema";

/**
 * Deterministic architecture recommendation for the AI Agent Designer (spec v4 §37). No AI is
 * involved, consistent with every prior Tool (docs/decisions/0016) — every branch below is a
 * fixed rule, so the same input always produces the same result and every path is
 * unit-testable.
 *
 * A priority-ordered gate, checked in this order:
 *   1. A predictable, fixed-path task → no agent needed at all ("resist the urge to implement
 *      agents when a deterministic script can do it").
 *   2. Otherwise, from most specific/demanding need to most general fallback: does quality
 *      improve through iterative self-critique → Evaluator-Optimiser; else can it decompose
 *      into independent subtasks for specialised workers → Orchestrator-Worker; else do
 *      different request types need genuinely different handling → Routing System; else does it
 *      need sequential multi-step reasoning → Prompt Chaining; else (the simplest agentic case)
 *      → Augmented LLM.
 * Each check only applies once the earlier ones have passed, the same "first matching rule
 * wins" shape as every other gated Tool.
 */

const VERDICT_RATIONALE: Record<AgentVerdict, string> = {
  workflow_not_agent:
    "This task follows a predictable, fixed path — a straightforward script or deterministic workflow will do the job. Adding agent autonomy here would only make it slower, costlier and harder to debug.",
  evaluator_optimiser:
    "Quality genuinely improves through iteration, so this calls for an Evaluator-Optimiser loop: one model generates a response while another critiques and refines it, repeating until the result is good enough.",
  orchestrator_worker:
    "This task splits into independent subtasks best handled separately, so it calls for an Orchestrator-Worker model: a central agent decomposes the task, assigns it to specialised workers, and synthesises their results.",
  routing_system:
    "Different kinds of requests need genuinely different handling, so it calls for a Routing System: the agent classifies each input and directs it to the right subprocess.",
  prompt_chaining:
    "This needs sequential, multi-step reasoning where each step builds on the last, so it calls for Prompt Chaining: breaking the task into ordered steps rather than one large, unreliable prompt.",
  augmented_llm:
    "This is the simplest agentic case — it mainly needs current or external information a base model doesn't have, so it calls for an Augmented LLM: a model enhanced with tools, retrieval or memory.",
};

const VERDICT_NEXT_STEP: Record<AgentVerdict, string> = {
  workflow_not_agent: "Write out the fixed steps as a simple script or decision tree instead — you don't need an agent framework for this.",
  evaluator_optimiser: "Sketch the generator and the evaluator as two separate prompts or models, and decide what \"good enough\" looks like before you build the loop.",
  orchestrator_worker: "List the subtasks and which specialised worker handles each one, then define how the orchestrator combines their results.",
  routing_system: "List the distinct request types you need to handle, and decide what signals the router uses to tell them apart.",
  prompt_chaining: "Write out the sequence of steps on paper first — each one's output becomes the next one's input — before wiring up the chain.",
  augmented_llm: "Identify exactly which tool, retrieval source or memory the base model needs, and start with just that one addition.",
};

export function designAiAgent(input: AiAgentDesignerInput): AiAgentDesignerResult {
  let verdict: AgentVerdict;

  if (input.taskPredictability === "fixed_predictable_path") {
    verdict = "workflow_not_agent";
  } else if (input.needsSelfCritique === "yes_quality_improves_with_iteration") {
    verdict = "evaluator_optimiser";
  } else if (input.needsSubtaskDecomposition === "yes_can_split_into_specialised_subtasks") {
    verdict = "orchestrator_worker";
  } else if (input.needsDifferentHandling === "yes_different_requests_need_different_handling") {
    verdict = "routing_system";
  } else if (input.needsMultiStepReasoning === "yes_needs_sequential_steps") {
    verdict = "prompt_chaining";
  } else {
    verdict = "augmented_llm";
  }

  return {
    verdict,
    rationale: VERDICT_RATIONALE[verdict],
    nextStep: VERDICT_NEXT_STEP[verdict],
  };
}
