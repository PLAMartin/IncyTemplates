"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import { mvpScoperCopySchema } from "@/lib/tools/mvp-scoper/copy";
import { resolveToolCopy } from "@/lib/tools/copy";
import type { BuildEffort, Fakeability, MvpScoperInput, MvpScoperResult, Necessity, RiskyQuestionRelevance } from "@/lib/tools/mvp-scoper/schema";
import { MvpScoperResultSummary } from "@/components/tools/mvp-scoper/tool-result-summary";
import { RecordProgressCompletion } from "@/components/collections/record-progress";

type StepKey = "necessity" | "riskyQuestionRelevance" | "buildEffort" | "fakeability";

type Step = {
  key: StepKey;
  legend: string;
  hint?: string;
  options: { value: string; label: string; description: string }[];
};

/**
 * Legend/hint text comes from `copy` (admin-editable, spec §14.7.1) with the schema's own
 * defaults as fallback; option label/description stay hardcoded (see mvp-scoper/copy.ts's
 * doc comment for why). `copy` is always fully resolved (every declared key present) by
 * `resolveToolCopy`, called once in the component body — this function just reads it.
 */
function buildSteps(copy: Record<string, string>): Step[] {
  return [
    {
      key: "necessity",
      legend: copy.q_necessity_legend!,
      hint: copy.q_necessity_hint || undefined,
      options: [
        { value: "nice_to_have" satisfies Necessity, label: "Nice to have", description: "Pleasant, but nobody would miss it." },
        {
          value: "helps_but_not_essential" satisfies Necessity,
          label: "Helps, but not essential",
          description: "Makes things better without it being the core value.",
        },
        {
          value: "essential_for_core_value" satisfies Necessity,
          label: "Essential for core value",
          description: "Without it, the product doesn't actually deliver its core value.",
        },
      ],
    },
    {
      key: "riskyQuestionRelevance",
      legend: copy.q_risky_legend!,
      hint: copy.q_risky_hint || undefined,
      options: [
        { value: "unrelated" satisfies RiskyQuestionRelevance, label: "Unrelated", description: "Doesn't tell you anything about the risky question." },
        {
          value: "partially_related" satisfies RiskyQuestionRelevance,
          label: "Partially related",
          description: "Touches on it, but doesn't directly answer it.",
        },
        {
          value: "directly_answers" satisfies RiskyQuestionRelevance,
          label: "Directly answers it",
          description: "This is exactly what would confirm or deny your riskiest assumption.",
        },
      ],
    },
    {
      key: "buildEffort",
      legend: copy.q_effort_legend!,
      hint: copy.q_effort_hint || undefined,
      options: [
        { value: "low" satisfies BuildEffort, label: "Low", description: "A day or two of work." },
        { value: "medium" satisfies BuildEffort, label: "Medium", description: "A real but manageable chunk of the build." },
        { value: "high" satisfies BuildEffort, label: "High", description: "A significant share of your available build time." },
      ],
    },
    {
      key: "fakeability",
      legend: copy.q_fakeability_legend!,
      hint: copy.q_fakeability_hint || undefined,
      options: [
        { value: "no" satisfies Fakeability, label: "No", description: "There's no reasonable way to fake this." },
        { value: "possibly" satisfies Fakeability, label: "Possibly", description: "Might be fakeable, but it would be awkward or limited." },
        { value: "yes_easily" satisfies Fakeability, label: "Yes, easily", description: "I could deliver this by hand without much trouble." },
      ],
    },
  ];
}

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<MvpScoperInput>; error: string | null }
  | { phase: "result"; result: MvpScoperResult };

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
        // Last step answered — validate and run the deterministic scoring.
        const definition = getToolDefinition("mvp-scoper");
        const parsed = definition.inputSchema.safeParse(state.answers);
        if (!parsed.success) {
          return { ...state, error: "Something's missing — please check every question was answered." };
        }
        const result = definition.run(parsed.data) as MvpScoperResult;
        return { phase: "result", result };
      }
      default:
        return state;
    }
  };
}

export function MvpScoperRunner({ copy: copyOverrides }: { copy?: Record<string, string> }) {
  const copy = useMemo(() => resolveToolCopy(mvpScoperCopySchema, copyOverrides), [copyOverrides]);
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
            {state.stepIndex === steps.length - 1 ? "See my result" : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "result") {
    return (
      <div className="space-y-4">
        <RecordProgressCompletion collectionSlug="start-a-product" frameworkSlug="mvp-scoper" outputType="tool" />
        <MvpScoperResultSummary result={state.result} onRestart={() => dispatch({ type: "restart" })} headingRef={resultHeadingRef} />
      </div>
    );
  }

  return null;
}
