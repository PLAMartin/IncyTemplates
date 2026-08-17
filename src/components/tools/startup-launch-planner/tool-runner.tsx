"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import { startupLaunchPlannerCopySchema } from "@/lib/tools/startup-launch-planner/copy";
import { resolveToolCopy } from "@/lib/tools/copy";
import type { StartupLaunchPlannerInput, StartupLaunchPlannerResult } from "@/lib/tools/startup-launch-planner/schema";
import { StartupLaunchPlannerResultSummary } from "@/components/tools/startup-launch-planner/tool-result-summary";

type StepKey = "hasSomethingToShow" | "feedbackStakes" | "existingAudience" | "newsworthiness";

type Step = {
  key: StepKey;
  legend: string;
  hint?: string;
  options: { value: string; label: string; description: string }[];
};

function buildSteps(copy: Record<string, string>): Step[] {
  return [
    {
      key: "hasSomethingToShow",
      legend: copy.q_has_something_legend!,
      options: [
        { value: "yes_a_working_version_or_page", label: "Yes, a working version or page", description: "There's something real people can look at or try." },
        { value: "no_just_an_idea_so_far", label: "No, just an idea so far", description: "Nothing's built yet." },
      ],
    },
    {
      key: "feedbackStakes",
      legend: copy.q_feedback_stakes_legend!,
      options: [
        { value: "want_low_stakes_honest_feedback_first", label: "Low-stakes feedback first", description: "I'd rather test this with people I trust before going wider." },
        { value: "ready_for_public_reaction", label: "Ready for public reaction", description: "I'm ready to put this in front of people I don't know." },
      ],
    },
    {
      key: "existingAudience",
      legend: copy.q_existing_audience_legend!,
      options: [
        { value: "yes_i_already_have_some_following_or_community_ties", label: "Yes, some following or ties", description: "There are people who already pay attention to what I do." },
        { value: "no_starting_from_zero", label: "No, starting from zero", description: "I don't have an existing audience to draw on." },
      ],
    },
    {
      key: "newsworthiness",
      legend: copy.q_newsworthiness_legend!,
      hint: copy.q_newsworthiness_hint || undefined,
      options: [
        { value: "yes_genuinely_novel_or_a_good_story", label: "Yes, genuinely novel or a good story", description: "There's a real angle a journalist would want to cover." },
        { value: "not_particularly_newsworthy_yet", label: "Not particularly newsworthy yet", description: "It's a solid product, but not a story in itself yet." },
      ],
    },
  ];
}

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<StartupLaunchPlannerInput>; error: string | null }
  | { phase: "result"; result: StartupLaunchPlannerResult };

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
      // Last step answered — validate and run the deterministic plan generation.
      const definition = getToolDefinition("startup-launch-planner");
      const parsed = definition.inputSchema.safeParse(state.answers);
      if (!parsed.success) {
        return { ...state, error: copy.error_invalid! };
      }
      const result = definition.run(parsed.data) as StartupLaunchPlannerResult;
      return { phase: "result", result };
    }
    default:
      return state;
  }
}

export function StartupLaunchPlannerRunner({ copy: copyOverrides }: { copy?: Record<string, string> }) {
  const copy = useMemo(() => resolveToolCopy(startupLaunchPlannerCopySchema, copyOverrides), [copyOverrides]);
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
            {state.stepIndex === steps.length - 1 ? copy.see_plan_label : copy.continue_label}
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "result") {
    return (
      <StartupLaunchPlannerResultSummary
        result={state.result}
        onRestart={() => dispatch({ type: "restart" })}
        headingRef={resultHeadingRef}
        copy={copy}
      />
    );
  }

  return null;
}
