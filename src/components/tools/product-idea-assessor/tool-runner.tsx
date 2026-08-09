"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import type {
  BehaviourEvidence,
  Classification,
  DifferentiationClarity,
  ProblemEvidence,
  ProductIdeaAssessorInput,
  ProductIdeaAssessorResult,
  TargetSpecificity,
} from "@/lib/tools/product-idea-assessor/schema";
import { ToolResultSummary } from "@/components/tools/tool-result-summary";

type StepKey = "classification" | "problemEvidence" | "behaviourEvidence" | "differentiationClarity" | "targetSpecificity";

type Step = {
  key: StepKey;
  legend: string;
  hint?: string;
  options: { value: string; label: string; description: string }[];
};

const STEPS: Step[] = [
  {
    key: "classification",
    legend: "How would you classify this idea?",
    hint: "See the Product Idea Assessor guide if you're not sure which category fits.",
    options: [
      {
        value: "copy" satisfies Classification,
        label: "Copy",
        description: "A working model, applied to a new context (geography, niche or segment).",
      },
      {
        value: "improve" satisfies Classification,
        label: "Improve",
        description: "A specific, articulable improvement on an existing, working approach.",
      },
      {
        value: "differentiate" satisfies Classification,
        label: "Differentiate",
        description: "Asking people to adopt a genuinely new behaviour, not a better version of an old one.",
      },
    ],
  },
  {
    key: "problemEvidence",
    legend: "How much evidence do you have that the problem itself is real?",
    options: [
      { value: "assumed" satisfies ProblemEvidence, label: "Assumed", description: "I'm assuming it's real — I haven't checked." },
      {
        value: "some_conversations" satisfies ProblemEvidence,
        label: "Some conversations",
        description: "I've had some conversations that suggest it's real.",
      },
      { value: "validated" satisfies ProblemEvidence, label: "Validated", description: "I've confirmed the problem is real and painful." },
    ],
  },
  {
    key: "behaviourEvidence",
    legend: "Is anyone already trying to solve this problem for themselves?",
    options: [
      { value: "none" satisfies BehaviourEvidence, label: "No sign of it", description: "No evidence anyone is already trying." },
      { value: "anecdotal" satisfies BehaviourEvidence, label: "Anecdotal", description: "A few anecdotes of people mentioning it." },
      {
        value: "observed" satisfies BehaviourEvidence,
        label: "Observed",
        description: "I've seen people actually doing this, even informally.",
      },
      {
        value: "committed" satisfies BehaviourEvidence,
        label: "Committed",
        description: "Someone has committed real time, money or effort to a workaround.",
      },
    ],
  },
  {
    key: "differentiationClarity",
    legend: "How clear is the specific improvement your idea makes?",
    hint: "Most relevant for Improve ideas, but worth answering honestly either way.",
    options: [
      { value: "unclear" satisfies DifferentiationClarity, label: "Unclear", description: "I haven't pinned down exactly what's better." },
      { value: "some" satisfies DifferentiationClarity, label: "Some clarity", description: "I have a rough idea of the improvement." },
      {
        value: "clear" satisfies DifferentiationClarity,
        label: "Clear",
        description: "I can state the specific improvement in one sentence.",
      },
    ],
  },
  {
    key: "targetSpecificity",
    legend: "How specific is your target user?",
    options: [
      { value: "broad" satisfies TargetSpecificity, label: "Broad", description: "e.g. \"small businesses\" or \"busy people\"." },
      {
        value: "somewhat_specific" satisfies TargetSpecificity,
        label: "Somewhat specific",
        description: "I've narrowed it down somewhat.",
      },
      {
        value: "specific" satisfies TargetSpecificity,
        label: "Specific",
        description: "I could name ten real people who fit the description.",
      },
    ],
  },
];

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<ProductIdeaAssessorInput>; error: string | null }
  | { phase: "result"; result: ProductIdeaAssessorResult };

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
      // Last step answered — validate and run the deterministic scoring.
      const definition = getToolDefinition("product-idea-assessor");
      const parsed = definition.inputSchema.safeParse(state.answers);
      if (!parsed.success) {
        return { ...state, error: "Something's missing — please check every question was answered." };
      }
      const result = definition.run(parsed.data) as ProductIdeaAssessorResult;
      return { phase: "result", result };
    }
    default:
      return state;
  }
}

export function ProductIdeaAssessorRunner() {
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
          <li>Takes about 5–10 minutes — five questions, answered honestly.</li>
          <li>Nothing is saved or sent anywhere — this runs entirely in your browser.</li>
          <li>You&apos;ll get a scored readiness verdict and one concrete next action.</li>
        </ul>
        <button
          type="button"
          onClick={() => dispatch({ type: "begin" })}
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          Start the assessment
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
            {state.stepIndex === STEPS.length - 1 ? "See my result" : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "result") {
    return <ToolResultSummary result={state.result} onRestart={() => dispatch({ type: "restart" })} headingRef={resultHeadingRef} />;
  }

  return null;
}
