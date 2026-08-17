"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import { productPositioningBuilderCopySchema } from "@/lib/tools/product-positioning-builder/copy";
import { resolveToolCopy } from "@/lib/tools/copy";
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
// Legend/placeholder/hint text comes from `copy` (admin-editable, spec §14.7.1); select
// option label/description stay hardcoded (see this file's copy.ts doc comment).
function buildSteps(copy: Record<string, string>): Step[] {
  return [
  {
    kind: "text",
    key: "idealCustomer",
    required: true,
    legend: copy.q_ideal_customer_legend!,
    placeholder: copy.q_ideal_customer_placeholder!,
    hint: copy.q_ideal_customer_hint!,
  },
  {
    kind: "text",
    key: "desiredAction",
    required: true,
    legend: copy.q_desired_action_legend!,
    placeholder: copy.q_desired_action_placeholder!,
    hint: copy.q_desired_action_hint!,
  },
  {
    kind: "text",
    key: "desiredOutcome",
    required: true,
    legend: copy.q_desired_outcome_legend!,
    placeholder: copy.q_desired_outcome_placeholder!,
    hint: copy.q_desired_outcome_hint!,
  },
  {
    kind: "text",
    key: "admiredIdentity",
    required: false,
    legend: copy.q_admired_identity_legend!,
    placeholder: copy.q_admired_identity_placeholder!,
    hint: copy.q_admired_identity_hint!,
  },
  {
    kind: "select",
    key: "cutThroughApproach",
    legend: copy.q_cut_through_legend!,
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
}

// Key/kind/required/order only — reducer validation logic doesn't need copy-driven legend/placeholder/hint text.
const STEP_META: { key: TextKey | "cutThroughApproach"; kind: "text" | "select"; required: boolean }[] = [
  { key: "idealCustomer", kind: "text", required: true },
  { key: "desiredAction", kind: "text", required: true },
  { key: "desiredOutcome", kind: "text", required: true },
  { key: "admiredIdentity", kind: "text", required: false },
  { key: "cutThroughApproach", kind: "select", required: true },
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
      const step = STEP_META[state.stepIndex]!;
      const isBlank = !state.answers[step.key]?.trim();
      if (step.kind === "select" && isBlank) {
        return { ...state, error: "Choose an option to continue." };
      }
      if (step.kind === "text" && step.required && isBlank) {
        return { ...state, error: "This answer is needed to build your statement." };
      }
      if (state.stepIndex < STEP_META.length - 1) {
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

export function ProductPositioningBuilderRunner({ copy: copyOverrides }: { copy?: Record<string, string> }) {
  const copy = useMemo(() => resolveToolCopy(productPositioningBuilderCopySchema, copyOverrides), [copyOverrides]);
  const steps = useMemo(() => buildSteps(copy), [copy]);
  const [state, dispatch] = useReducer(reducer, { phase: "start" });
  const errorRegionId = useId();
  const textInputId = useId();
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  const currentStep = state.phase === "question" ? steps[state.stepIndex] : undefined;
  const textValue = currentStep && currentStep.kind === "text" && state.phase === "question" ? (state.answers[currentStep.key] ?? "") : "";
  const selectedValue =
    currentStep && currentStep.kind === "select" && state.phase === "question" ? state.answers[currentStep.key] : undefined;

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
            {state.stepIndex === steps.length - 1 ? "See my result" : "Continue"}
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
