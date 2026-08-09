"use client";

import { useEffect, useState, type RefObject } from "react";
import type { CustomerDiscoveryEvidenceResult } from "@/lib/tools/customer-discovery-kit/schema";

const SIGNAL_STRENGTH_COPY: Record<CustomerDiscoveryEvidenceResult["signalStrength"], { label: string; className: string }> = {
  strong_signal: { label: "Strong signal", className: "bg-brand-100 text-brand-900" },
  mixed_signal: { label: "Mixed signal — keep going", className: "bg-amber-100 text-amber-700" },
  weak_signal: { label: "Weak signal — not enough yet", className: "bg-red-100 text-red-700" },
};

const BIAS_RISK_COPY: Record<CustomerDiscoveryEvidenceResult["biasRisk"], { label: string; className: string }> = {
  low: { label: "Low bias risk", className: "bg-brand-100 text-brand-900" },
  moderate: { label: "Moderate bias risk", className: "bg-amber-100 text-amber-700" },
  high: { label: "High bias risk", className: "bg-red-100 text-red-700" },
};

function resultToPlainText(result: CustomerDiscoveryEvidenceResult): string {
  return [
    `Customer Discovery Kit — Evidence Analyser result`,
    `Evidence strength score: ${result.evidenceStrengthScore}/100`,
    `Signal: ${SIGNAL_STRENGTH_COPY[result.signalStrength].label}`,
    `Bias risk: ${BIAS_RISK_COPY[result.biasRisk].label}`,
    `Strongest area: ${result.strongestArea}`,
    `Weakest area: ${result.weakestArea}`,
    `Biggest uncertainty: ${result.biggestUncertainty}`,
    `Next evidence action: ${result.nextEvidenceAction}`,
  ].join("\n");
}

/**
 * Deliberately its own component rather than a reuse of `@/components/tools/tool-result-
 * summary` (Product Idea Assessor's) — that component is concretely typed to
 * `ProductIdeaAssessorResult`, and this tool's result shape carries a second, independent
 * badge (`biasRisk`, not just a single readiness verdict) that doesn't fit the same layout.
 * See docs/decisions/0021.
 */
export function CustomerDiscoveryKitResultSummary({
  result,
  onRestart,
  headingRef,
}: {
  result: CustomerDiscoveryEvidenceResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const [copied, setCopied] = useState(false);
  const signal = SIGNAL_STRENGTH_COPY[result.signalStrength];
  const bias = BIAS_RISK_COPY[result.biasRisk];

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
        Your result
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${signal.className}`}>
          {signal.label}
        </span>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${bias.className}`}>
          {bias.label}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm text-ink-500">
          <span>Evidence strength score</span>
          <span className="font-semibold text-ink-900">{result.evidenceStrengthScore}/100</span>
        </div>
        <div
          className="mt-1 h-2 rounded-full bg-ink-100"
          role="img"
          aria-label={`Evidence strength score: ${result.evidenceStrengthScore} out of 100`}
        >
          <div className="h-2 rounded-full bg-brand-600" style={{ width: `${result.evidenceStrengthScore}%` }} />
        </div>
        {result.biasRisk === "high" ? (
          <p className="mt-2 text-sm text-red-700">
            This score is capped — mostly leading questions mean the pattern above can&apos;t be trusted yet, whatever
            the other answers said.
          </p>
        ) : null}
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-semibold text-ink-900">Strongest area</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.strongestArea}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-900">Weakest area</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.weakestArea}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-900">Biggest uncertainty</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.biggestUncertainty}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-900">Next evidence action</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.nextEvidenceAction}</dd>
        </div>
      </dl>

      <p className="mt-6 text-xs text-ink-500">
        This score is a structured read on the interviews you reported, not a guarantee anyone will buy anything —
        see it as a prompt for what to check next, not a verdict.
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
          Start again
        </button>
      </div>
    </div>
  );
}
