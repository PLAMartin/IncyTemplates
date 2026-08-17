"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import { negotiationPrepCopySchema } from "@/lib/tools/negotiation-prep/copy";
import { resolveToolCopy } from "@/lib/tools/copy";
import type { NegotiationPrepInput, NegotiationPrepResult } from "@/lib/tools/negotiation-prep/schema";
import { NegotiationPrepResultSummary } from "@/components/tools/negotiation-prep/tool-result-summary";

type StepKey = "batna" | "anchor" | "mesos";

type Step = {
  key: StepKey;
  legend: string;
  placeholder: string;
  hint: string;
};

// Three optional free-text steps, one per tactic, in the source post's own order (spec v6
// §37). All optional — the Tool's job is to check which are prepared, not to require all
// three before it will run (docs/decisions/0055).
function buildSteps(copy: Record<string, string>): Step[] {
  return [
    {
      key: "batna",
      legend: copy.q_batna_legend!,
      placeholder: copy.q_batna_placeholder!,
      hint: copy.q_batna_hint!,
    },
    {
      key: "anchor",
      legend: copy.q_anchor_legend!,
      placeholder: copy.q_anchor_placeholder!,
      hint: copy.q_anchor_hint!,
    },
    {
      key: "mesos",
      legend: copy.q_mesos_legend!,
      placeholder: copy.q_mesos_placeholder!,
      hint: copy.q_mesos_hint!,
    },
  ];
}

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<NegotiationPrepInput>; error: string | null }
  | { phase: "result"; result: NegotiationPrepResult };

type Action = { type: "begin" } | { type: "setText"; key: StepKey; value: string } | { type: "next" } | { type: "back" } | { type: "restart" };

function createReducer(steps: Step[], errorIncomplete: string) {
  return function reducer(state: State, action: Action): State {
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
        if (state.stepIndex < steps.length - 1) {
          return { ...state, stepIndex: state.stepIndex + 1, error: null };
        }
        // Last step reached — validate and run the deterministic prep check.
        const definition = getToolDefinition("negotiation-prep");
        const parsed = definition.inputSchema.safeParse(state.answers);
        if (!parsed.success) {
          return { ...state, error: errorIncomplete };
        }
        const result = definition.run(parsed.data) as NegotiationPrepResult;
        return { phase: "result", result };
      }
      default:
        return state;
    }
  };
}

export function NegotiationPrepRunner({ copy: copyOverrides }: { copy?: Record<string, string> }) {
  const copy = useMemo(() => resolveToolCopy(negotiationPrepCopySchema, copyOverrides), [copyOverrides]);
  const steps = useMemo(() => buildSteps(copy), [copy]);
  const [state, dispatch] = useReducer(createReducer(steps, copy.error_incomplete!), { phase: "start" });
  const errorRegionId = useId();
  const textInputId = useId();
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  const currentStep = state.phase === "question" ? steps[state.stepIndex] : undefined;
  const textValue = currentStep && state.phase === "question" ? (state.answers[currentStep.key] ?? "") : "";

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
            {copy.back_button}
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "next" })}
            aria-describedby={state.error ? errorRegionId : undefined}
            className="inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-focus-ring"
          >
            {state.stepIndex === steps.length - 1 ? copy.final_step_button : copy.continue_button}
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "result") {
    return (
      <NegotiationPrepResultSummary
        result={state.result}
        onRestart={() => dispatch({ type: "restart" })}
        headingRef={resultHeadingRef}
        copy={copy}
      />
    );
  }

  return null;
}
