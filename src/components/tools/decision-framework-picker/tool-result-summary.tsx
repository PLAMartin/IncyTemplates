"use client";

import { useEffect, useState, type RefObject } from "react";
import type { DecisionFramework, DecisionFrameworkPickerResult } from "@/lib/tools/decision-framework-picker/schema";

const FRAMEWORK_COPY: Record<DecisionFramework, { label: string }> = {
  six_thinking_hats: { label: "Six Thinking Hats" },
  first_principles: { label: "First Principles Thinking" },
  razors: { label: "Razors (rules of thumb)" },
  boundary_rule: { label: "Boundary Rule" },
};

function resultToPlainText(result: DecisionFrameworkPickerResult): string {
  const framework = FRAMEWORK_COPY[result.recommendedFramework].label;
  const lines = [`Decision Framework Picker — recommendation`, `Recommended framework: ${framework}`, `Why: ${result.rationale}`];
  if (result.runnerUpFramework) {
    lines.push(`Runner-up: ${FRAMEWORK_COPY[result.runnerUpFramework].label} (deciding factor: ${result.decidingFactor})`);
  }
  lines.push(`Next step: ${result.nextStep}`);
  return lines.join("\n");
}

/**
 * Reuses Pricing Your Product / Business Model Chooser's recommended/runner-up/deciding-factor
 * layout (docs/decisions/0028, 0030, 0031) rather than inventing a new result shape.
 */
export function DecisionFrameworkPickerResultSummary({
  result,
  onRestart,
  headingRef,
  copy,
}: {
  result: DecisionFrameworkPickerResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
  copy: Record<string, string>;
}) {
  const [copied, setCopied] = useState(false);
  const framework = FRAMEWORK_COPY[result.recommendedFramework];

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
        {copy.result_heading_prefix}
        {framework.label}
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-900">{framework.label}</span>
      </div>

      <p className="mt-4 text-sm text-ink-700">{result.rationale}</p>

      <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {result.runnerUpFramework ? (
          <>
            <div>
              <dt className="text-sm font-semibold text-ink-900">{copy.runner_up_label}</dt>
              <dd className="mt-1 text-sm text-ink-700">{FRAMEWORK_COPY[result.runnerUpFramework].label}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink-900">{copy.deciding_factor_label}</dt>
              <dd className="mt-1 text-sm text-ink-700">{result.decidingFactor}</dd>
            </div>
          </>
        ) : null}
        <div className="sm:col-span-2">
          <dt className="text-sm font-semibold text-ink-900">{copy.next_step_label}</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.nextStep}</dd>
        </div>
      </dl>

      <p className="mt-6 text-xs text-ink-500">{copy.disclaimer}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex min-h-11 items-center rounded-md border border-ink-200 px-4 text-sm font-medium text-ink-900 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          {copied ? copy.copied_label : copy.copy_result_label}
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-11 items-center rounded-md border border-ink-200 px-4 text-sm font-medium text-ink-900 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          {copy.restart_label}
        </button>
      </div>
    </div>
  );
}
