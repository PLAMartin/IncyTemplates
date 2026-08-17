"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import { lateralThinkingToolkitCopySchema } from "@/lib/tools/lateral-thinking-toolkit/copy";
import { resolveToolCopy } from "@/lib/tools/copy";
import type { LateralThinkingToolkitResult } from "@/lib/tools/lateral-thinking-toolkit/schema";
import { LateralThinkingToolkitResultSummary } from "@/components/tools/lateral-thinking-toolkit/tool-result-summary";

type State =
  | { phase: "start" }
  | { phase: "question"; problemOrIdea: string; error: string | null }
  | { phase: "result"; result: LateralThinkingToolkitResult };

type Action = { type: "begin" } | { type: "setText"; value: string } | { type: "generate" } | { type: "restart" };

function createReducer(emptyInputError: string) {
  return function reducer(state: State, action: Action): State {
    switch (action.type) {
      case "begin":
        return { phase: "question", problemOrIdea: "", error: null };
      case "restart":
        return { phase: "start" };
      case "setText": {
        if (state.phase !== "question") return state;
        return { ...state, problemOrIdea: action.value, error: null };
      }
      case "generate": {
        if (state.phase !== "question") return state;
        const definition = getToolDefinition("lateral-thinking-toolkit");
        const parsed = definition.inputSchema.safeParse({ problemOrIdea: state.problemOrIdea });
        if (!parsed.success) {
          return { ...state, error: emptyInputError };
        }
        const result = definition.run(parsed.data) as LateralThinkingToolkitResult;
        return { phase: "result", result };
      }
      default:
        return state;
    }
  };
}

export function LateralThinkingToolkitRunner({ copy: copyOverrides }: { copy?: Record<string, string> }) {
  const copy = useMemo(() => resolveToolCopy(lateralThinkingToolkitCopySchema, copyOverrides), [copyOverrides]);
  const [state, dispatch] = useReducer(createReducer(copy.empty_input_error!), { phase: "start" });
  const errorRegionId = useId();
  const textInputId = useId();
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

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

  if (state.phase === "question") {
    return (
      <div className="rounded-md border border-ink-200 bg-paper-raised p-6">
        <label htmlFor={textInputId} className="block text-lg font-semibold text-ink-900">
          {copy.question_label}
        </label>
        <p className="mt-1 text-sm text-ink-500">{copy.question_hint}</p>
        <textarea
          id={textInputId}
          rows={3}
          value={state.problemOrIdea}
          placeholder={copy.question_placeholder}
          onChange={(event) => dispatch({ type: "setText", value: event.target.value })}
          className="mt-4 w-full rounded-md border border-ink-200 p-3 text-sm text-ink-900 focus-visible:outline-2 focus-visible:outline-focus-ring"
        />

        {state.error ? (
          <p id={errorRegionId} role="alert" aria-live="polite" className="mt-4 text-sm font-medium text-red-700">
            {state.error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => dispatch({ type: "generate" })}
            aria-describedby={state.error ? errorRegionId : undefined}
            className="inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-focus-ring"
          >
            {copy.generate_label}
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "result") {
    return (
      <LateralThinkingToolkitResultSummary
        result={state.result}
        onRestart={() => dispatch({ type: "restart" })}
        headingRef={resultHeadingRef}
        copy={copy}
      />
    );
  }

  return null;
}
