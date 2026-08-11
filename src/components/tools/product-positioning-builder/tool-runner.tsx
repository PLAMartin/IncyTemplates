"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import type { CutThroughApproach, ProductPositioningBuilderInput, ProductPositioningBuilderResult } from "@/lib/tools/product-positioning-builder/schema";
import { ProductPositioningBuilderResultSummary } from "@/components/tools/product-positioning-builder/tool-result-summary";

type TextKey = "idealCustomer" | "desiredAction" | "desiredOutcome" | "admiredIdentity";

type Step =
  | { kind: "text"; key: TextKey; required: boolean; legend: string; placeholder: string; hint: string }
  | {
      kind: "select";
      key: "cutThroughApproach";
      legend: string;
      options: { value: CutThroughApproach; label: string; description: string }[];
    };

// Three required free-text steps plus one optional one, assembled into a positioning
// statement (spec v4 §37), plus one required select for the cut-through tactic — the second
// Tool to mix step types after Product Idea Generator (docs/decisions/0029, 0032).
const STEPS: Step[] = [
  {
    kind: "text",
    key: "idealCustomer",
    required: true,
    legend: "Who's your ideal customer?",
    placeholder: "e.g. solo founders validating a new product idea",
    hint: "Be specific — a real kind of person, not \"everyone.\"",
  },
  {
    kind: "text",
    key: "desiredAction",
    required: true,
    legend: "What action do you want them to take with your product?",
    placeholder: "e.g. score their idea in under five minutes",
    hint: "The specific thing they do, not the feature that lets them do it.",
  },
  {
    kind: "text",
    key: "desiredOutcome",
    required: true,
    legend: "What outcome do they get from that action?",
    placeholder: "e.g. know exactly how much evidence they still need before committing",
    hint: "The result they walk away with.",
  },
  {
    kind: "text",
    key: "admiredIdentity",
    required: false,
    legend: "What do your ideal customers admire or aspire to be?",
    placeholder: "e.g. founders who ship fast and validate rigorously, not ones who guess",
    hint: "Optional — skip if nothing comes to mind.",
  },
  {
    kind: "select",
    key: "cutThroughApproach",
    legend: "What's the most realistic way you'll cut through the noise?",
    options: [
      {
        value: "problem_people_actively_worry_about",
        label: "A problem people actively worry about",
        description: "The problem you solve is something people already fear or worry about.",
      },
      {
        value: "unusual_or_unexpected_offer",
        label: "An unusual or unexpected offer",
        description: "What you've built or how you present it is genuinely different from what people expect.",
      },
      {
        value: "visually_or_emotionally_striking",
        label: "Visually or emotionally striking",
        description: "Your product or marketing can be visually striking or emotionally provocative.",
      },
      {
        value: "can_give_away_something_valuable_upfront",
        label: "Something valuable, given away upfront",
        description: "You can afford to give away something genuinely valuable before asking for payment.",
      },
      {
        value: "building_repeated_content_over_time",
        label: "Repeated content over time",
        description: "You're building a long-term audience through content, not a single big pitch.",
      },
    ],
  },
];

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<ProductPositioningBuilderInput>; error: string | null }
  | { phase: "result"; result: ProductPositioningBuilderResult };

type Action =
  | { type: "begin" }
  | { type: "setText"; key: TextKey; value: string }
  | { type: "select"; value: CutThroughApproach }
  | { type: "next" }
  | { type: "back" }
  | { type: "restart" };

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
    case "select": {
      if (state.phase !== "question") return state;
      return { ...state, answers: { ...state.answers, cutThroughApproach: action.value }, error: null };
    }
    case "back": {
      if (state.phase !== "question" || state.stepIndex === 0) return state;
      return { ...state, stepIndex: state.stepIndex - 1, error: null };
    }
    case "next": {
      if (state.phase !== "question") return state;
      const step = STEPS[state.stepIndex]!;
      const isBlank = !state.answers[step.key]?.trim();
      if (step.kind === "select" && isBlank) {
        return { ...state, error: "Choose an option to continue." };
      }
      if (step.kind === "text" && step.required && isBlank) {
        return { ...state, error: "This answer is needed to build your statement." };
      }
      if (state.stepIndex < STEPS.length - 1) {
        return { ...state, stepIndex: state.stepIndex + 1, error: null };
      }
      // Last step answered — validate and run the deterministic assembly.
      const definition = getToolDefinition("product-positioning-builder");
      const parsed = definition.inputSchema.safeParse(state.answers);
      if (!parsed.success) {
        return { ...state, error: "Something's missing — please check every required question was answered." };
      }
      const result = definition.run(parsed.data) as ProductPositioningBuilderResult;
      return { phase: "result", result };
    }
    default:
      return state;
  }
}

export function ProductPositioningBuilderRunner() {
  const [state, dispatch] = useReducer(reducer, { phase: "start" });
  const errorRegionId = useId();
  const textInputId = useId();
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  const currentStep = state.phase === "question" ? STEPS[state.stepIndex] : undefined;
  const textValue = currentStep && currentStep.kind === "text" && state.phase === "question" ? (state.answers[currentStep.key] ?? "") : "";
  const selectedValue =
    currentStep && currentStep.kind === "select" && state.phase === "question" ? state.answers[currentStep.key] : undefined;

  const progressLabel = useMemo(() => {
    if (state.phase !== "question") return null;
    return `Question ${state.stepIndex + 1} of ${STEPS.length}`;
  }, [state]);

  if (state.phase === "start") {
    return (
      <div className="rounded-md border border-ink-200 bg-paper-raised p-6">
        <h2 className="text-lg font-semibold text-ink-900">Before you start</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-700">
          <li>Takes about 3 minutes — answer with a specific customer and outcome in mind, not &ldquo;everyone.&rdquo;</li>
          <li>Nothing is saved or sent anywhere — this runs entirely in your browser.</li>
          <li>You&apos;ll get a positioning statement and a recommended way to cut through the noise.</li>
        </ul>
        <button
          type="button"
          onClick={() => dispatch({ type: "begin" })}
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          Start building your positioning
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

        {currentStep.kind === "text" ? (
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
        ) : (
          <fieldset className="mt-3">
            <legend className="text-lg font-semibold text-ink-900">{currentStep.legend}</legend>
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
                    onChange={() => dispatch({ type: "select", value: option.value })}
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
        )}

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
      <ProductPositioningBuilderResultSummary result={state.result} onRestart={() => dispatch({ type: "restart" })} headingRef={resultHeadingRef} />
    );
  }

  return null;
}
