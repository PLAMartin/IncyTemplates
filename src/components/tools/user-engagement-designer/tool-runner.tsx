"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import type { UserEngagementDesignerInput, UserEngagementDesignerResult } from "@/lib/tools/user-engagement-designer/schema";
import { UserEngagementDesignerResultSummary } from "@/components/tools/user-engagement-designer/tool-result-summary";

type StepKey = "triggerStrength" | "actionEase" | "rewardQuality" | "investmentDepth";

type Step = {
  key: StepKey;
  legend: string;
  hint?: string;
  options: { value: string; label: string; description: string }[];
};

const STEPS: Step[] = [
  {
    key: "triggerStrength",
    legend: "Do users have a clear, reliable trigger prompting them back to your product?",
    options: [
      { value: "yes_clear_external_trigger", label: "Yes, a clear external trigger", description: "A notification, icon or email reliably prompts the next visit." },
      { value: "sometimes_but_inconsistent", label: "Sometimes, but inconsistent", description: "There's something, but it doesn't fire reliably." },
      { value: "no_users_have_to_remember_on_their_own", label: "No, users have to remember on their own", description: "There's no external prompt at all." },
    ],
  },
  {
    key: "actionEase",
    legend: "Once triggered, how easy is the very next action?",
    options: [
      { value: "one_simple_step", label: "One simple step", description: "A single, obvious action — a tap, a scroll, a search." },
      { value: "a_few_steps", label: "A few steps", description: "It takes a handful of steps to get going." },
      { value: "several_steps_or_real_effort", label: "Several steps or real effort", description: "It takes real thought or effort before anything happens." },
    ],
  },
  {
    key: "rewardQuality",
    legend: "Does the action reliably pay off with something rewarding?",
    options: [
      { value: "yes_varied_and_satisfying", label: "Yes, varied and satisfying", description: "The payoff varies enough to stay interesting." },
      { value: "somewhat_but_predictable_or_flat", label: "Somewhat, but predictable or flat", description: "There's a payoff, but it's the same every time." },
      { value: "rarely_or_inconsistently", label: "Rarely or inconsistently", description: "The action often doesn't feel rewarding at all." },
    ],
  },
  {
    key: "investmentDepth",
    legend: "Do users put anything into the product that makes it more valuable to return to?",
    hint: "Think about data, content, progress or reputation that carries forward between sessions.",
    options: [
      { value: "yes_they_build_something_that_compounds", label: "Yes, something that compounds", description: "Content, data or progress builds up the more they use it." },
      { value: "a_little_but_not_much", label: "A little, but not much", description: "There's something, but it doesn't add up to much." },
      { value: "no_nothing_carries_forward", label: "No, nothing carries forward", description: "Every session starts from zero." },
    ],
  },
];

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<UserEngagementDesignerInput>; error: string | null }
  | { phase: "result"; result: UserEngagementDesignerResult };

type Action =
  | { type: "begin" }
  | { type: "select"; key: StepKey; value: string }
  | { type: "next" }
  | { type: "back" }
  | { type: "restart" };

function reducer(state: State, action: Action): State {
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
      const step = STEPS[state.stepIndex]!;
      if (!state.answers[step.key]) {
        return { ...state, error: "Choose an option to continue." };
      }
      if (state.stepIndex < STEPS.length - 1) {
        return { ...state, stepIndex: state.stepIndex + 1, error: null };
      }
      // Last step answered — validate and run the deterministic diagnosis.
      const definition = getToolDefinition("user-engagement-designer");
      const parsed = definition.inputSchema.safeParse(state.answers);
      if (!parsed.success) {
        return { ...state, error: "Something's missing — please check every question was answered." };
      }
      const result = definition.run(parsed.data) as UserEngagementDesignerResult;
      return { phase: "result", result };
    }
    default:
      return state;
  }
}

export function UserEngagementDesignerRunner() {
  const [state, dispatch] = useReducer(reducer, { phase: "start" });
  const errorRegionId = useId();
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  const currentStep = state.phase === "question" ? STEPS[state.stepIndex] : undefined;
  const selectedValue = currentStep && state.phase === "question" ? state.answers[currentStep.key] : undefined;

  const progressLabel = useMemo(() => {
    if (state.phase !== "question") return null;
    return `Question ${state.stepIndex + 1} of ${STEPS.length}`;
  }, [state]);

  if (state.phase === "start") {
    return (
      <div className="rounded-md border border-ink-200 bg-paper-raised p-6">
        <h2 className="text-lg font-semibold text-ink-900">Before you start</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-700">
          <li>Takes about 3 minutes — answer based on your product as it actually works today.</li>
          <li>Nothing is saved or sent anywhere — this runs entirely in your browser.</li>
          <li>You&apos;ll get your weakest engagement-loop link and one concrete next step.</li>
        </ul>
        <button
          type="button"
          onClick={() => dispatch({ type: "begin" })}
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          Start mapping your loop
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
    return (
      <UserEngagementDesignerResultSummary result={state.result} onRestart={() => dispatch({ type: "restart" })} headingRef={resultHeadingRef} />
    );
  }

  return null;
}
