"use client";

import { useEffect, useState, type RefObject } from "react";
import type { PricingModel, PricingYourProductResult } from "@/lib/tools/pricing-your-product/schema";

const MODEL_COPY: Record<PricingModel, { label: string }> = {
  one_time: { label: "One-time purchase" },
  flat_subscription: { label: "Flat-rate subscription" },
  usage_based: { label: "Usage-based pricing" },
  tiered_subscription: { label: "Tiered subscription" },
};

function resultToPlainText(result: PricingYourProductResult): string {
  const model = MODEL_COPY[result.recommendedModel].label;
  const lines = [
    `Pricing Your Product — pricing model recommendation`,
    `Recommended model: ${model}${result.oneOffGateApplied ? " (subscription models ruled out — one-off job)" : ""}`,
    `Why: ${result.rationale}`,
  ];
  if (result.runnerUpModel) {
    lines.push(`Runner-up: ${MODEL_COPY[result.runnerUpModel].label} (deciding factor: ${result.decidingFactor})`);
  }
  lines.push(`Next step: ${result.nextStep}`);
  return lines.join("\n");
}

/**
 * The family's take on First Customers Planner / PMF Tracker's strongest-weakest reporting,
 * applied to candidate pricing models instead of scoring dimensions — a recommended model, a
 * runner-up, and the one input that most separated them. See docs/decisions/0028.
 */
export function PricingYourProductResultSummary({
  result,
  onRestart,
  headingRef,
  copy,
}: {
  result: PricingYourProductResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
  copy: Record<string, string>;
}) {
  const [copied, setCopied] = useState(false);
  const model = MODEL_COPY[result.recommendedModel];

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
        Your result: {model.label}
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-900">{model.label}</span>
        {result.oneOffGateApplied ? (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
            Subscription models ruled out — one-off job
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-sm text-ink-700">{result.rationale}</p>

      <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {result.runnerUpModel ? (
          <>
            <div>
              <dt className="text-sm font-semibold text-ink-900">{copy.result_runner_up_label}</dt>
              <dd className="mt-1 text-sm text-ink-700">{MODEL_COPY[result.runnerUpModel].label}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink-900">{copy.result_deciding_factor_label}</dt>
              <dd className="mt-1 text-sm text-ink-700">{result.decidingFactor}</dd>
            </div>
          </>
        ) : null}
        <div className="sm:col-span-2">
          <dt className="text-sm font-semibold text-ink-900">{copy.result_next_step_label}</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.nextStep}</dd>
        </div>
      </dl>

      <p className="mt-6 text-xs text-ink-500">{copy.result_disclaimer}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex min-h-11 items-center rounded-md border border-ink-200 px-4 text-sm font-medium text-ink-900 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          {copied ? copy.result_copied_label : copy.result_copy_button}
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-11 items-center rounded-md border border-ink-200 px-4 text-sm font-medium text-ink-900 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          {copy.result_restart_button}
        </button>
      </div>
    </div>
  );
}
