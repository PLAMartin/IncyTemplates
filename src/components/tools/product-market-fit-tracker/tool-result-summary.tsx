"use client";

import { useEffect, useState, type RefObject } from "react";
import type { ProductMarketFitTrackerResult } from "@/lib/tools/product-market-fit-tracker/schema";

const FIT_COPY: Record<ProductMarketFitTrackerResult["fit"], { label: string; className: string }> = {
  strong_fit: { label: "Strong fit", className: "bg-brand-100 text-brand-900" },
  early_signal: { label: "Early signal", className: "bg-amber-100 text-amber-700" },
  no_fit: { label: "No fit yet", className: "bg-red-100 text-red-700" },
};

function resultToPlainText(result: ProductMarketFitTrackerResult): string {
  const fit = FIT_COPY[result.fit].label;
  return [
    `Product/Market Fit Tracker — PMF Score Checker result`,
    `Fit: ${fit}${result.disappointmentGateApplied ? " (capped — core disappointment signal is missing)" : ""}`,
    `Fit score: ${result.fitScore}/100`,
    `Strongest signal: ${result.strongestFactor}`,
    `Weakest signal: ${result.weakestFactor}`,
    `Biggest uncertainty: ${result.biggestUncertainty}`,
    `Next step: ${result.nextStep}`,
  ].join("\n");
}

/**
 * Combines MVP Scoper's gate-badge treatment (a distinct "capped" state alongside the main
 * verdict badge) with First Customers Planner's strongest/weakest `<dl>` — no earlier family
 * needed both a hard gate and a strongest/weakest breakdown at once. See
 * docs/decisions/0027.
 */
export function ProductMarketFitTrackerResultSummary({
  result,
  onRestart,
  headingRef,
}: {
  result: ProductMarketFitTrackerResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
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
        Your result: {fit.label}
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${fit.className}`}>{fit.label}</span>
        {result.disappointmentGateApplied ? (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
            Capped — core signal missing
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm text-ink-500">
          <span>Fit score</span>
          <span className="font-semibold text-ink-900">{result.fitScore}/100</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-ink-100" role="img" aria-label={`Fit score: ${result.fitScore} out of 100`}>
          <div className="h-2 rounded-full bg-brand-600" style={{ width: `${result.fitScore}%` }} />
        </div>
      </div>

      <p className="mt-4 text-sm text-ink-700">{result.guidance}</p>

      <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-semibold text-ink-900">Strongest signal</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.strongestFactor}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-900">Weakest signal</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.weakestFactor}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-sm font-semibold text-ink-900">Biggest uncertainty</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.biggestUncertainty}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-sm font-semibold text-ink-900">Next step</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.nextStep}</dd>
        </div>
      </dl>

      <p className="mt-6 text-xs text-ink-500">
        This is a snapshot from what you reported today, not a permanent verdict — product-market fit moves, so it&apos;s
        worth checking again on a regular cadence rather than once.
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
          Check fit again
        </button>
      </div>
    </div>
  );
}
