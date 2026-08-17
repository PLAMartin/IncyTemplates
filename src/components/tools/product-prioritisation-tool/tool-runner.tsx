"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import { productPrioritisationToolCopySchema } from "@/lib/tools/product-prioritisation-tool/copy";
import { resolveToolCopy } from "@/lib/tools/copy";
import type { ProductPrioritisationToolInput, ProductPrioritisationToolResult } from "@/lib/tools/product-prioritisation-tool/schema";
import { ProductPrioritisationToolResultSummary } from "@/components/tools/product-prioritisation-tool/tool-result-summary";

type StepKey = "deadlines" | "everythingAchievable" | "valueVariation" | "whatWouldHelpMost";

type Step = {
  key: StepKey;
  legend: string;
  hint?: string;
  options: { value: string; label: string; description: string }[];
};

/** Legend/hint text comes from `copy` (admin-editable, spec §14.7.1); option label/description stay hardcoded (see this file's copy.ts doc comment). */
function buildSteps(copy: Record<string, string>): Step[] {
  return [
    {
      key: "deadlines",
      legend: copy.q_deadlines_legend!,
      hint: copy.q_deadlines_hint || undefined,
      options: [
        { value: "yes_hard_deadlines", label: "Yes, hard deadlines", description: "Missing a deadline has a real, specific cost." },
        { value: "no_flexible_timing", label: "No, timing is flexible", description: "There's no fixed date each task has to land by." },
      ],
    },
    {
      key: "everythingAchievable",
      legend: copy.q_everything_achievable_legend!,
      hint: copy.q_everything_achievable_hint || undefined,
      options: [
        { value: "yes_its_all_achievable", label: "Yes, it's all achievable", description: "With focus, I can get through everything on the list." },
        { value: "no_something_has_to_give", label: "No, something has to give", description: "I genuinely can't get to everything — some things will slip." },
      ],
    },
    {
      key: "valueVariation",
      legend: copy.q_value_variation_legend!,
      hint: copy.q_value_variation_hint || undefined,
      options: [
        { value: "yes_some_matter_much_more", label: "Yes, some matter much more", description: "A few tasks are far more valuable than the rest." },
        { value: "roughly_equally_important", label: "Roughly equally important", description: "The tasks are broadly similar in how much they matter." },
      ],
    },
    {
      key: "whatWouldHelpMost",
      legend: copy.q_what_would_help_most_legend!,
      hint: copy.q_what_would_help_most_hint || undefined,
      options: [
        { value: "momentum_and_fewer_open_tasks", label: "Momentum — fewer open tasks", description: "Clearing things off the list would help me most." },
        { value: "confidence_nothing_important_slips", label: "Confidence nothing important slips", description: "I need to know the things that matter are covered." },
      ],
    },
  ];
}

// Keys/order/length only — reducer logic doesn't need copy-driven legend/hint text.
const STEP_KEYS: StepKey[] = ["deadlines", "everythingAchievable", "valueVariation", "whatWouldHelpMost"];

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<ProductPrioritisationToolInput>; error: string | null }
  | { phase: "result"; result: ProductPrioritisationToolResult };

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
      const stepKey = STEP_KEYS[state.stepIndex]!;
      if (!state.answers[stepKey]) {
        return { ...state, error: "Choose an option to continue." };
      }
      if (state.stepIndex < STEP_KEYS.length - 1) {
        return { ...state, stepIndex: state.stepIndex + 1, error: null };
      }
      // Last step answered — validate and run the deterministic scoring.
      const definition = getToolDefinition("product-prioritisation-tool");
      const parsed = definition.inputSchema.safeParse(state.answers);
      if (!parsed.success) {
        return { ...state, error: "Something's missing — please check every question was answered." };
      }
      const result = definition.run(parsed.data) as ProductPrioritisationToolResult;
      return { phase: "result", result };
    }
    default:
      return state;
  }
}

export function ProductPrioritisationToolRunner({ copy: copyOverrides }: { copy?: Record<string, string> }) {
  const copy = useMemo(() => resolveToolCopy(productPrioritisationToolCopySchema, copyOverrides), [copyOverrides]);
  const steps = useMemo(() => buildSteps(copy), [copy]);
  const [state, dispatch] = useReducer(reducer, { phase: "start" });
  const errorRegionId = useId();
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  const currentStep = state.phase === "question" ? steps[state.stepIndex] : undefined;
  const selectedValue = currentStep && state.phase === "question" ? state.answers[currentStep.key] : undefined;

  const progressLabel = useMemo(() => {
    if (state.phase !== "question") return null;
    return `Question ${state.stepIndex + 1} of ${steps.length}`;
  }, [state, steps]);

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
      <ProductPrioritisationToolResultSummary result={state.result} onRestart={() => dispatch({ type: "restart" })} headingRef={resultHeadingRef} />
    );
  }

  return null;
}
