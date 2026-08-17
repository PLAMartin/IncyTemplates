"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import { stickyPitchCheckerCopySchema } from "@/lib/tools/sticky-pitch-checker/copy";
import { resolveToolCopy } from "@/lib/tools/copy";
import type { StickyPitchCheckerInput, StickyPitchCheckerResult } from "@/lib/tools/sticky-pitch-checker/schema";
import { StickyPitchCheckerResultSummary } from "@/components/tools/sticky-pitch-checker/tool-result-summary";

type StepKey = keyof StickyPitchCheckerInput;

type Step = {
  key: StepKey;
  legend: string;
  hint?: string;
  options: { value: string; label: string; description: string }[];
};

function options(notYetDescription: string, alreadyThereDescription: string): Step["options"] {
  return [
    { value: "not_yet", label: "Not yet", description: notYetDescription },
    { value: "already_there", label: "Already there", description: alreadyThereDescription },
  ];
}

// Ten steps: SUCCESs's six factors first, then STEPPS's four remaining unique ones, in the
// order the two source posts each list their own factors.
function buildSteps(copy: Record<string, string>): Step[] {
  return [
    {
      key: "simple",
      legend: copy.q_simple_legend!,
      hint: copy.q_simple_hint || undefined,
      options: options("It's still trying to make more than one point at a time.", "It comes down to a single, clear idea."),
    },
    {
      key: "unexpected",
      legend: copy.q_unexpected_legend!,
      options: options("It says roughly what everyone assumes it will say.", "It has a genuine element of surprise or a real hook."),
    },
    {
      key: "concrete",
      legend: copy.q_concrete_legend!,
      options: options("It still leans on generic, mission-statement language.", "It uses concrete imagery someone can actually picture."),
    },
    {
      key: "credible",
      legend: copy.q_credible_legend!,
      options: options("It currently rests on authority alone, with no supporting detail.", "It's backed by a specific, checkable detail or example."),
    },
    {
      key: "emotional",
      legend: copy.q_emotional_legend!,
      options: options("It reads as informative but not something anyone would feel strongly about.", "It appeals to identity or to something people already care about."),
    },
    {
      key: "story",
      legend: copy.q_story_legend!,
      options: options("It's still a list of points rather than something with a shape.", "It's framed as a story someone could retell."),
    },
    {
      key: "socialCurrency",
      legend: copy.q_social_currency_legend!,
      options: options("There's no obvious reason sharing it would reflect well on someone.", "It's remarkable, novel or a little exclusive — a reason to be the one who shared it."),
    },
    {
      key: "triggers",
      legend: copy.q_triggers_legend!,
      hint: copy.q_triggers_hint || undefined,
      options: options("There's nothing in someone's everyday routine that would bring it to mind.", "It's linked to something people already regularly encounter."),
    },
    {
      key: "public",
      legend: copy.q_public_legend!,
      options: options("Using it leaves no visible trace anyone else would notice.", "Using it is naturally visible to other people."),
    },
    {
      key: "practicalValue",
      legend: copy.q_practical_value_legend!,
      hint: copy.q_practical_value_hint || undefined,
      options: options("The value is real but hard to summarise in one line.", "It boils down to one specific, quantified detail worth repeating."),
    },
  ];
}

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<StickyPitchCheckerInput>; error: string | null }
  | { phase: "result"; result: StickyPitchCheckerResult };

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
      // Last step answered — validate and run the deterministic check.
      const definition = getToolDefinition("sticky-pitch-checker");
      const parsed = definition.inputSchema.safeParse(state.answers);
      if (!parsed.success) {
        return { ...state, error: copy.error_invalid! };
      }
      const result = definition.run(parsed.data) as StickyPitchCheckerResult;
      return { phase: "result", result };
    }
    default:
      return state;
  }
}

export function StickyPitchCheckerRunner({ copy: copyOverrides }: { copy?: Record<string, string> }) {
  const copy = useMemo(() => resolveToolCopy(stickyPitchCheckerCopySchema, copyOverrides), [copyOverrides]);
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
            {state.stepIndex === steps.length - 1 ? copy.see_result_label : copy.continue_label}
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "result") {
    return (
      <StickyPitchCheckerResultSummary result={state.result} onRestart={() => dispatch({ type: "restart" })} headingRef={resultHeadingRef} copy={copy} />
    );
  }

  return null;
}
