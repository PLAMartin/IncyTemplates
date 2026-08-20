"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import { customerDemandTestCopySchema } from "@/lib/tools/customer-demand-test/copy";
import { resolveToolCopy } from "@/lib/tools/copy";
import type { CustomerDemandTestInput, CustomerDemandTestResult } from "@/lib/tools/customer-demand-test/schema";
import { CustomerDemandTestResultSummary } from "@/components/tools/customer-demand-test/tool-result-summary";
import { RecordProgressCompletion } from "@/components/collections/record-progress";
import { trackEvent } from "@/lib/analytics/track";

type StepKey = "explainability" | "manualFulfilment" | "existingPlatform" | "reachNeeded";

type Step = {
  key: StepKey;
  legend: string;
  hint?: string;
  options: { value: string; label: string; description: string }[];
};

function buildSteps(copy: Record<string, string>): Step[] {
  return [
    {
      key: "explainability",
      legend: copy.q_explainability_legend!,
      options: [
        { value: "easy_to_explain_in_words", label: "Easy to explain in words", description: "A sentence or two is enough for people to get it." },
        { value: "needs_a_demo_to_click", label: "Needs a demo to click", description: "People need to see it working before it makes sense." },
      ],
    },
    {
      key: "manualFulfilment",
      legend: copy.q_manual_fulfilment_legend!,
      options: [
        { value: "could_fulfil_manually", label: "Yes, I could fulfil it manually", description: "I could do the work myself for a small number of people." },
        { value: "cant_fake_it_manually", label: "No, not practical to fake manually", description: "The value only really works once it's actually built." },
      ],
    },
    {
      key: "existingPlatform",
      legend: copy.q_existing_platform_legend!,
      options: [
        { value: "yes_fits_an_existing_platform", label: "Yes, an existing platform fits", description: "e.g. Amazon, Etsy, Airbnb, or wherever they already look." },
        { value: "no_need_my_own_channel", label: "No, I'd need my own page or channel", description: "There's no existing place this naturally fits." },
      ],
    },
    {
      key: "reachNeeded",
      legend: copy.q_reach_needed_legend!,
      hint: copy.q_reach_needed_hint || undefined,
      options: [
        { value: "a_handful_of_real_users", label: "A handful of real users", description: "Deep engagement from a few people would tell me enough." },
        { value: "as_wide_as_possible", label: "As wide as possible", description: "I need a broader signal to trust it." },
      ],
    },
  ];
}

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<CustomerDemandTestInput>; error: string | null }
  | { phase: "result"; result: CustomerDemandTestResult };

type Action =
  | { type: "begin" }
  | { type: "select"; key: StepKey; value: string }
  | { type: "next" }
  | { type: "back" }
  | { type: "restart" };

function createReducer(steps: Step[], chooseOptionError: string) {
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
          return { ...state, error: chooseOptionError };
        }
        if (state.stepIndex < steps.length - 1) {
          return { ...state, stepIndex: state.stepIndex + 1, error: null };
        }
        // Last step answered — validate and run the deterministic scoring.
        const definition = getToolDefinition("customer-demand-test");
        const parsed = definition.inputSchema.safeParse(state.answers);
        if (!parsed.success) {
          return { ...state, error: "Something's missing — please check every question was answered." };
        }
        const result = definition.run(parsed.data) as CustomerDemandTestResult;
        return { phase: "result", result };
      }
      default:
        return state;
    }
  };
}

export function CustomerDemandTestRunner({ copy: copyOverrides }: { copy?: Record<string, string> }) {
  const copy = useMemo(() => resolveToolCopy(customerDemandTestCopySchema, copyOverrides), [copyOverrides]);
  const steps = useMemo(() => buildSteps(copy), [copy]);
  const [state, dispatch] = useReducer(createReducer(steps, copy.choose_option_error!), { phase: "start" });
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
          onClick={() => {
            trackEvent("start_tool", { framework_slug: "customer-demand-test" });
            dispatch({ type: "begin" });
          }}
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
            {copy.back_label}
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "next" })}
            aria-describedby={state.error ? errorRegionId : undefined}
            className="inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-focus-ring"
          >
            {state.stepIndex === steps.length - 1 ? copy.see_result_label : copy.continue_label}
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "result") {
    return (
      <div className="space-y-4">
        <RecordProgressCompletion collectionSlug="start-a-product" frameworkSlug="customer-demand-test" outputType="tool" />
        <CustomerDemandTestResultSummary
          result={state.result}
          onRestart={() => dispatch({ type: "restart" })}
          headingRef={resultHeadingRef}
          copy={copy}
        />
      </div>
    );
  }

  return null;
}
