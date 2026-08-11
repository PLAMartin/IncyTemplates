"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import type { DailyPracticeCommitment, ProductIdeaGeneratorInput, ProductIdeaGeneratorResult } from "@/lib/tools/product-idea-generator/schema";
import { ProductIdeaGeneratorResultSummary } from "@/components/tools/product-idea-generator/tool-result-summary";

type TextKey = "ownFrustration" | "nicheKnowledge" | "frequentlyUsedProduct";

type Step =
  | { kind: "text"; key: TextKey; legend: string; placeholder: string; hint: string }
  | {
      kind: "select";
      key: "dailyPracticeCommitment";
      legend: string;
      options: { value: DailyPracticeCommitment; label: string; description: string }[];
    };

// Three optional free-text steps (one per idea-sourcing method, spec v4 §37) plus one required
// select — the first Tool to mix step types, since a personalised idea direction needs the
// visitor's own words, not just a multiple-choice answer (docs/decisions/0029).
const STEPS: Step[] = [
  {
    kind: "text",
    key: "ownFrustration",
    legend: "What's something in your daily life or work that quietly annoys you or wastes your time?",
    placeholder: "e.g. Chasing up invoices that are just sitting unpaid",
    hint: "Optional — skip if nothing comes to mind.",
  },
  {
    kind: "text",
    key: "nicheKnowledge",
    legend: "What specific group of people or world do you understand well from the inside?",
    placeholder: "e.g. Amateur triathlon coaches",
    hint: "A hobby, a job, a community — anywhere you're already an insider. Optional.",
  },
  {
    kind: "text",
    key: "frequentlyUsedProduct",
    legend: "Name a product or app you use often that you think could be better.",
    placeholder: "e.g. My gym's booking app",
    hint: "Optional — skip if nothing comes to mind.",
  },
  {
    kind: "select",
    key: "dailyPracticeCommitment",
    legend: "How ready are you to commit to noting down ideas daily?",
    options: [
      { value: "not_yet", label: "Not yet", description: "I haven't tried anything like this before." },
      { value: "willing_to_try", label: "Willing to try", description: "I'll give it a go for a week and see." },
      { value: "already_do_it", label: "Already do it", description: "I already keep some kind of running idea list." },
    ],
  },
];

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<ProductIdeaGeneratorInput>; error: string | null }
  | { phase: "result"; result: ProductIdeaGeneratorResult };

type Action =
  | { type: "begin" }
  | { type: "setText"; key: TextKey; value: string }
  | { type: "select"; value: DailyPracticeCommitment }
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
      return { ...state, answers: { ...state.answers, dailyPracticeCommitment: action.value }, error: null };
    }
    case "back": {
      if (state.phase !== "question" || state.stepIndex === 0) return state;
      return { ...state, stepIndex: state.stepIndex - 1, error: null };
    }
    case "next": {
      if (state.phase !== "question") return state;
      const step = STEPS[state.stepIndex]!;
      // Text steps are optional — only the select step blocks progress when unanswered.
      if (step.kind === "select" && !state.answers[step.key]) {
        return { ...state, error: "Choose an option to continue." };
      }
      if (state.stepIndex < STEPS.length - 1) {
        return { ...state, stepIndex: state.stepIndex + 1, error: null };
      }
      // Last step answered — validate and run the deterministic generator.
      const definition = getToolDefinition("product-idea-generator");
      const parsed = definition.inputSchema.safeParse(state.answers);
      if (!parsed.success) {
        return { ...state, error: "Enter at least one answer above to generate an idea direction — use Back to add one." };
      }
      const result = definition.run(parsed.data) as ProductIdeaGeneratorResult;
      return { phase: "result", result };
    }
    default:
      return state;
  }
}

export function ProductIdeaGeneratorRunner() {
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
          <li>Takes about 3 minutes — answer whichever questions apply to you, and skip the rest.</li>
          <li>Nothing is saved or sent anywhere — this runs entirely in your browser.</li>
          <li>You&apos;ll get a personalised idea direction and a first test step.</li>
        </ul>
        <button
          type="button"
          onClick={() => dispatch({ type: "begin" })}
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          Start generating ideas
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
            {state.stepIndex === STEPS.length - 1 ? "See my result" : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "result") {
    return <ProductIdeaGeneratorResultSummary result={state.result} onRestart={() => dispatch({ type: "restart" })} headingRef={resultHeadingRef} />;
  }

  return null;
}
