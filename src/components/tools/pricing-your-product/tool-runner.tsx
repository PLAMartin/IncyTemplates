"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import { pricingYourProductCopySchema } from "@/lib/tools/pricing-your-product/copy";
import { resolveToolCopy } from "@/lib/tools/copy";
import type { PricingYourProductInput, PricingYourProductResult } from "@/lib/tools/pricing-your-product/schema";
import { PricingYourProductResultSummary } from "@/components/tools/pricing-your-product/tool-result-summary";

type StepKey = "purchasePattern" | "valueMetric" | "customerType" | "priceVisibility";

type Step = {
  key: StepKey;
  legend: string;
  hint?: string;
  options: { value: string; label: string; description: string }[];
};

function buildSteps(copy: Record<string, string>): Step[] {
  return [
    {
      key: "purchasePattern",
      legend: copy.q_purchase_pattern_legend!,
      hint: copy.q_purchase_pattern_hint || undefined,
      options: [
        { value: "ongoing", label: "Ongoing", description: "They'll keep getting value from it over weeks or months." },
        { value: "one_off", label: "One-off", description: "It solves one job and then they're done." },
      ],
    },
    {
      key: "valueMetric",
      legend: copy.q_value_metric_legend!,
      hint: copy.q_value_metric_hint || undefined,
      options: [
        { value: "clear", label: "Clear", description: "There's an obvious unit — seats, calls, projects — that tracks how much value someone gets." },
        { value: "somewhat", label: "Somewhat", description: "There's a rough unit, but it's not a clean, obvious one." },
        { value: "none", label: "None", description: "Value doesn't scale with any countable unit — it's roughly the same for everyone." },
      ],
    },
    {
      key: "customerType",
      legend: copy.q_customer_type_legend!,
      hint: copy.q_customer_type_hint || undefined,
      options: [
        { value: "individual", label: "Individual", description: "A single person buying for themselves." },
        { value: "small_business", label: "Small business", description: "A small team or business making the call." },
        { value: "enterprise", label: "Enterprise", description: "A larger organisation with a formal buying process." },
      ],
    },
    {
      key: "priceVisibility",
      legend: copy.q_price_visibility_legend!,
      hint: copy.q_price_visibility_hint || undefined,
      options: [
        { value: "highly_visible", label: "Highly visible", description: "Competitor prices are public and easy to compare directly." },
        { value: "not_visible", label: "Not visible", description: "There's no direct, easy comparison — pricing isn't transparent or competitors aren't obvious." },
      ],
    },
  ];
}

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<PricingYourProductInput>; error: string | null }
  | { phase: "result"; result: PricingYourProductResult };

type Action =
  | { type: "begin" }
  | { type: "select"; key: StepKey; value: string }
  | { type: "next" }
  | { type: "back" }
  | { type: "restart" };

function createReducer(steps: Step[], errors: { chooseOption: string; missing: string }) {
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
          return { ...state, error: errors.chooseOption };
        }
        if (state.stepIndex < steps.length - 1) {
          return { ...state, stepIndex: state.stepIndex + 1, error: null };
        }
        // Last step answered — validate and run the deterministic scoring.
        const definition = getToolDefinition("pricing-your-product");
        const parsed = definition.inputSchema.safeParse(state.answers);
        if (!parsed.success) {
          return { ...state, error: errors.missing };
        }
        const result = definition.run(parsed.data) as PricingYourProductResult;
        return { phase: "result", result };
      }
      default:
        return state;
    }
  };
}

export function PricingYourProductRunner({ copy: copyOverrides }: { copy?: Record<string, string> }) {
  const copy = useMemo(() => resolveToolCopy(pricingYourProductCopySchema, copyOverrides), [copyOverrides]);
  const steps = useMemo(() => buildSteps(copy), [copy]);
  const [state, dispatch] = useReducer(
    createReducer(steps, { chooseOption: copy.error_choose_option!, missing: copy.error_missing! }),
    { phase: "start" },
  );
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
            {copy.back_button}
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "next" })}
            aria-describedby={state.error ? errorRegionId : undefined}
            className="inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-focus-ring"
          >
            {state.stepIndex === steps.length - 1 ? copy.final_step_button : copy.continue_button}
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "result") {
    return (
      <PricingYourProductResultSummary
        result={state.result}
        onRestart={() => dispatch({ type: "restart" })}
        headingRef={resultHeadingRef}
        copy={copy}
      />
    );
  }

  return null;
}
