"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import type { BusinessModelChooserInput, BusinessModelChooserResult } from "@/lib/tools/business-model-chooser/schema";
import { BusinessModelChooserResultSummary } from "@/components/tools/business-model-chooser/tool-result-summary";
import { businessModelChooserCopySchema } from "@/lib/tools/business-model-chooser/copy";
import { resolveToolCopy } from "@/lib/tools/copy";

type StepKey = "audienceStructure" | "payer" | "valueDeliveryPattern" | "growthLever";

type Step = {
  key: StepKey;
  legend: string;
  hint?: string;
  options: { value: string; label: string; description: string }[];
};

function buildSteps(copy: Record<string, string>): Step[] {
  return [
  {
    key: "audienceStructure",
    legend: copy.q_audience_structure_legend!,
    hint: copy.q_audience_structure_hint || undefined,
    options: [
      { value: "two_sided", label: "Two-sided", description: "It connects distinct kinds of users who need each other — e.g. buyers and sellers." },
      { value: "one_sided", label: "One-sided", description: "It serves one kind of user directly." },
    ],
  },
  {
    key: "payer",
    legend: copy.q_payer_legend!,
    hint: copy.q_payer_hint || undefined,
    options: [
      { value: "end_user_directly", label: "The end user, directly", description: "The person using the product pays you, on an ongoing basis." },
      { value: "a_third_party", label: "A third party", description: "Someone other than the end user pays — e.g. an advertiser." },
      {
        value: "whoever_initiates_a_transaction",
        label: "Whoever initiates a transaction",
        description: "You take a fee from each transaction that happens on your product.",
      },
    ],
  },
  {
    key: "valueDeliveryPattern",
    legend: copy.q_value_delivery_pattern_legend!,
    hint: copy.q_value_delivery_pattern_hint || undefined,
    options: [
      { value: "ongoing_access", label: "Ongoing access", description: "Value is delivered continuously, e.g. software people keep using." },
      { value: "discrete_transactions", label: "Discrete transactions", description: "Value is delivered each time a specific transaction completes." },
    ],
  },
  {
    key: "growthLever",
    legend: copy.q_growth_lever_legend!,
    hint: copy.q_growth_lever_hint || undefined,
    options: [
      {
        value: "self_serve_or_sales_led",
        label: "Self-serve or sales-led",
        description: "People sign themselves up, or you sell to them directly.",
      },
      {
        value: "network_effects",
        label: "Network effects",
        description: "More users on one side attract more users on the other.",
      },
      {
        value: "audience_scale",
        label: "Audience scale",
        description: "You need a large, engaged audience before it's worth anything.",
      },
    ],
  },
  ];
}

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<BusinessModelChooserInput>; error: string | null }
  | { phase: "result"; result: BusinessModelChooserResult };

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
      const definition = getToolDefinition("business-model-chooser");
      const parsed = definition.inputSchema.safeParse(state.answers);
      if (!parsed.success) {
        return { ...state, error: "Something's missing — please check every question was answered." };
      }
      const result = definition.run(parsed.data) as BusinessModelChooserResult;
      return { phase: "result", result };
    }
    default:
      return state;
  }
  };
}

export function BusinessModelChooserRunner({ copy: copyOverrides }: { copy?: Record<string, string> }) {
  const copy = useMemo(() => resolveToolCopy(businessModelChooserCopySchema, copyOverrides), [copyOverrides]);
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
    return (
      <BusinessModelChooserResultSummary result={state.result} onRestart={() => dispatch({ type: "restart" })} headingRef={resultHeadingRef} />
    );
  }

  return null;
}
