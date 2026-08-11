import { z } from "zod";

/**
 * AI Agent Designer tool input/result schemas (spec v4 §37's "architecture questionnaire"). A
 * gated decision tree, the third instance of that shape (MVP Scoper's score+gate,
 * docs/decisions/0016; Meeting Reset's pure form, docs/decisions/0039). Six required yes/no
 * checks, always asked in fixed order — every answer is collected before gate priority is
 * applied in scoring.ts, not a dynamically-branching UI. The first gate mirrors the source
 * post's own leading advice: a predictable, fixed-path task means no agent is needed at all,
 * regardless of every other answer. See docs/decisions/0043.
 */
export const taskPredictabilitySchema = z.enum(["fixed_predictable_path", "needs_flexibility_and_judgement"]);
export type TaskPredictability = z.infer<typeof taskPredictabilitySchema>;

export const needsExternalDataSchema = z.enum(["yes_needs_current_or_external_data", "no_training_data_is_enough"]);
export type NeedsExternalData = z.infer<typeof needsExternalDataSchema>;

export const needsMultiStepReasoningSchema = z.enum(["yes_needs_sequential_steps", "no_a_single_step_is_enough"]);
export type NeedsMultiStepReasoning = z.infer<typeof needsMultiStepReasoningSchema>;

export const needsDifferentHandlingSchema = z.enum(["yes_different_requests_need_different_handling", "no_one_handling_path_is_enough"]);
export type NeedsDifferentHandling = z.infer<typeof needsDifferentHandlingSchema>;

export const needsSubtaskDecompositionSchema = z.enum(["yes_can_split_into_specialised_subtasks", "no_its_one_cohesive_task"]);
export type NeedsSubtaskDecomposition = z.infer<typeof needsSubtaskDecompositionSchema>;

export const needsSelfCritiqueSchema = z.enum(["yes_quality_improves_with_iteration", "no_a_single_pass_is_enough"]);
export type NeedsSelfCritique = z.infer<typeof needsSelfCritiqueSchema>;

export const aiAgentDesignerInputSchema = z.object({
  taskPredictability: taskPredictabilitySchema,
  needsExternalData: needsExternalDataSchema,
  needsMultiStepReasoning: needsMultiStepReasoningSchema,
  needsDifferentHandling: needsDifferentHandlingSchema,
  needsSubtaskDecomposition: needsSubtaskDecompositionSchema,
  needsSelfCritique: needsSelfCritiqueSchema,
});
export type AiAgentDesignerInput = z.infer<typeof aiAgentDesignerInputSchema>;

export const agentVerdictSchema = z.enum([
  "workflow_not_agent",
  "augmented_llm",
  "prompt_chaining",
  "routing_system",
  "orchestrator_worker",
  "evaluator_optimiser",
]);
export type AgentVerdict = z.infer<typeof agentVerdictSchema>;

export const aiAgentDesignerResultSchema = z.object({
  verdict: agentVerdictSchema,
  rationale: z.string(),
  nextStep: z.string(),
});
export type AiAgentDesignerResult = z.infer<typeof aiAgentDesignerResultSchema>;
