"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import { rapidLearningPlannerCopySchema } from "@/lib/tools/rapid-learning-planner/copy";
import { resolveToolCopy } from "@/lib/tools/copy";
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
// will run (docs/decisions/0060). Legend/placeholder/hint text comes from `copy`
// (admin-editable, spec §14.7.1).
function buildSteps(copy: Record<string, string>): Step[] {
  return [
    {
      key: "deconstruction",
      legend: copy.q_deconstruction_legend!,
      placeholder: copy.q_deconstruction_placeholder!,
      hint: copy.q_deconstruction_hint!,
    },
    {
      key: "selection",
      legend: copy.q_selection_legend!,
      placeholder: copy.q_selection_placeholder!,
      hint: copy.q_selection_hint!,
    },
    {
      key: "sequencing",
      legend: copy.q_sequencing_legend!,
      placeholder: copy.q_sequencing_placeholder!,
      hint: copy.q_sequencing_hint!,
    },
    {
      key: "stakes",
      legend: copy.q_stakes_legend!,
      placeholder: copy.q_stakes_placeholder!,
      hint: copy.q_stakes_hint!,
    },
  ];
}

// Keys/order/length only — reducer logic doesn't need copy-driven legend/placeholder/hint text.
const STEP_KEYS: StepKey[] = ["deconstruction", "selection", "sequencing", "stakes"];

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
      if (state.stepIndex < STEP_KEYS.length - 1) {
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

export function RapidLearningPlannerRunner({ copy: copyOverrides }: { copy?: Record<string, string> }) {
  const copy = useMemo(() => resolveToolCopy(rapidLearningPlannerCopySchema, copyOverrides), [copyOverrides]);
  const steps = useMemo(() => buildSteps(copy), [copy]);
  const [state, dispatch] = useReducer(reducer, { phase: "start" });
  const errorRegionId = useId();
  const textInputId = useId();
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  const currentStep = state.phase === "question" ? steps[state.stepIndex] : undefined;
  const textValue = currentStep && state.phase === "question" ? (state.answers[currentStep.key] ?? "") : "";

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
            {state.stepIndex === steps.length - 1 ? "Check my plan" : "Continue"}
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
