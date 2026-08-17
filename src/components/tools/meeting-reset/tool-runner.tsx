"use client";

import { useId, useMemo, useReducer, useRef } from "react";
import { getToolDefinition } from "@/lib/tools/registry";
import { meetingResetCopySchema } from "@/lib/tools/meeting-reset/copy";
import { resolveToolCopy } from "@/lib/tools/copy";
import type { MeetingResetInput, MeetingResetResult } from "@/lib/tools/meeting-reset/schema";
import { MeetingResetResultSummary } from "@/components/tools/meeting-reset/tool-result-summary";

type StepKey = "purposeClarity" | "interactionType" | "decisionNeeded" | "attendeeNecessity";

type Step = {
  key: StepKey;
  legend: string;
  hint?: string;
  options: { value: string; label: string; description: string }[];
};

function buildSteps(copy: Record<string, string>): Step[] {
  return [
    {
      key: "purposeClarity",
      legend: copy.q_purpose_legend!,
      hint: copy.q_purpose_hint || undefined,
      options: [
        { value: "yes_a_clear_specific_purpose", label: "Yes, a clear specific purpose", description: "You could state it in one sentence." },
        { value: "vague_or_habitual", label: "Vague or habitual", description: "It's more \"we always meet\" than a stated reason." },
      ],
    },
    {
      key: "interactionType",
      legend: copy.q_interaction_legend!,
      hint: copy.q_interaction_hint || undefined,
      options: [
        {
          value: "spaghetti_many_people_need_to_discuss",
          label: "Many people need to discuss it together",
          description: "Real back-and-forth between several participants.",
        },
        {
          value: "star_mostly_one_way_or_one_on_one",
          label: "Mostly one-way, or one-on-one",
          description: "One person broadcasting, or a conversation between two people.",
        },
      ],
    },
    {
      key: "decisionNeeded",
      legend: copy.q_decision_legend!,
      hint: copy.q_decision_hint || undefined,
      options: [
        { value: "yes_a_decision_or_alignment_is_needed", label: "Yes, a decision or alignment is needed", description: "Something needs to be agreed collectively." },
        { value: "no_just_sharing_information", label: "No, just sharing information", description: "It's an update, not a decision." },
      ],
    },
    {
      key: "attendeeNecessity",
      legend: copy.q_attendee_legend!,
      hint: copy.q_attendee_hint || undefined,
      options: [
        { value: "everyone_invited_is_essential", label: "Yes, everyone is essential", description: "Each person's contribution is needed to reach the purpose." },
        { value: "some_attendees_dont_need_to_be_there", label: "No, some don't need to be there", description: "A few people could safely skip this one." },
      ],
    },
  ];
}

type State =
  | { phase: "start" }
  | { phase: "question"; stepIndex: number; answers: Partial<MeetingResetInput>; error: string | null }
  | { phase: "result"; result: MeetingResetResult };

type Action =
  | { type: "begin" }
  | { type: "select"; key: StepKey; value: string }
  | { type: "next" }
  | { type: "back" }
  | { type: "restart" };

function createReducer(steps: Step[], errors: { chooseOption: string; missing: string }) {
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
          return { ...state, error: errors.chooseOption };
        }
        if (state.stepIndex < steps.length - 1) {
          return { ...state, stepIndex: state.stepIndex + 1, error: null };
        }
        // Last step answered — validate and run the deterministic diagnosis.
        const definition = getToolDefinition("meeting-reset");
        const parsed = definition.inputSchema.safeParse(state.answers);
        if (!parsed.success) {
          return { ...state, error: errors.missing };
        }
        const result = definition.run(parsed.data) as MeetingResetResult;
        return { phase: "result", result };
      }
      default:
        return state;
    }
  };
}

export function MeetingResetRunner({ copy: copyOverrides }: { copy?: Record<string, string> }) {
  const copy = useMemo(() => resolveToolCopy(meetingResetCopySchema, copyOverrides), [copyOverrides]);
  const steps = useMemo(() => buildSteps(copy), [copy]);
  const [state, dispatch] = useReducer(
    createReducer(steps, { chooseOption: copy.error_choose_option!, missing: copy.error_missing! }),
    { phase: "start" },
  );
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
            {copy.back_button}
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "next" })}
            aria-describedby={state.error ? errorRegionId : undefined}
            className="inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-focus-ring"
          >
            {state.stepIndex === steps.length - 1 ? copy.final_step_button : copy.continue_button}
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "result") {
    return (
      <MeetingResetResultSummary result={state.result} onRestart={() => dispatch({ type: "restart" })} headingRef={resultHeadingRef} copy={copy} />
    );
  }

  return null;
}
