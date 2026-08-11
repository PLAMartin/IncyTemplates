"use client";

import { useId, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import type { LateralThinkingToolkitResult } from "@/lib/tools/lateral-thinking-toolkit/schema";
import { LateralThinkingToolkitResultSummary } from "@/components/tools/lateral-thinking-toolkit/tool-result-summary";

type State =
  | { phase: "start" }
  | { phase: "question"; problemOrIdea: string; error: string | null }
  | { phase: "result"; result: LateralThinkingToolkitResult };

type Action = { type: "begin" } | { type: "setText"; value: string } | { type: "generate" } | { type: "restart" };

function reducer(state: State, action: Action): State {
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
        return { ...state, error: "Describe the problem or idea you're stuck on to generate prompts." };
      }
      const result = definition.run(parsed.data) as LateralThinkingToolkitResult;
      return { phase: "result", result };
    }
    default:
      return state;
  }
}

export function LateralThinkingToolkitRunner() {
  const [state, dispatch] = useReducer(reducer, { phase: "start" });
  const errorRegionId = useId();
  const textInputId = useId();
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  if (state.phase === "start") {
    return (
      <div className="rounded-md border border-ink-200 bg-paper-raised p-6">
        <h2 className="text-lg font-semibold text-ink-900">Before you start</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-700">
          <li>Takes about 2 minutes — describe whatever you&apos;re stuck on in a sentence or two.</li>
          <li>Nothing is saved or sent anywhere — this runs entirely in your browser.</li>
          <li>You&apos;ll get five prompts, one per technique, to jog your thinking from different angles.</li>
        </ul>
        <button
          type="button"
          onClick={() => dispatch({ type: "begin" })}
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          Start generating prompts
        </button>
      </div>
    );
  }

  if (state.phase === "question") {
    return (
      <div className="rounded-md border border-ink-200 bg-paper-raised p-6">
        <label htmlFor={textInputId} className="block text-lg font-semibold text-ink-900">
          What problem or idea are you stuck on?
        </label>
        <p className="mt-1 text-sm text-ink-500">A sentence or two is plenty — you don&apos;t need to have it fully worked out.</p>
        <textarea
          id={textInputId}
          rows={3}
          value={state.problemOrIdea}
          placeholder="e.g. I can't work out how to make our onboarding feel less generic"
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
            Generate prompts
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "result") {
    return (
      <LateralThinkingToolkitResultSummary result={state.result} onRestart={() => dispatch({ type: "restart" })} headingRef={resultHeadingRef} />
    );
  }

  return null;
}
