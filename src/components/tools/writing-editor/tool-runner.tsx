"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import { writingEditorCopySchema } from "@/lib/tools/writing-editor/copy";
import { resolveToolCopy } from "@/lib/tools/copy";
import type { WritingEditorInput, WritingEditorResult } from "@/lib/tools/writing-editor/schema";
import { WritingEditorResultSummary } from "@/components/tools/writing-editor/tool-result-summary";

type StepKey = "clichedLanguage" | "inflatedVocabulary" | "unnecessaryWords" | "passiveVoice" | "jargon";

type Step = {
  key: StepKey;
  legend: string;
  hint?: string;
  options: { value: string; label: string; description: string }[];
};

function buildSteps(copy: Record<string, string>): Step[] {
  return [
    {
      key: "clichedLanguage",
      legend: copy.q_cliched_legend!,
      options: [
        { value: "still_a_problem", label: "Yes, it still leans on some", description: "Overused phrases like \"tip of the iceberg\" made it in." },
        { value: "already_clean", label: "No, the language is fresh", description: "You've said things directly instead of reaching for a stock phrase." },
      ],
    },
    {
      key: "inflatedVocabulary",
      legend: copy.q_inflated_legend!,
      options: [
        { value: "still_a_problem", label: "Yes, some words are more formal than needed", description: "Words like \"utilise\" or \"facilitate\" made it in." },
        { value: "already_clean", label: "No, the words are already plain", description: "Short, everyday words throughout." },
      ],
    },
    {
      key: "unnecessaryWords",
      legend: copy.q_unnecessary_legend!,
      options: [
        { value: "still_a_problem", label: "Yes, there's room to trim", description: "Phrases like \"due to the fact that\" are still in there." },
        { value: "already_clean", label: "No, it's already tight", description: "Every word is earning its place." },
      ],
    },
    {
      key: "passiveVoice",
      legend: copy.q_passive_legend!,
      hint: copy.q_passive_hint || undefined,
      options: [
        { value: "still_a_problem", label: "Yes, some sentences are passive", description: "The subject doing the action isn't always clear or upfront." },
        { value: "already_clean", label: "No, it's already active", description: "Sentences say who did what." },
      ],
    },
    {
      key: "jargon",
      legend: copy.q_jargon_legend!,
      options: [
        { value: "still_a_problem", label: "Yes, some jargon is still in there", description: "Terms only insiders would recognise." },
        { value: "already_clean", label: "No, it's already plain English", description: "Anyone outside your field could follow it." },
      ],
    },
  ];
}

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<WritingEditorInput>; error: string | null }
  | { phase: "result"; result: WritingEditorResult };

type Action =
  | { type: "begin" }
  | { type: "select"; key: StepKey; value: string }
  | { type: "next" }
  | { type: "back" }
  | { type: "restart" };

function reducer(state: State, action: Action, steps: Step[], copy: Record<string, string>): State {
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
        return { ...state, error: copy.error_missing_answer! };
      }
      if (state.stepIndex < steps.length - 1) {
        return { ...state, stepIndex: state.stepIndex + 1, error: null };
      }
      // Last step answered — validate and run the deterministic review.
      const definition = getToolDefinition("writing-editor");
      const parsed = definition.inputSchema.safeParse(state.answers);
      if (!parsed.success) {
        return { ...state, error: copy.error_invalid! };
      }
      const result = definition.run(parsed.data) as WritingEditorResult;
      return { phase: "result", result };
    }
    default:
      return state;
  }
}

export function WritingEditorRunner({ copy: copyOverrides }: { copy?: Record<string, string> }) {
  const copy = useMemo(() => resolveToolCopy(writingEditorCopySchema, copyOverrides), [copyOverrides]);
  const steps = useMemo(() => buildSteps(copy), [copy]);
  const [state, dispatch] = useReducer((state: State, action: Action) => reducer(state, action, steps, copy), { phase: "start" });
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
            {copy.back_label}
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "next" })}
            aria-describedby={state.error ? errorRegionId : undefined}
            className="inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-focus-ring"
          >
            {state.stepIndex === steps.length - 1 ? copy.see_review_label : copy.continue_label}
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "result") {
    return <WritingEditorResultSummary result={state.result} onRestart={() => dispatch({ type: "restart" })} headingRef={resultHeadingRef} copy={copy} />;
  }

  return null;
}
