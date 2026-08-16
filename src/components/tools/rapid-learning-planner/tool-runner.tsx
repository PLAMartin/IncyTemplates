"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import type { RapidLearningPlannerInput, RapidLearningPlannerResult } from "@/lib/tools/rapid-learning-planner/schema";
import { RapidLearningPlannerResultSummary } from "@/components/tools/rapid-learning-planner/tool-result-summary";

type StepKey = "deconstruction" | "selection" | "sequencing" | "stakes";

type Step = {
  key: StepKey;
  legend: string;
  placeholder: string;
  hint: string;
};

// Four optional free-text steps, one per DSSS step, in Tim Ferriss's own taught order. All
// optional — the Tool's job is to check which are planned, not to require all four before it
// will run (docs/decisions/0060).
const STEPS: Step[] = [
  {
    key: "deconstruction",
    legend: "Deconstruction — what are the smaller, independent parts of this skill?",
    placeholder: "e.g. Prompting effectively, understanding project structure, debugging, iterating on outputs.",
    hint: "Break the skill down before doing anything else. Leave blank if you haven't done this yet.",
  },
  {
    key: "selection",
    legend: "Selection — which few parts give you most of the value?",
    placeholder: "e.g. Rapid prototyping, debugging, turning ideas into working demos.",
    hint: "The 20% that gets you 80% of the way there. Leave blank if you haven't decided this yet.",
  },
  {
    key: "sequencing",
    legend: "Sequencing — what order will you learn those parts in?",
    placeholder: "e.g. Prompting, then structured iteration, then debugging, then small projects.",
    hint: "Not just what to learn — when. Leave blank if you haven't planned this yet.",
  },
  {
    key: "stakes",
    legend: "Stakes — what accountability will keep you going once the novelty wears off?",
    placeholder: "e.g. Post weekly progress updates publicly.",
    hint: "A commitment, deadline or consequence real enough to matter. Leave blank if you haven't set this yet.",
  },
];

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<RapidLearningPlannerInput>; error: string | null }
  | { phase: "result"; result: RapidLearningPlannerResult };

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
      // Last step reached — validate and run the deterministic plan check.
      const definition = getToolDefinition("rapid-learning-planner");
      const parsed = definition.inputSchema.safeParse(state.answers);
      if (!parsed.success) {
        return { ...state, error: "Enter at least one step above to check your learning plan — use Back to add one." };
      }
      const result = definition.run(parsed.data) as RapidLearningPlannerResult;
      return { phase: "result", result };
    }
    default:
      return state;
  }
}

export function RapidLearningPlannerRunner() {
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
          <li>Takes about 3 minutes — think of a specific skill you&apos;re learning and fill in what you&apos;ve already planned.</li>
          <li>Nothing is saved or sent anywhere — this runs entirely in your browser.</li>
          <li>You&apos;ll see which of the four DSSS steps are ready, and a tip for what to plan next.</li>
        </ul>
        <button
          type="button"
          onClick={() => dispatch({ type: "begin" })}
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          Start checking your plan
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
            {state.stepIndex === STEPS.length - 1 ? "Check my plan" : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "result") {
    return <RapidLearningPlannerResultSummary result={state.result} onRestart={() => dispatch({ type: "restart" })} headingRef={resultHeadingRef} />;
  }

  return null;
}
