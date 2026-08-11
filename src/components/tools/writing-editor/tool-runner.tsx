"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import type { WritingEditorInput, WritingEditorResult } from "@/lib/tools/writing-editor/schema";
import { WritingEditorResultSummary } from "@/components/tools/writing-editor/tool-result-summary";

type StepKey = "clichedLanguage" | "inflatedVocabulary" | "unnecessaryWords" | "passiveVoice" | "jargon";

type Step = {
  key: StepKey;
  legend: string;
  hint?: string;
  options: { value: string; label: string; description: string }[];
};

const STEPS: Step[] = [
  {
    key: "clichedLanguage",
    legend: "Does your draft lean on any metaphors, similes or phrases you've seen in print before?",
    options: [
      { value: "still_a_problem", label: "Yes, it still leans on some", description: "Overused phrases like \"tip of the iceberg\" made it in." },
      { value: "already_clean", label: "No, the language is fresh", description: "You've said things directly instead of reaching for a stock phrase." },
    ],
  },
  {
    key: "inflatedVocabulary",
    legend: "Does it use long or formal words where a short one would do?",
    options: [
      { value: "still_a_problem", label: "Yes, some words are more formal than needed", description: "Words like \"utilise\" or \"facilitate\" made it in." },
      { value: "already_clean", label: "No, the words are already plain", description: "Short, everyday words throughout." },
    ],
  },
  {
    key: "unnecessaryWords",
    legend: "Could you cut words out without losing meaning?",
    options: [
      { value: "still_a_problem", label: "Yes, there's room to trim", description: "Phrases like \"due to the fact that\" are still in there." },
      { value: "already_clean", label: "No, it's already tight", description: "Every word is earning its place." },
    ],
  },
  {
    key: "passiveVoice",
    legend: "Does it use the passive voice where the active would work?",
    hint: "\"The meeting was led by Jane\" is passive. \"Jane led the meeting\" is active.",
    options: [
      { value: "still_a_problem", label: "Yes, some sentences are passive", description: "The subject doing the action isn't always clear or upfront." },
      { value: "already_clean", label: "No, it's already active", description: "Sentences say who did what." },
    ],
  },
  {
    key: "jargon",
    legend: "Does it use jargon, technical terms or foreign phrases an everyday reader wouldn't know?",
    options: [
      { value: "still_a_problem", label: "Yes, some jargon is still in there", description: "Terms only insiders would recognise." },
      { value: "already_clean", label: "No, it's already plain English", description: "Anyone outside your field could follow it." },
    ],
  },
];

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
      // Last step answered — validate and run the deterministic review.
      const definition = getToolDefinition("writing-editor");
      const parsed = definition.inputSchema.safeParse(state.answers);
      if (!parsed.success) {
        return { ...state, error: "Something's missing — please check every question was answered." };
      }
      const result = definition.run(parsed.data) as WritingEditorResult;
      return { phase: "result", result };
    }
    default:
      return state;
  }
}

export function WritingEditorRunner() {
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
          <li>Takes about 2 minutes — answer with a specific piece of writing in mind, re-read fresh if you can.</li>
          <li>Nothing is saved or sent anywhere — this runs entirely in your browser.</li>
          <li>You&apos;ll get a rule-by-rule review against George Orwell&apos;s five writing rules, and a fix tip for the first one that still needs work.</li>
        </ul>
        <button
          type="button"
          onClick={() => dispatch({ type: "begin" })}
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          Start the review
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
            {state.stepIndex === STEPS.length - 1 ? "See my review" : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "result") {
    return <WritingEditorResultSummary result={state.result} onRestart={() => dispatch({ type: "restart" })} headingRef={resultHeadingRef} />;
  }

  return null;
}
