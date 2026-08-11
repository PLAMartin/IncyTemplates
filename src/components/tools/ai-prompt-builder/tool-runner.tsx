"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import type { AiPromptBuilderInput, AiPromptBuilderResult } from "@/lib/tools/ai-prompt-builder/schema";
import { AiPromptBuilderResultSummary } from "@/components/tools/ai-prompt-builder/tool-result-summary";

type TextKey = "contextText" | "actionText" | "resultText" | "exampleText";

type Step =
  | { kind: "text"; key: TextKey; required: boolean; legend: string; placeholder: string; hint: string }
  | {
      kind: "select";
      key: "includeQuestionFlip";
      legend: string;
      options: { value: "yes_add_it" | "no_just_the_prompt"; label: string; description: string }[];
    };

// Four text steps mapping onto the CARE framework (Context, Action, Result, Example — the last
// optional), plus one select step for whether to append the "ask me one question at a time"
// flip instruction — the third Tool to mix step types, after Product Idea Generator and Product
// Positioning Builder (docs/decisions/0029, 0032, 0042).
const STEPS: Step[] = [
  {
    kind: "text",
    key: "contextText",
    required: true,
    legend: "Context — who or what should the chatbot act as, and what's the situation?",
    placeholder: "e.g. You're a nutritionist helping a busy parent plan meals.",
    hint: "Set the scene — who's involved, and in what role.",
  },
  {
    kind: "text",
    key: "actionText",
    required: true,
    legend: "Action — what should the chatbot actually do?",
    placeholder: "e.g. Create a 7-day vegetarian meal plan with calorie counts and recipes.",
    hint: "The specific action, not just the topic.",
  },
  {
    kind: "text",
    key: "resultText",
    required: true,
    legend: "Result — what format or output do you want back?",
    placeholder: "e.g. A table with one row per day, plus a shopping list at the end.",
    hint: "Be specific about structure — table, list, word count, tone.",
  },
  {
    kind: "text",
    key: "exampleText",
    required: false,
    legend: "Example — have something to guide the style?",
    placeholder: "e.g. Day 1 – Breakfast: overnight oats (320 cal)...",
    hint: "Optional — skip if you don't have one.",
  },
  {
    kind: "select",
    key: "includeQuestionFlip",
    legend: "Should the chatbot ask you questions first, instead of answering straight away?",
    options: [
      {
        value: "yes_add_it",
        label: "Yes, ask me questions first",
        description: "Adds an instruction asking the chatbot to draw out your thinking one question at a time.",
      },
      {
        value: "no_just_the_prompt",
        label: "No, just the prompt",
        description: "The chatbot should answer directly from what you've given it.",
      },
    ],
  },
];

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<AiPromptBuilderInput>; error: string | null }
  | { phase: "result"; result: AiPromptBuilderResult };

type Action =
  | { type: "begin" }
  | { type: "setText"; key: TextKey; value: string }
  | { type: "select"; value: "yes_add_it" | "no_just_the_prompt" }
  | { type: "next" }
  | { type: "back" }
  | { type: "restart" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "begin":
      return { phase: "question", stepIndex: 0, answers: {}, error: null };
    case "restart":
      return { phase: "start" };
    case "setText": {
      if (state.phase !== "question") return state;
      return { ...state, answers: { ...state.answers, [action.key]: action.value }, error: null };
    }
    case "select": {
      if (state.phase !== "question") return state;
      return { ...state, answers: { ...state.answers, includeQuestionFlip: action.value }, error: null };
    }
    case "back": {
      if (state.phase !== "question" || state.stepIndex === 0) return state;
      return { ...state, stepIndex: state.stepIndex - 1, error: null };
    }
    case "next": {
      if (state.phase !== "question") return state;
      const step = STEPS[state.stepIndex]!;
      const isBlank = !state.answers[step.key]?.trim();
      if (step.kind === "select" && isBlank) {
        return { ...state, error: "Choose an option to continue." };
      }
      if (step.kind === "text" && step.required && isBlank) {
        return { ...state, error: "This answer is needed to build your prompt." };
      }
      if (state.stepIndex < STEPS.length - 1) {
        return { ...state, stepIndex: state.stepIndex + 1, error: null };
      }
      // Last step answered — validate and run the deterministic assembly.
      const definition = getToolDefinition("ai-prompt-builder");
      const parsed = definition.inputSchema.safeParse(state.answers);
      if (!parsed.success) {
        return { ...state, error: "Something's missing — please check every required question was answered." };
      }
      const result = definition.run(parsed.data) as AiPromptBuilderResult;
      return { phase: "result", result };
    }
    default:
      return state;
  }
}

export function AiPromptBuilderRunner() {
  const [state, dispatch] = useReducer(reducer, { phase: "start" });
  const errorRegionId = useId();
  const textInputId = useId();
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  const currentStep = state.phase === "question" ? STEPS[state.stepIndex] : undefined;
  const textValue = currentStep && currentStep.kind === "text" && state.phase === "question" ? (state.answers[currentStep.key] ?? "") : "";
  const selectedValue =
    currentStep && currentStep.kind === "select" && state.phase === "question" ? state.answers[currentStep.key] : undefined;

  const progressLabel = useMemo(() => {
    if (state.phase !== "question") return null;
    return `Question ${state.stepIndex + 1} of ${STEPS.length}`;
  }, [state]);

  if (state.phase === "start") {
    return (
      <div className="rounded-md border border-ink-200 bg-paper-raised p-6">
        <h2 className="text-lg font-semibold text-ink-900">Before you start</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-700">
          <li>Takes about 3 minutes — answer with a specific task in mind, the one you actually want a chatbot&apos;s help with.</li>
          <li>Nothing is saved or sent anywhere — this runs entirely in your browser.</li>
          <li>You&apos;ll get a ready-to-paste prompt, built from the CARE framework.</li>
        </ul>
        <button
          type="button"
          onClick={() => dispatch({ type: "begin" })}
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          Start building your prompt
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

        {currentStep.kind === "text" ? (
          <div className="mt-3">
            <label htmlFor={textInputId} className="block text-lg font-semibold text-ink-900">
              {currentStep.legend}
            </label>
            <p className="mt-1 text-sm text-ink-500">{currentStep.hint}</p>
            <textarea
              id={textInputId}
              rows={3}
              value={textValue}
              placeholder={currentStep.placeholder}
              onChange={(event) => dispatch({ type: "setText", key: currentStep.key, value: event.target.value })}
              className="mt-4 w-full rounded-md border border-ink-200 p-3 text-sm text-ink-900 focus-visible:outline-2 focus-visible:outline-focus-ring"
            />
          </div>
        ) : (
          <fieldset className="mt-3">
            <legend className="text-lg font-semibold text-ink-900">{currentStep.legend}</legend>
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
                    onChange={() => dispatch({ type: "select", value: option.value })}
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
        )}

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
            {state.stepIndex === STEPS.length - 1 ? "See my prompt" : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "result") {
    return <AiPromptBuilderResultSummary result={state.result} onRestart={() => dispatch({ type: "restart" })} headingRef={resultHeadingRef} />;
  }

  return null;
}
