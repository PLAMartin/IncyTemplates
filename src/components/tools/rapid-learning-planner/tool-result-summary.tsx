"use client";

import { useEffect, useState, type RefObject } from "react";
import type { RapidLearningPlannerResult } from "@/lib/tools/rapid-learning-planner/schema";

const STEP_LABEL: Record<string, string> = {
  deconstruction: "Deconstruction",
  selection: "Selection",
  sequencing: "Sequencing",
  stakes: "Stakes",
};

function resultToPlainText(result: RapidLearningPlannerResult): string {
  const lines = ["Rapid Learning Plan Check", ""];
  for (const state of result.steps) {
    lines.push(`${state.present ? "✓" : "☐"} ${STEP_LABEL[state.step]}${state.present ? `: ${state.text}` : " — not planned yet."}`);
  }
  lines.push("", `Tip: ${result.nextTip}`, "", `Next step: ${result.nextStep}`);
  return lines.join("\n");
}

/**
 * Shows all four DSSS steps as a checklist (present/missing), not a ranked or scored result —
 * the sixth use of Story Builder's completeness-checklist mechanic, same free-text-fields
 * shape as Negotiation Prep (docs/decisions/0055). See docs/decisions/0060.
 */
export function RapidLearningPlannerResultSummary({
  result,
  onRestart,
  headingRef,
}: {
  result: RapidLearningPlannerResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const [copied, setCopied] = useState(false);
  const missingCount = result.steps.filter((s) => !s.present).length;

  useEffect(() => {
    // Spec §10.6/§32.4: move focus to the result on completion so screen-reader users get
    // an explicit announcement rather than silence after the last question.
    headingRef.current?.focus();
  }, [headingRef]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(resultToPlainText(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Clipboard access can be denied/unavailable — fail quietly, the result text is
      // still fully visible on screen to copy manually.
    }
  }

  return (
    <div className="rounded-md border border-ink-200 bg-paper-raised p-6" role="region" aria-label="Your result">
      <h2 ref={headingRef} tabIndex={-1} className="font-serif text-2xl font-semibold text-ink-900 outline-none">
        {missingCount === 0 ? "Your plan is ready" : `${missingCount} step${missingCount === 1 ? "" : "s"} still to plan`}
      </h2>

      <dl className="mt-4 space-y-4">
        {result.steps.map((state) => (
          <div key={state.step} className={`rounded-md border p-3 ${state.present ? "border-ink-200" : "border-dashed border-amber-300"}`}>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                  state.present ? "bg-brand-100 text-brand-900" : "bg-amber-100 text-amber-700"
                }`}
              >
                {state.present ? "✓" : "!"}
              </span>
              <dt className="text-sm font-medium text-ink-900">{STEP_LABEL[state.step]}</dt>
            </div>
            <dd className="mt-1 text-sm text-ink-700">{state.present ? state.text : "Not planned yet."}</dd>
          </div>
        ))}
      </dl>

      <dl className="mt-6 grid grid-cols-1 gap-4">
        <div>
          <dt className="text-sm font-semibold text-ink-900">Tip</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.nextTip}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-900">Next step</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.nextStep}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex min-h-11 items-center rounded-md border border-ink-200 px-4 text-sm font-medium text-ink-900 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          {copied ? "Copied" : "Copy result"}
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-11 items-center rounded-md border border-ink-200 px-4 text-sm font-medium text-ink-900 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          Check another skill
        </button>
      </div>
    </div>
  );
}
