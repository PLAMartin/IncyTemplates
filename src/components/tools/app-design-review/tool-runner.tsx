"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import { appDesignReviewCopySchema } from "@/lib/tools/app-design-review/copy";
import { resolveToolCopy } from "@/lib/tools/copy";
import type { AppDesignReviewInput, AppDesignReviewResult } from "@/lib/tools/app-design-review/schema";
import { AppDesignReviewResultSummary } from "@/components/tools/app-design-review/tool-result-summary";

type StepKey = keyof AppDesignReviewInput;

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

// Ten steps, one per Dieter Rams principle, in the source post's own listed order.
function buildSteps(copy: Record<string, string>): Step[] {
  return [
  {
    key: "innovative",
    legend: copy.q_innovative_legend!,
    options: options("It looks and works much like everything else in the category.", "It offers a fresh approach, built on real technical or design improvements."),
  },
  {
    key: "useful",
    legend: copy.q_useful_legend!,
    options: options("Some parts are there for decoration rather than function.", "Everything present serves the product's core function."),
  },
  {
    key: "aesthetic",
    legend: copy.q_aesthetic_legend!,
    options: options("It's rough around the edges, or relies on decoration to look finished.", "It's well made — the aesthetic quality comes from good execution."),
  },
  {
    key: "understandable",
    legend: copy.q_understandable_legend!,
    hint: copy.q_understandable_hint || undefined,
    options: options("People need instructions or a tooltip to understand it.", "The structure is clear enough to explain itself."),
  },
  {
    key: "unobtrusive",
    legend: copy.q_unobtrusive_legend!,
    options: options("The design calls attention to itself rather than the task at hand.", "It's neutral and restrained — a tool, not a showpiece."),
  },
  {
    key: "honest",
    legend: copy.q_honest_legend!,
    options: options("Some copy, badges or indicators promise more than the product delivers.", "Every claim it makes matches what the product actually delivers."),
  },
  {
    key: "longLasting",
    legend: copy.q_long_lasting_legend!,
    options: options("It leans on whatever's currently trending in interface design.", "It's built to last, not to chase a current trend."),
  },
  {
    key: "thorough",
    legend: copy.q_thorough_legend!,
    hint: copy.q_thorough_hint || undefined,
    options: options("Some details are still arbitrary, inconsistent or unfinished.", "The small stuff has been cared for throughout."),
  },
  {
    key: "environmentallyFriendly",
    legend: copy.q_environmentally_friendly_legend!,
    options: options("It carries more visual or resource clutter than it needs to.", "It's lean, with minimal unnecessary clutter."),
  },
  {
    key: "asLittleAsPossible",
    legend: copy.q_as_little_as_possible_legend!,
    options: options("It's still carrying non-essential extras.", "It concentrates on the essential aspects, with nothing extra."),
  },
  ];
}

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<AppDesignReviewInput>; error: string | null }
  | { phase: "result"; result: AppDesignReviewResult };

type Action =
  | { type: "begin" }
  | { type: "select"; key: StepKey; value: string }
  | { type: "next" }
  | { type: "back" }
  | { type: "restart" };

function createReducer(steps: Step[]) {
  return function reducer(state: State, action: Action): State {
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
        return { ...state, error: "Choose an option to continue." };
      }
      if (state.stepIndex < steps.length - 1) {
        return { ...state, stepIndex: state.stepIndex + 1, error: null };
      }
      // Last step answered — validate and run the deterministic review.
      const definition = getToolDefinition("app-design-review");
      const parsed = definition.inputSchema.safeParse(state.answers);
      if (!parsed.success) {
        return { ...state, error: "Something's missing — please check every question was answered." };
      }
      const result = definition.run(parsed.data) as AppDesignReviewResult;
      return { phase: "result", result };
    }
    default:
      return state;
  }
  };
}

export function AppDesignReviewRunner({ copy: copyOverrides }: { copy?: Record<string, string> }) {
  const copy = useMemo(() => resolveToolCopy(appDesignReviewCopySchema, copyOverrides), [copyOverrides]);
  const steps = useMemo(() => buildSteps(copy), [copy]);
  const [state, dispatch] = useReducer(createReducer(steps), { phase: "start" });
  const errorRegionId = useId();
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  const currentStep = state.phase === "question" ? steps[state.stepIndex] : undefined;
  const selectedValue = currentStep && state.phase === "question" ? state.answers[currentStep.key] : undefined;

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
            {state.stepIndex === steps.length - 1 ? "See my review" : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "result") {
    return <AppDesignReviewResultSummary result={state.result} onRestart={() => dispatch({ type: "restart" })} headingRef={resultHeadingRef} />;
  }

  return null;
}
