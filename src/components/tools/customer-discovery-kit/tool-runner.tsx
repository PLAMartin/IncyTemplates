"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import type {
  CommitmentSignal,
  CustomerDiscoveryEvidenceInput,
  CustomerDiscoveryEvidenceResult,
  EvidenceType,
  InterviewCount,
  PatternConsistency,
  QuestionStyle,
} from "@/lib/tools/customer-discovery-kit/schema";
import { CustomerDiscoveryKitResultSummary } from "@/components/tools/customer-discovery-kit/tool-result-summary";
import { RecordProgressCompletion } from "@/components/collections/record-progress";
import { customerDiscoveryKitCopySchema } from "@/lib/tools/customer-discovery-kit/copy";
import { resolveToolCopy } from "@/lib/tools/copy";

type StepKey = "interviewCount" | "questionStyle" | "evidenceType" | "commitmentSignal" | "patternConsistency";

type Step = {
  key: StepKey;
  legend: string;
  hint?: string;
  options: { value: string; label: string; description: string }[];
};

function buildSteps(copy: Record<string, string>): Step[] {
  return [
    {
      key: "interviewCount",
      legend: copy.q_interview_count_legend!,
      options: [
        { value: "fewer_than_3" satisfies InterviewCount, label: "Fewer than 3", description: "Just getting started." },
        { value: "three_to_five" satisfies InterviewCount, label: "3–5", description: "A first small round." },
        { value: "six_to_ten" satisfies InterviewCount, label: "6–10", description: "Enough for a pattern to start showing." },
        { value: "more_than_ten" satisfies InterviewCount, label: "More than 10", description: "A substantial round." },
      ],
    },
    {
      key: "questionStyle",
      legend: copy.q_question_style_legend!,
      hint: copy.q_question_style_hint || undefined,
      options: [
        {
          value: "mostly_leading" satisfies QuestionStyle,
          label: "Mostly leading",
          description: "I described my idea and asked what people thought of it.",
        },
        {
          value: "mixed" satisfies QuestionStyle,
          label: "A mix",
          description: "Some open questions, but I mentioned my idea at some point.",
        },
        {
          value: "mostly_open" satisfies QuestionStyle,
          label: "Mostly open",
          description: "I asked about their past and present, and mostly didn't mention my idea at all.",
        },
      ],
    },
    {
      key: "evidenceType",
      legend: copy.q_evidence_type_legend!,
      options: [
        {
          value: "opinions_only" satisfies EvidenceType,
          label: "Opinions only",
          description: "People told me what they think or would do, not what they've actually done.",
        },
        {
          value: "some_past_behaviour" satisfies EvidenceType,
          label: "Some past behaviour",
          description: "A few people described real things they've actually done or tried.",
        },
        {
          value: "consistent_past_behaviour" satisfies EvidenceType,
          label: "Consistent past behaviour",
          description: "Most people described real, current behaviour around this problem.",
        },
      ],
    },
    {
      key: "commitmentSignal",
      legend: copy.q_commitment_signal_legend!,
      hint: copy.q_commitment_signal_hint || undefined,
      options: [
        { value: "no_commitment" satisfies CommitmentSignal, label: "No commitment", description: "Interest, but no cost behind it." },
        {
          value: "workaround_or_effort" satisfies CommitmentSignal,
          label: "Workaround or effort",
          description: "Someone has put real time or effort into a workaround.",
        },
        {
          value: "money_or_switching_cost" satisfies CommitmentSignal,
          label: "Money or switching cost",
          description: "Someone has paid for, or switched away from, something to deal with this.",
        },
      ],
    },
    {
      key: "patternConsistency",
      legend: copy.q_pattern_consistency_legend!,
      options: [
        { value: "no_pattern" satisfies PatternConsistency, label: "No pattern yet", description: "Every conversation tells me something different." },
        {
          value: "partial_pattern" satisfies PatternConsistency,
          label: "Partial pattern",
          description: "Some overlap, but still plenty of surprises.",
        },
        {
          value: "strong_pattern" satisfies PatternConsistency,
          label: "Strong pattern",
          description: "The last few interviews confirmed the same thing with no new surprises.",
        },
      ],
    },
  ];
}

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<CustomerDiscoveryEvidenceInput>; error: string | null }
  | { phase: "result"; result: CustomerDiscoveryEvidenceResult };

type Action =
  | { type: "begin" }
  | { type: "select"; key: StepKey; value: string }
  | { type: "next" }
  | { type: "back" }
  | { type: "restart" };

function createReducer(steps: Step[], chooseOptionError: string) {
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
          return { ...state, error: chooseOptionError };
        }
        if (state.stepIndex < steps.length - 1) {
          return { ...state, stepIndex: state.stepIndex + 1, error: null };
        }
        // Last step answered — validate and run the deterministic scoring.
        const definition = getToolDefinition("customer-discovery-kit");
        const parsed = definition.inputSchema.safeParse(state.answers);
        if (!parsed.success) {
          return { ...state, error: "Something's missing — please check every question was answered." };
        }
        const result = definition.run(parsed.data) as CustomerDiscoveryEvidenceResult;
        return { phase: "result", result };
      }
      default:
        return state;
    }
  };
}

export function CustomerDiscoveryKitRunner({ copy: copyOverrides }: { copy?: Record<string, string> }) {
  const copy = useMemo(() => resolveToolCopy(customerDiscoveryKitCopySchema, copyOverrides), [copyOverrides]);
  const steps = useMemo(() => buildSteps(copy), [copy]);
  const [state, dispatch] = useReducer(createReducer(steps, copy.choose_option_error!), { phase: "start" });
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
      <div className="space-y-4">
        <RecordProgressCompletion collectionSlug="start-a-product" frameworkSlug="customer-discovery-kit" outputType="tool" />
        <CustomerDiscoveryKitResultSummary result={state.result} onRestart={() => dispatch({ type: "restart" })} headingRef={resultHeadingRef} copy={copy} />
      </div>
    );
  }

  return null;
}
