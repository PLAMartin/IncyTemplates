"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
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
const STEPS: Step[] = [
  {
    key: "innovative",
    legend: "Innovative — does it take a genuinely original approach, grounded in what's actually possible today?",
    options: options("It looks and works much like everything else in the category.", "It offers a fresh approach, built on real technical or design improvements."),
  },
  {
    key: "useful",
    legend: "Useful — does every part of it help someone actually use the product?",
    options: options("Some parts are there for decoration rather than function.", "Everything present serves the product's core function."),
  },
  {
    key: "aesthetic",
    legend: "Aesthetic — is it well executed, not just decorated?",
    options: options("It's rough around the edges, or relies on decoration to look finished.", "It's well made — the aesthetic quality comes from good execution."),
  },
  {
    key: "understandable",
    legend: "Understandable — is it close to self-explanatory?",
    hint: "If you need a tooltip to explain what something does, it isn't quite there yet.",
    options: options("People need instructions or a tooltip to understand it.", "The structure is clear enough to explain itself."),
  },
  {
    key: "unobtrusive",
    legend: "Unobtrusive — does the design stay out of the way, rather than drawing attention to itself?",
    options: options("The design calls attention to itself rather than the task at hand.", "It's neutral and restrained — a tool, not a showpiece."),
  },
  {
    key: "honest",
    legend: "Honest — does it avoid overstating what the product can actually do?",
    options: options("Some copy, badges or indicators promise more than the product delivers.", "Every claim it makes matches what the product actually delivers."),
  },
  {
    key: "longLasting",
    legend: "Long-lasting — would it still look right in five years?",
    options: options("It leans on whatever's currently trending in interface design.", "It's built to last, not to chase a current trend."),
  },
  {
    key: "thorough",
    legend: "Thorough — has the small stuff been cared for?",
    hint: "Spacing, edge cases, error states — nothing left arbitrary or unfinished.",
    options: options("Some details are still arbitrary, inconsistent or unfinished.", "The small stuff has been cared for throughout."),
  },
  {
    key: "environmentallyFriendly",
    legend: "Environmentally friendly — is it lean and efficient?",
    options: options("It carries more visual or resource clutter than it needs to.", "It's lean, with minimal unnecessary clutter."),
  },
  {
    key: "asLittleAsPossible",
    legend: "As little design as possible — is it cut down to the essentials?",
    options: options("It's still carrying non-essential extras.", "It concentrates on the essential aspects, with nothing extra."),
  },
];

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
}

export function AppDesignReviewRunner() {
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
          <li>Takes about 3–4 minutes — ten quick questions with a specific product or screen in mind.</li>
          <li>Nothing is saved or sent anywhere — this runs entirely in your browser.</li>
          <li>You&apos;ll get a rule-by-rule review against Dieter Rams&apos; ten principles of good design, and a tip for the first one that still needs work.</li>
        </ul>
        <button
          type="button"
          onClick={() => dispatch({ type: "begin" })}
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          Start the self-assessment
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
            {state.stepIndex === STEPS.length - 1 ? "See my review" : "Continue"}
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
