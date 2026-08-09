"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { outcomeForFrameworkSlug, resolveNextStep } from "@/lib/finder";
import type { FinderFrameworkOption, FinderInput, FinderResult, Outcome, OutputPreference, Progress } from "@/lib/finder";
import type { ProductSummary } from "@/types/catalogue";
import { FinderResultSummary } from "@/components/finder/finder-result-summary";

type StepKey = "outcome" | "progress" | "outputPreference";

type Step = {
  key: StepKey;
  legend: string;
  hint?: string;
  options: { value: string; label: string; description: string }[];
};

const PROGRESS_OPTIONS: Step["options"] = [
  { value: "nothing_yet" satisfies Progress, label: "Nothing yet", description: "I'm just starting to think about this." },
  {
    value: "some_thinking_or_evidence" satisfies Progress,
    label: "Some thinking or evidence",
    description: "I've made a start, but haven't got a clear result yet.",
  },
  {
    value: "clear_decision_or_scope" satisfies Progress,
    label: "A clear decision or scope already",
    description: "I've got something concrete to work from.",
  },
];

const OUTPUT_PREFERENCE_OPTIONS: Step["options"] = [
  { value: "learn" satisfies OutputPreference, label: "Learn the method first", description: "Give me the Guide." },
  {
    value: "structure_it_myself" satisfies OutputPreference,
    label: "Structure the work myself",
    description: "Give me the Template.",
  },
  {
    value: "interactive_result" satisfies OutputPreference,
    label: "Get an interactive result",
    description: "Give me the Tool.",
  },
  { value: "no_preference" satisfies OutputPreference, label: "No preference", description: "You decide, based on my previous answer." },
];

function buildSteps(frameworkOptions: FinderFrameworkOption[]): Step[] {
  const outcomeOptions = frameworkOptions
    .map((framework) => {
      const outcome = outcomeForFrameworkSlug(framework.slug);
      if (!outcome) return null;
      return { value: outcome, label: framework.name, description: framework.outcomeStatement };
    })
    .filter((option): option is { value: Outcome; label: string; description: string } => option !== null);

  outcomeOptions.push({
    value: "not_sure",
    label: "Not sure yet",
    description: "Point me at a sensible place to start.",
  });

  return [
    { key: "outcome", legend: "What do you need to do next?", options: outcomeOptions },
    { key: "progress", legend: "How much have you already done on this?", options: PROGRESS_OPTIONS },
    {
      key: "outputPreference",
      legend: "Do you want to learn, structure the work, or get an interactive result?",
      hint: "Pick 'no preference' if you're not sure — your previous answer already gives us a good guess.",
      options: OUTPUT_PREFERENCE_OPTIONS,
    },
  ];
}

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<FinderInput>; error: string | null }
  | { phase: "result"; result: FinderResult };

type Action =
  | { type: "begin" }
  | { type: "select"; key: StepKey; value: string }
  | { type: "next" }
  | { type: "back" }
  | { type: "restart" };

function reducer(steps: Step[], frameworkOptions: FinderFrameworkOption[]) {
  return (state: State, action: Action): State => {
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
        // Last step answered — every FinderInput field is now present.
        const result = resolveNextStep(state.answers as FinderInput, frameworkOptions);
        if (!result) {
          return { ...state, error: "Something went wrong working out a recommendation — please try again." };
        }
        return { phase: "result", result };
      }
      default:
        return state;
    }
  };
}

export function FinderRunner({
  frameworkOptions,
  outputsByFramework,
}: {
  frameworkOptions: FinderFrameworkOption[];
  outputsByFramework: ProductSummary[];
}) {
  const steps = useMemo(() => buildSteps(frameworkOptions), [frameworkOptions]);
  const [state, dispatch] = useReducer(reducer(steps, frameworkOptions), { phase: "start" });
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
        <h2 className="text-lg font-semibold text-ink-900">Before you start</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-700">
          <li>Takes about 2 minutes — three quick questions.</li>
          <li>Nothing is saved or sent anywhere — this runs entirely in your browser.</li>
          <li>You&apos;ll get a recommended product family, output and up to two next steps.</li>
        </ul>
        <button
          type="button"
          onClick={() => dispatch({ type: "begin" })}
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          Find my next step
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
            {state.stepIndex === steps.length - 1 ? "See my recommendation" : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "result") {
    return (
      <FinderResultSummary
        result={state.result}
        frameworkOptions={frameworkOptions}
        outputsByFramework={outputsByFramework}
        onRestart={() => dispatch({ type: "restart" })}
        headingRef={resultHeadingRef}
      />
    );
  }

  return null;
}
