"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import type { StoryBuilderInput, StoryBuilderResult } from "@/lib/tools/story-builder/schema";
import { StoryBuilderResultSummary } from "@/components/tools/story-builder/tool-result-summary";

type StepKey = "place" | "action" | "thought" | "emotion" | "dialogue";

type Step = {
  key: StepKey;
  legend: string;
  placeholder: string;
  hint: string;
};

// Five optional free-text steps, one per story-spine element, in the source post's own order
// (spec v4 §37). All optional — the Tool's job is to check which are present, not to require
// all five before it will run (docs/decisions/0037).
const STEPS: Step[] = [
  {
    key: "place",
    legend: "Place — where does the scene happen?",
    placeholder: "e.g. The lift hums as it carries me up to the 7th floor.",
    hint: "One clear noun does more than a list of decor. Leave blank if you haven't written this part yet.",
  },
  {
    key: "action",
    legend: "Action — what are you doing right now, in the moment?",
    placeholder: "e.g. I shuffle my notes, pretending to read.",
    hint: "Use verbs — the story should already be happening. Leave blank if you haven't written this part yet.",
  },
  {
    key: "thought",
    legend: "Thought — what's going through your head?",
    placeholder: "e.g. If asked about market growth rates then I'm in trouble.",
    hint: "Raw and slightly messy reads as real. Leave blank if you haven't written this part yet.",
  },
  {
    key: "emotion",
    legend: "Emotion — shown, not named",
    placeholder: "e.g. I can feel my hands shaking as my pulse quickens.",
    hint: "Show the body doing something rather than naming the feeling. Leave blank if you haven't written this part yet.",
  },
  {
    key: "dialogue",
    legend: "Dialogue — what does someone in the scene say?",
    placeholder: "e.g. \"Hello, Phil. You're early,\" my manager says.",
    hint: "One specific line beats a sentence describing how someone felt. Leave blank if you haven't written this part yet.",
  },
];

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<StoryBuilderInput>; error: string | null }
  | { phase: "result"; result: StoryBuilderResult };

type Action = { type: "begin" } | { type: "setText"; key: StepKey; value: string } | { type: "next" } | { type: "back" } | { type: "restart" };

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
    case "back": {
      if (state.phase !== "question" || state.stepIndex === 0) return state;
      return { ...state, stepIndex: state.stepIndex - 1, error: null };
    }
    case "next": {
      if (state.phase !== "question") return state;
      if (state.stepIndex < STEPS.length - 1) {
        return { ...state, stepIndex: state.stepIndex + 1, error: null };
      }
      // Last step reached — validate and run the deterministic structure check.
      const definition = getToolDefinition("story-builder");
      const parsed = definition.inputSchema.safeParse(state.answers);
      if (!parsed.success) {
        return { ...state, error: "Enter at least one element above to check your story spine — use Back to add one." };
      }
      const result = definition.run(parsed.data) as StoryBuilderResult;
      return { phase: "result", result };
    }
    default:
      return state;
  }
}

export function StoryBuilderRunner() {
  const [state, dispatch] = useReducer(reducer, { phase: "start" });
  const errorRegionId = useId();
  const textInputId = useId();
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  const currentStep = state.phase === "question" ? STEPS[state.stepIndex] : undefined;
  const textValue = currentStep && state.phase === "question" ? (state.answers[currentStep.key] ?? "") : "";

  const progressLabel = useMemo(() => {
    if (state.phase !== "question") return null;
    return `Question ${state.stepIndex + 1} of ${STEPS.length}`;
  }, [state]);

  if (state.phase === "start") {
    return (
      <div className="rounded-md border border-ink-200 bg-paper-raised p-6">
        <h2 className="text-lg font-semibold text-ink-900">Before you start</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-700">
          <li>Takes about 3 minutes — paste whatever you already have for each part, and skip the rest.</li>
          <li>Nothing is saved or sent anywhere — this runs entirely in your browser.</li>
          <li>You&apos;ll see which parts of your story spine are there, and a tip for what to add next.</li>
        </ul>
        <button
          type="button"
          onClick={() => dispatch({ type: "begin" })}
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          Start checking your story
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
            {state.stepIndex === STEPS.length - 1 ? "Check my structure" : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "result") {
    return <StoryBuilderResultSummary result={state.result} onRestart={() => dispatch({ type: "restart" })} headingRef={resultHeadingRef} />;
  }

  return null;
}
