"use client";

import { useEffect, useState, type RefObject } from "react";
import type { ProductPrioritisationToolResult, SchedulingStrategy } from "@/lib/tools/product-prioritisation-tool/schema";

const STRATEGY_COPY: Record<SchedulingStrategy, { label: string }> = {
  earliest_due_date: { label: "Earliest Due Date" },
  moores_algorithm: { label: "Moore's Algorithm" },
  shortest_processing_time: { label: "Shortest Processing Time" },
  weighted_processing_time: { label: "Weighted Processing Time" },
};

function resultToPlainText(result: ProductPrioritisationToolResult): string {
  const strategy = STRATEGY_COPY[result.recommendedStrategy].label;
  const lines = [`Product Prioritisation Tool — recommended strategy`, `Recommended strategy: ${strategy}`, `Why: ${result.rationale}`];
  if (result.runnerUpStrategy) {
    lines.push(`Runner-up: ${STRATEGY_COPY[result.runnerUpStrategy].label} (deciding factor: ${result.decidingFactor})`);
  }
  lines.push(`Next step: ${result.nextStep}`);
  return lines.join("\n");
}

/**
 * Reuses Pricing Your Product / Business Model Chooser / Decision Framework Picker / Customer
 * Demand Test's recommended/runner-up/deciding-factor layout (docs/decisions/0028, 0030, 0031,
 * 0033, 0034) rather than inventing a new result shape.
 */
export function ProductPrioritisationToolResultSummary({
  result,
  onRestart,
  headingRef,
}: {
  result: ProductPrioritisationToolResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const [copied, setCopied] = useState(false);
  const strategy = STRATEGY_COPY[result.recommendedStrategy];

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
        Your result: {strategy.label}
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-900">{strategy.label}</span>
      </div>

      <p className="mt-4 text-sm text-ink-700">{result.rationale}</p>

      <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {result.runnerUpStrategy ? (
          <>
            <div>
              <dt className="text-sm font-semibold text-ink-900">Runner-up</dt>
              <dd className="mt-1 text-sm text-ink-700">{STRATEGY_COPY[result.runnerUpStrategy].label}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink-900">Deciding factor</dt>
              <dd className="mt-1 text-sm text-ink-700">{result.decidingFactor}</dd>
            </div>
          </>
        ) : null}
        <div className="sm:col-span-2">
          <dt className="text-sm font-semibold text-ink-900">Next step</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.nextStep}</dd>
        </div>
      </dl>

      <p className="mt-6 text-xs text-ink-500">
        Your task list changes — revisit this whenever the shape of what you&apos;re facing changes, rather than treating one
        answer as permanent.
      </p>

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
          Choose again
        </button>
      </div>
    </div>
  );
}
