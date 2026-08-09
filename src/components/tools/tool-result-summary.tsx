"use client";

import { useEffect, useState, type RefObject } from "react";
import type { ProductIdeaAssessorResult } from "@/lib/tools/product-idea-assessor/schema";

const READINESS_COPY: Record<ProductIdeaAssessorResult["overallReadiness"], { label: string; className: string }> = {
  ready_to_proceed: { label: "Ready to proceed", className: "bg-brand-100 text-brand-900" },
  gather_more_evidence: { label: "Gather more evidence first", className: "bg-amber-100 text-amber-700" },
  high_risk_pause: { label: "High risk — pause before committing", className: "bg-red-100 text-red-700" },
};

const CLASSIFICATION_LABEL: Record<ProductIdeaAssessorResult["classification"], string> = {
  copy: "Copy",
  improve: "Improve",
  differentiate: "Differentiate",
};

function resultToPlainText(result: ProductIdeaAssessorResult): string {
  const readiness = READINESS_COPY[result.overallReadiness].label;
  return [
    `Product Idea Assessor result`,
    `Classification: ${CLASSIFICATION_LABEL[result.classification]}`,
    `Evidence quality score: ${result.evidenceQualityScore}/100`,
    `Readiness: ${readiness}`,
    `Strongest area: ${result.strongestArea}`,
    `Weakest area: ${result.weakestArea}`,
    `Biggest uncertainty: ${result.biggestUncertainty}`,
    `Next evidence action: ${result.nextEvidenceAction}`,
  ].join("\n");
}

/**
 * Generic-enough result renderer to reuse for a second Tool later (spec §12.5's
 * "at least three Tools demonstrate a stable pattern" before generalising further) —
 * but concretely typed to Product Idea Assessor's result shape for now rather than a
 * speculative generic shape no second Tool exists yet to validate.
 */
export function ToolResultSummary({
  result,
  onRestart,
  headingRef,
}: {
  result: ProductIdeaAssessorResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const [copied, setCopied] = useState(false);
  const readiness = READINESS_COPY[result.overallReadiness];

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
        Your result: {CLASSIFICATION_LABEL[result.classification]}
      </h2>

      <span className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${readiness.className}`}>
        {readiness.label}
      </span>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm text-ink-500">
          <span>Evidence quality score</span>
          <span className="font-semibold text-ink-900">{result.evidenceQualityScore}/100</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-ink-100" role="img" aria-label={`Evidence quality score: ${result.evidenceQualityScore} out of 100`}>
          <div className="h-2 rounded-full bg-brand-600" style={{ width: `${result.evidenceQualityScore}%` }} />
        </div>
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
        This score is a structured read on the evidence you reported, not a guarantee of commercial success — see it
        as a prompt for what to check next, not a verdict.
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
