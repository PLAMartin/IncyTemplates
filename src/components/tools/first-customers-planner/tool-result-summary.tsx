"use client";

import { useEffect, useState, type RefObject } from "react";
import type { FirstCustomersPlannerResult } from "@/lib/tools/first-customers-planner/schema";

const FIT_COPY: Record<FirstCustomersPlannerResult["fit"], { label: string; className: string }> = {
  strong_fit: { label: "Strong fit", className: "bg-brand-100 text-brand-900" },
  worth_testing: { label: "Worth testing", className: "bg-amber-100 text-amber-700" },
  weak_fit: { label: "Weak fit", className: "bg-red-100 text-red-700" },
};

const CHANNEL_TYPE_LABEL: Record<FirstCustomersPlannerResult["channelType"], string> = {
  cold_outreach: "Cold outreach",
  content_marketing: "Content marketing",
  communities_and_forums: "Communities and forums",
  existing_network: "Existing network",
};

function resultToPlainText(result: FirstCustomersPlannerResult): string {
  const fit = FIT_COPY[result.fit].label;
  return [
    `First Customers Planner — Channel Selector result`,
    `Channel: ${CHANNEL_TYPE_LABEL[result.channelType]}`,
    `Fit score: ${result.fitScore}/100`,
    `Fit: ${fit}`,
    `Strongest factor: ${result.strongestFactor}`,
    `Weakest factor: ${result.weakestFactor}`,
    `Biggest uncertainty: ${result.biggestUncertainty}`,
    `Next step: ${result.nextStep}`,
  ].join("\n");
}

/**
 * Deliberately close in shape to Product Idea Assessor's `ToolResultSummary` (a single
 * score bar, a fit/readiness badge, strongest/weakest factors) rather than any of the
 * two-subject Tools' layouts — a closing callback now that all six flagship families use
 * the same underlying pattern. See docs/decisions/0025.
 */
export function FirstCustomersPlannerResultSummary({
  result,
  onRestart,
  headingRef,
  copy,
}: {
  result: FirstCustomersPlannerResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
  copy: Record<string, string>;
}) {
  const [copied, setCopied] = useState(false);
  const fit = FIT_COPY[result.fit];

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
        {CHANNEL_TYPE_LABEL[result.channelType]}
      </h2>

      <span className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${fit.className}`}>{fit.label}</span>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm text-ink-500">
          <span>{copy.score_label}</span>
          <span className="font-semibold text-ink-900">{result.fitScore}/100</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-ink-100" role="img" aria-label={`${copy.score_label}: ${result.fitScore} out of 100`}>
          <div className="h-2 rounded-full bg-brand-600" style={{ width: `${result.fitScore}%` }} />
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-semibold text-ink-900">{copy.strongest_factor_label}</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.strongestFactor}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-900">{copy.weakest_factor_label}</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.weakestFactor}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-900">{copy.biggest_uncertainty_label}</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.biggestUncertainty}</dd>
        </div>
        <div>
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
