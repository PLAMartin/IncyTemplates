"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import type { ProductMarketFitTrackerInput, ProductMarketFitTrackerResult, Rating } from "@/lib/tools/product-market-fit-tracker/schema";
import { ProductMarketFitTrackerResultSummary } from "@/components/tools/product-market-fit-tracker/tool-result-summary";

type StepKey = "disappointmentSignal" | "retention" | "organicGrowth" | "referral" | "payingIntent";

type Step = {
  key: StepKey;
  legend: string;
  hint?: string;
  options: { value: string; label: string; description: string }[];
};

const STEPS: Step[] = [
  {
    key: "disappointmentSignal",
    legend: "How would your users feel if they could no longer use this product?",
    hint: "The Sean Ellis test — the single most reliable proxy for genuine product-market fit.",
    options: [
      { value: "low" satisfies Rating, label: "Low", description: "Most wouldn't care, or would easily find something else." },
      { value: "medium" satisfies Rating, label: "Medium", description: "Some would be disappointed, but most would manage without it." },
      { value: "high" satisfies Rating, label: "High", description: "Most would be genuinely disappointed to lose it." },
    ],
  },
  {
    key: "retention",
    legend: "Do people who try it keep coming back on their own?",
    options: [
      { value: "low" satisfies Rating, label: "Low", description: "Most drift away after the first use." },
      { value: "medium" satisfies Rating, label: "Medium", description: "Some come back, but it's inconsistent." },
      { value: "high" satisfies Rating, label: "High", description: "People keep coming back without being prompted." },
    ],
  },
  {
    key: "organicGrowth",
    legend: "Are new users arriving without you paying for them or personally chasing them?",
    options: [
      { value: "low" satisfies Rating, label: "Low", description: "Every new user comes from active, paid or manual effort." },
      { value: "medium" satisfies Rating, label: "Medium", description: "A mix — some organic, most still chased or paid for." },
      { value: "high" satisfies Rating, label: "High", description: "New users regularly show up on their own." },
    ],
  },
  {
    key: "referral",
    legend: "Are people recommending it to others without being asked?",
    options: [
      { value: "low" satisfies Rating, label: "Low", description: "Referrals are rare or non-existent." },
      { value: "medium" satisfies Rating, label: "Medium", description: "It happens sometimes, but not consistently." },
      { value: "high" satisfies Rating, label: "High", description: "People regularly bring others in unprompted." },
    ],
  },
  {
    key: "payingIntent",
    legend: "Would people actually pay for this — or are they already paying?",
    options: [
      { value: "low" satisfies Rating, label: "Low", description: "No sign anyone would pay for this." },
      { value: "medium" satisfies Rating, label: "Medium", description: "Some interest in paying, but nothing proven." },
      { value: "high" satisfies Rating, label: "High", description: "People are paying, or have clearly said they would." },
    ],
  },
];

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<ProductMarketFitTrackerInput>; error: string | null }
  | { phase: "result"; result: ProductMarketFitTrackerResult };

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
      const definition = getToolDefinition("product-market-fit-tracker");
      const parsed = definition.inputSchema.safeParse(state.answers);
      if (!parsed.success) {
        return { ...state, error: "Something's missing — please check every question was answered." };
      }
      const result = definition.run(parsed.data) as ProductMarketFitTrackerResult;
      return { phase: "result", result };
    }
    default:
      return state;
  }
}

export function ProductMarketFitTrackerRunner() {
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
          <li>Takes about 5 minutes — answer based on real users, not intentions.</li>
          <li>Nothing is saved or sent anywhere — this runs entirely in your browser.</li>
          <li>You&apos;ll get a fit score, a strongest and weakest signal, and one concrete next step.</li>
        </ul>
        <button
          type="button"
          onClick={() => dispatch({ type: "begin" })}
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          Start checking fit
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
    return <ProductMarketFitTrackerResultSummary result={state.result} onRestart={() => dispatch({ type: "restart" })} headingRef={resultHeadingRef} />;
  }

  return null;
}
