"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import type { ChannelType, FirstCustomersPlannerInput, FirstCustomersPlannerResult, Rating } from "@/lib/tools/first-customers-planner/schema";
import { FirstCustomersPlannerResultSummary } from "@/components/tools/first-customers-planner/tool-result-summary";

type StepKey = "channelType" | "audiencePresence" | "founderFit" | "effortToStart" | "repeatability";

type Step = {
  key: StepKey;
  legend: string;
  hint?: string;
  options: { value: string; label: string; description: string }[];
};

const STEPS: Step[] = [
  {
    key: "channelType",
    legend: "Which channel are you evaluating?",
    options: [
      {
        value: "cold_outreach" satisfies ChannelType,
        label: "Cold outreach",
        description: "Direct emails or messages to people you don't already know.",
      },
      {
        value: "content_marketing" satisfies ChannelType,
        label: "Content marketing",
        description: "Writing, video or similar content that attracts people over time.",
      },
      {
        value: "communities_and_forums" satisfies ChannelType,
        label: "Communities and forums",
        description: "Places your target customers already gather and discuss the problem.",
      },
      {
        value: "existing_network" satisfies ChannelType,
        label: "Existing network",
        description: "People you already know personally or professionally.",
      },
    ],
  },
  {
    key: "audiencePresence",
    legend: "How much of your target audience is actually active in this channel?",
    options: [
      { value: "low" satisfies Rating, label: "Low", description: "Little sign they spend time here." },
      { value: "medium" satisfies Rating, label: "Medium", description: "Some presence, but not concentrated." },
      { value: "high" satisfies Rating, label: "High", description: "This is clearly where they already are." },
    ],
  },
  {
    key: "founderFit",
    legend: "How comfortable and skilled are you at operating this channel?",
    options: [
      { value: "low" satisfies Rating, label: "Low", description: "Not a skill I have yet." },
      { value: "medium" satisfies Rating, label: "Medium", description: "I could do this, with effort." },
      { value: "high" satisfies Rating, label: "High", description: "This plays to a real strength of mine." },
    ],
  },
  {
    key: "effortToStart",
    legend: "How much effort would it take to get a first real result here?",
    options: [
      { value: "low" satisfies Rating, label: "Low", description: "A day or two to see something real." },
      { value: "medium" satisfies Rating, label: "Medium", description: "A real but manageable investment." },
      { value: "high" satisfies Rating, label: "High", description: "A significant, sustained investment." },
    ],
  },
  {
    key: "repeatability",
    legend: "Could this channel produce a second and third customer the same way?",
    options: [
      { value: "low" satisfies Rating, label: "Low", description: "This looks like a one-off, not a repeatable channel." },
      { value: "medium" satisfies Rating, label: "Medium", description: "Might repeat, but I'm not confident yet." },
      { value: "high" satisfies Rating, label: "High", description: "I can clearly see how to run this again and again." },
    ],
  },
];

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<FirstCustomersPlannerInput>; error: string | null }
  | { phase: "result"; result: FirstCustomersPlannerResult };

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
      // Last step answered — validate and run the deterministic scoring.
      const definition = getToolDefinition("first-customers-planner");
      const parsed = definition.inputSchema.safeParse(state.answers);
      if (!parsed.success) {
        return { ...state, error: "Something's missing — please check every question was answered." };
      }
      const result = definition.run(parsed.data) as FirstCustomersPlannerResult;
      return { phase: "result", result };
    }
    default:
      return state;
  }
}

export function FirstCustomersPlannerRunner() {
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
          <li>Takes about 5 minutes — pick one channel to evaluate at a time.</li>
          <li>Nothing is saved or sent anywhere — this runs entirely in your browser.</li>
          <li>You&apos;ll get a fit score, a strongest and weakest factor, and one concrete next action.</li>
        </ul>
        <button
          type="button"
          onClick={() => dispatch({ type: "begin" })}
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          Start scoring a channel
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
    return <FirstCustomersPlannerResultSummary result={state.result} onRestart={() => dispatch({ type: "restart" })} headingRef={resultHeadingRef} />;
  }

  return null;
}
