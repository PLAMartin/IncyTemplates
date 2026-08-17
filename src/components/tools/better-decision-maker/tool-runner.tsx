"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import type {
  BetterDecisionMakerInput,
  BetterDecisionMakerResult,
  Effort,
  Impact,
  Likelihood,
  Reversibility,
} from "@/lib/tools/better-decision-maker/schema";
import { BetterDecisionMakerResultSummary } from "@/components/tools/better-decision-maker/tool-result-summary";
import { betterDecisionMakerCopySchema } from "@/lib/tools/better-decision-maker/copy";
import { resolveToolCopy } from "@/lib/tools/copy";

type StepKey =
  | "optionALikelihood"
  | "optionAImpact"
  | "optionAEffort"
  | "optionAReversibility"
  | "optionBLikelihood"
  | "optionBImpact"
  | "optionBEffort"
  | "optionBReversibility";

type Step = {
  key: StepKey;
  legend: string;
  hint?: string;
  options: { value: string; label: string; description: string }[];
};

const LIKELIHOOD_OPTIONS = [
  { value: "low" satisfies Likelihood, label: "Low", description: "I'd be surprised if this worked out." },
  { value: "medium" satisfies Likelihood, label: "Medium", description: "Could go either way." },
  { value: "high" satisfies Likelihood, label: "High", description: "I'd be surprised if this didn't work out." },
];

const IMPACT_OPTIONS = [
  { value: "small" satisfies Impact, label: "Small", description: "A modest improvement if it works." },
  { value: "moderate" satisfies Impact, label: "Moderate", description: "A meaningful improvement if it works." },
  { value: "large" satisfies Impact, label: "Large", description: "A genuinely significant improvement if it works." },
];

const EFFORT_OPTIONS = [
  { value: "low" satisfies Effort, label: "Low", description: "Cheap and quick to attempt." },
  { value: "medium" satisfies Effort, label: "Medium", description: "A real but manageable investment." },
  { value: "high" satisfies Effort, label: "High", description: "A significant investment of time or money." },
];

const REVERSIBILITY_OPTIONS = [
  {
    value: "two_way_door" satisfies Reversibility,
    label: "Two-way door",
    description: "Easy to back out of and try something else if it's wrong.",
  },
  {
    value: "one_way_door" satisfies Reversibility,
    label: "One-way door",
    description: "Hard or costly to reverse once committed.",
  },
];

function optionSteps(option: "A" | "B", copy: Record<string, string>): Step[] {
  const prefix = `Option ${option}:`;
  return [
    {
      key: (option === "A" ? "optionALikelihood" : "optionBLikelihood") as StepKey,
      legend: `${prefix} ${copy.q_likelihood_legend}`,
      options: LIKELIHOOD_OPTIONS,
    },
    {
      key: (option === "A" ? "optionAImpact" : "optionBImpact") as StepKey,
      legend: `${prefix} ${copy.q_impact_legend}`,
      options: IMPACT_OPTIONS,
    },
    {
      key: (option === "A" ? "optionAEffort" : "optionBEffort") as StepKey,
      legend: `${prefix} ${copy.q_effort_legend}`,
      options: EFFORT_OPTIONS,
    },
    {
      key: (option === "A" ? "optionAReversibility" : "optionBReversibility") as StepKey,
      legend: `${prefix} ${copy.q_reversibility_legend}`,
      hint: copy.q_reversibility_hint || undefined,
      options: REVERSIBILITY_OPTIONS,
    },
  ];
}

function buildSteps(copy: Record<string, string>): Step[] {
  return [...optionSteps("A", copy), ...optionSteps("B", copy)];
}

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<BetterDecisionMakerInput>; error: string | null }
  | { phase: "result"; result: BetterDecisionMakerResult };

type Action =
  | { type: "begin" }
  | { type: "select"; key: StepKey; value: string }
  | { type: "next" }
  | { type: "back" }
  | { type: "restart" };

function createReducer(steps: Step[]) {
  return function reducer(state: State, action: Action): State {
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
      const step = steps[state.stepIndex]!;
      if (!state.answers[step.key]) {
        return { ...state, error: "Choose an option to continue." };
      }
      if (state.stepIndex < steps.length - 1) {
        return { ...state, stepIndex: state.stepIndex + 1, error: null };
      }
      // Last step answered — validate and run the deterministic scoring.
      const definition = getToolDefinition("better-decision-maker");
      const parsed = definition.inputSchema.safeParse(state.answers);
      if (!parsed.success) {
        return { ...state, error: "Something's missing — please check every question was answered." };
      }
      const result = definition.run(parsed.data) as BetterDecisionMakerResult;
      return { phase: "result", result };
    }
    default:
      return state;
  }
  };
}

export function BetterDecisionMakerRunner({ copy: copyOverrides }: { copy?: Record<string, string> }) {
  const copy = useMemo(() => resolveToolCopy(betterDecisionMakerCopySchema, copyOverrides), [copyOverrides]);
  const steps = useMemo(() => buildSteps(copy), [copy]);
  const [state, dispatch] = useReducer(createReducer(steps), { phase: "start" });
  const errorRegionId = useId();
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  const currentStep = state.phase === "question" ? steps[state.stepIndex] : undefined;
  const selectedValue = currentStep && state.phase === "question" ? state.answers[currentStep.key] : undefined;

  const progressLabel = useMemo(() => {
    if (state.phase !== "question") return null;
    return `Question ${state.stepIndex + 1} of ${steps.length}`;
  }, [state, steps.length]);

  if (state.phase === "start") {
    return (
      <div className="rounded-md border border-ink-200 bg-paper-raised p-6">
        <h2 className="text-lg font-semibold text-ink-900">{copy.intro_heading}</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-700">
          <li>{copy.intro_bullet_1}</li>
          <li>{copy.intro_bullet_2}</li>
          <li>{copy.intro_bullet_3}</li>
        </ul>
        <button
          type="button"
          onClick={() => dispatch({ type: "begin" })}
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          {copy.intro_cta}
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
            {state.stepIndex === steps.length - 1 ? "See my result" : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "result") {
    return <BetterDecisionMakerResultSummary result={state.result} onRestart={() => dispatch({ type: "restart" })} headingRef={resultHeadingRef} />;
  }

  return null;
}
