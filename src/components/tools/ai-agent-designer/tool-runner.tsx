"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import type { AiAgentDesignerInput, AiAgentDesignerResult } from "@/lib/tools/ai-agent-designer/schema";
import { AiAgentDesignerResultSummary } from "@/components/tools/ai-agent-designer/tool-result-summary";

type StepKey = keyof AiAgentDesignerInput;

type Step = {
  key: StepKey;
  legend: string;
  hint?: string;
  options: { value: string; label: string; description: string }[];
};

// Six steps, in the same order scoring.ts checks its gates — the predictability gate first
// (wins outright regardless of every other answer), then the five pattern-matching questions
// from most specific/demanding need to most general fallback.
const STEPS: Step[] = [
  {
    key: "taskPredictability",
    legend: "Does this task follow a predictable, fixed path?",
    options: [
      { value: "needs_flexibility_and_judgement", label: "No, it needs flexibility and judgement", description: "The right approach depends on the specific situation." },
      { value: "fixed_predictable_path", label: "Yes, it's predictable and fixed", description: "The same steps work every time, in the same order." },
    ],
  },
  {
    key: "needsSelfCritique",
    legend: "Does quality improve by critiquing and refining the output?",
    options: [
      { value: "no_a_single_pass_is_enough", label: "No, a single pass is enough", description: "One good attempt is enough — no need to critique and refine." },
      {
        value: "yes_quality_improves_with_iteration",
        label: "Yes, quality improves with iteration",
        description: "A second pass that critiques and refines the first would produce a noticeably better result.",
      },
    ],
  },
  {
    key: "needsSubtaskDecomposition",
    legend: "Does the task split into subtasks that specialised workers could each handle?",
    options: [
      { value: "no_its_one_cohesive_task", label: "No, it's one cohesive task", description: "Splitting it up wouldn't make sense — it's a single piece of work." },
      {
        value: "yes_can_split_into_specialised_subtasks",
        label: "Yes, it splits into specialised subtasks",
        description: "Different parts of the task genuinely call for different expertise or handling.",
      },
    ],
  },
  {
    key: "needsDifferentHandling",
    legend: "Do different kinds of requests need genuinely different handling?",
    options: [
      { value: "no_one_handling_path_is_enough", label: "No, one handling path is enough", description: "Every request coming in can be handled the same way." },
      {
        value: "yes_different_requests_need_different_handling",
        label: "Yes, different requests need different handling",
        description: "Requests genuinely vary in a way that needs different processing.",
      },
    ],
  },
  {
    key: "needsMultiStepReasoning",
    legend: "Does it need multi-step reasoning, where each step builds on the last?",
    options: [
      { value: "no_a_single_step_is_enough", label: "No, a single step is enough", description: "One prompt or call can handle this in one go." },
      {
        value: "yes_needs_sequential_steps",
        label: "Yes, it needs sequential steps",
        description: "Getting a good answer means working through it step by step, each building on the last.",
      },
    ],
  },
  {
    key: "needsExternalData",
    legend: "Does it need current or external information the base model doesn't already have?",
    options: [
      { value: "no_training_data_is_enough", label: "No, training data is enough", description: "The model already knows enough to handle this well." },
      {
        value: "yes_needs_current_or_external_data",
        label: "Yes, it needs current or external data",
        description: "It needs to pull in information the base model doesn't already have.",
      },
    ],
  },
];

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<AiAgentDesignerInput>; error: string | null }
  | { phase: "result"; result: AiAgentDesignerResult };

type Action =
  | { type: "begin" }
  | { type: "select"; key: StepKey; value: string }
  | { type: "next" }
  | { type: "back" }
  | { type: "restart" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "begin":
      return { phase: "question", stepIndex: 0, answers: {}, error: null };
    case "restart":
      return { phase: "start" };
    case "select": {
      if (state.phase !== "question") return state;
      return { ...state, answers: { ...state.answers, [action.key]: action.value }, error: null };
    }
    case "back": {
      if (state.phase !== "question" || state.stepIndex === 0) return state;
      return { ...state, stepIndex: state.stepIndex - 1, error: null };
    }
    case "next": {
      if (state.phase !== "question") return state;
      const step = STEPS[state.stepIndex]!;
      if (!state.answers[step.key]) {
        return { ...state, error: "Choose an option to continue." };
      }
      if (state.stepIndex < STEPS.length - 1) {
        return { ...state, stepIndex: state.stepIndex + 1, error: null };
      }
      // Last step answered — validate and run the deterministic recommendation.
      const definition = getToolDefinition("ai-agent-designer");
      const parsed = definition.inputSchema.safeParse(state.answers);
      if (!parsed.success) {
        return { ...state, error: "Something's missing — please check every question was answered." };
      }
      const result = definition.run(parsed.data) as AiAgentDesignerResult;
      return { phase: "result", result };
    }
    default:
      return state;
  }
}

export function AiAgentDesignerRunner() {
  const [state, dispatch] = useReducer(reducer, { phase: "start" });
  const errorRegionId = useId();
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  const currentStep = state.phase === "question" ? STEPS[state.stepIndex] : undefined;
  const selectedValue = currentStep && state.phase === "question" ? state.answers[currentStep.key] : undefined;

  const progressLabel = useMemo(() => {
    if (state.phase !== "question") return null;
    return `Question ${state.stepIndex + 1} of ${STEPS.length}`;
  }, [state]);

  if (state.phase === "start") {
    return (
      <div className="rounded-md border border-ink-200 bg-paper-raised p-6">
        <h2 className="text-lg font-semibold text-ink-900">Before you start</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-700">
          <li>Takes about 3 minutes — answer with a specific AI feature or task in mind.</li>
          <li>Nothing is saved or sent anywhere — this runs entirely in your browser.</li>
          <li>You&apos;ll get a recommended architecture — or told you don&apos;t need an agent at all.</li>
        </ul>
        <button
          type="button"
          onClick={() => dispatch({ type: "begin" })}
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          Start the questionnaire
        </button>
      </div>
    );
  }

  if (state.phase === "question" && currentStep) {
    return (
      <div className="rounded-md border border-ink-200 bg-paper-raised p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500" aria-current="step">
          {progressLabel}
        </p>
        <fieldset className="mt-3">
          <legend className="text-lg font-semibold text-ink-900">{currentStep.legend}</legend>
          {currentStep.hint ? <p className="mt-1 text-sm text-ink-500">{currentStep.hint}</p> : null}
          <div className="mt-4 space-y-2">
            {currentStep.options.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-ink-200 p-3 hover:border-brand-500 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-100"
              >
                <input
                  type="radio"
                  name={currentStep.key}
                  value={option.value}
                  checked={selectedValue === option.value}
                  onChange={() => dispatch({ type: "select", key: currentStep.key, value: option.value })}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium text-ink-900">{option.label}</span>
                  <span className="block text-sm text-ink-500">{option.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {state.error ? (
          <p id={errorRegionId} role="alert" aria-live="polite" className="mt-4 text-sm font-medium text-red-700">
            {state.error}
          </p>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => dispatch({ type: "back" })}
            disabled={state.stepIndex === 0}
            className="inline-flex min-h-11 items-center rounded-md border border-ink-200 px-4 text-sm font-medium text-ink-900 hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "next" })}
            aria-describedby={state.error ? errorRegionId : undefined}
            className="inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-focus-ring"
          >
            {state.stepIndex === STEPS.length - 1 ? "See my recommendation" : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "result") {
    return <AiAgentDesignerResultSummary result={state.result} onRestart={() => dispatch({ type: "restart" })} headingRef={resultHeadingRef} />;
  }

  return null;
}
