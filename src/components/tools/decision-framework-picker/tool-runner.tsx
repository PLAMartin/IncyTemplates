"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import type { DecisionFrameworkPickerInput, DecisionFrameworkPickerResult } from "@/lib/tools/decision-framework-picker/schema";
import { DecisionFrameworkPickerResultSummary } from "@/components/tools/decision-framework-picker/tool-result-summary";
import { decisionFrameworkPickerCopySchema } from "@/lib/tools/decision-framework-picker/copy";
import { resolveToolCopy } from "@/lib/tools/copy";

type StepKey = "involvement" | "decisionShape" | "precedent" | "timeWorthInvesting";

type Step = {
  key: StepKey;
  legend: string;
  hint?: string;
  options: { value: string; label: string; description: string }[];
};

function buildSteps(copy: Record<string, string>): Step[] {
  return [
    {
      key: "involvement",
      legend: copy.q_involvement_legend!,
      options: [
        { value: "just_me", label: "Just me", description: "I'm the one making this call." },
        {
          value: "multiple_people_or_perspectives_needed",
          label: "Multiple people or perspectives",
          description: "Other people are involved, or the situation genuinely has several valid angles.",
        },
      ],
    },
    {
      key: "decisionShape",
      legend: copy.q_decision_shape_legend!,
      options: [
        {
          value: "sequence_of_options",
          label: "A sequence of options",
          description: "I'm reviewing candidates one at a time — e.g. hiring, house-hunting — and need to know when to stop.",
        },
        {
          value: "one_decision_to_reason_through",
          label: "One decision to reason through",
          description: "There's a single specific choice I need to think through carefully.",
        },
        {
          value: "small_frequent_choice",
          label: "A small, frequent choice",
          description: "This kind of low-stakes decision comes up often.",
        },
      ],
    },
    {
      key: "precedent",
      legend: copy.q_precedent_legend!,
      options: [
        { value: "clear_precedent_to_copy", label: "Yes, a clear precedent", description: "Others have solved something like this before, in a way I could adapt." },
        { value: "no_clear_precedent", label: "No clear precedent", description: "This doesn't map cleanly onto anything I've seen done before." },
      ],
    },
    {
      key: "timeWorthInvesting",
      legend: copy.q_time_worth_investing_legend!,
      hint: copy.q_time_worth_investing_hint || undefined,
      options: [
        { value: "worth_real_time_and_thought", label: "Worth real time", description: "The stakes justify sitting down and thinking it through properly." },
        { value: "not_worth_much_time", label: "Not worth much time", description: "A quick call is genuinely fine here." },
      ],
    },
  ];
}

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<DecisionFrameworkPickerInput>; error: string | null }
  | { phase: "result"; result: DecisionFrameworkPickerResult };

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
        const definition = getToolDefinition("decision-framework-picker");
        const parsed = definition.inputSchema.safeParse(state.answers);
        if (!parsed.success) {
          return { ...state, error: "Something's missing — please check every question was answered." };
        }
        const result = definition.run(parsed.data) as DecisionFrameworkPickerResult;
        return { phase: "result", result };
      }
      default:
        return state;
    }
  };
}

export function DecisionFrameworkPickerRunner({ copy: copyOverrides }: { copy?: Record<string, string> }) {
  const copy = useMemo(() => resolveToolCopy(decisionFrameworkPickerCopySchema, copyOverrides), [copyOverrides]);
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
      <DecisionFrameworkPickerResultSummary
        result={state.result}
        onRestart={() => dispatch({ type: "restart" })}
        headingRef={resultHeadingRef}
        copy={copy}
      />
    );
  }

  return null;
}
