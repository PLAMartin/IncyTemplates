"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import { productNamingSystemCopySchema } from "@/lib/tools/product-naming-system/copy";
import { resolveToolCopy } from "@/lib/tools/copy";
import type { Availability, ProductNamingSystemInput, ProductNamingSystemResult, Rating } from "@/lib/tools/product-naming-system/schema";
import { ProductNamingSystemResultSummary } from "@/components/tools/product-naming-system/tool-result-summary";

type StepKey =
  | "nameAMemorability"
  | "nameAClarity"
  | "nameADistinctiveness"
  | "nameAAvailability"
  | "nameBMemorability"
  | "nameBClarity"
  | "nameBDistinctiveness"
  | "nameBAvailability";

type Step = {
  key: StepKey;
  legend: string;
  hint?: string;
  options: { value: string; label: string; description: string }[];
};

const RATING_OPTIONS = (dimension: "memorable" | "clear" | "distinct") => [
  { value: "low" satisfies Rating, label: "Low", description: `Not very ${dimension}.` },
  { value: "medium" satisfies Rating, label: "Medium", description: `Reasonably ${dimension}.` },
  { value: "high" satisfies Rating, label: "High", description: `Genuinely ${dimension}.` },
];

const AVAILABILITY_OPTIONS = [
  { value: "taken_everywhere" satisfies Availability, label: "Taken everywhere", description: "Domain, socials and similar trademarks are all gone." },
  { value: "partially_available" satisfies Availability, label: "Partially available", description: "Some of what you need is free, some isn't." },
  { value: "fully_available" satisfies Availability, label: "Fully available", description: "Domain, socials and trademark search all look clear." },
];

/** Question phrasing comes from `copy` (admin-editable, spec §14.7.1); the "Name A:"/"Name B:" prefix and option labels/descriptions stay hardcoded (see this file's copy.ts doc comment). */
function nameSteps(name: "A" | "B", copy: Record<string, string>): Step[] {
  const prefix = `Name ${name}:`;
  return [
    {
      key: (name === "A" ? "nameAMemorability" : "nameBMemorability") as StepKey,
      legend: `${prefix} ${copy.q_memorability_legend}`,
      options: RATING_OPTIONS("memorable"),
    },
    {
      key: (name === "A" ? "nameAClarity" : "nameBClarity") as StepKey,
      legend: `${prefix} ${copy.q_clarity_legend}`,
      options: RATING_OPTIONS("clear"),
    },
    {
      key: (name === "A" ? "nameADistinctiveness" : "nameBDistinctiveness") as StepKey,
      legend: `${prefix} ${copy.q_distinctiveness_legend}`,
      options: RATING_OPTIONS("distinct"),
    },
    {
      key: (name === "A" ? "nameAAvailability" : "nameBAvailability") as StepKey,
      legend: `${prefix} ${copy.q_availability_legend}`,
      hint: copy.q_availability_hint || undefined,
      options: AVAILABILITY_OPTIONS,
    },
  ];
}

function buildSteps(copy: Record<string, string>): Step[] {
  return [...nameSteps("A", copy), ...nameSteps("B", copy)];
}

// Keys/order/length only — reducer logic doesn't need copy-driven legend/hint text.
const STEP_KEYS: StepKey[] = [
  "nameAMemorability",
  "nameAClarity",
  "nameADistinctiveness",
  "nameAAvailability",
  "nameBMemorability",
  "nameBClarity",
  "nameBDistinctiveness",
  "nameBAvailability",
];

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<ProductNamingSystemInput>; error: string | null }
  | { phase: "result"; result: ProductNamingSystemResult };

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
      const stepKey = STEP_KEYS[state.stepIndex]!;
      if (!state.answers[stepKey]) {
        return { ...state, error: "Choose an option to continue." };
      }
      if (state.stepIndex < STEP_KEYS.length - 1) {
        return { ...state, stepIndex: state.stepIndex + 1, error: null };
      }
      // Last step answered — validate and run the deterministic scoring.
      const definition = getToolDefinition("product-naming-system");
      const parsed = definition.inputSchema.safeParse(state.answers);
      if (!parsed.success) {
        return { ...state, error: "Something's missing — please check every question was answered." };
      }
      const result = definition.run(parsed.data) as ProductNamingSystemResult;
      return { phase: "result", result };
    }
    default:
      return state;
  }
}

export function ProductNamingSystemRunner({ copy: copyOverrides }: { copy?: Record<string, string> }) {
  const copy = useMemo(() => resolveToolCopy(productNamingSystemCopySchema, copyOverrides), [copyOverrides]);
  const steps = useMemo(() => buildSteps(copy), [copy]);
  const [state, dispatch] = useReducer(reducer, { phase: "start" });
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
    return <ProductNamingSystemResultSummary result={state.result} onRestart={() => dispatch({ type: "restart" })} headingRef={resultHeadingRef} />;
  }

  return null;
}
