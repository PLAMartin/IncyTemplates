"use client";

import { useEffect, useState, type RefObject } from "react";
import type { BusinessModel, BusinessModelChooserResult } from "@/lib/tools/business-model-chooser/schema";

const MODEL_COPY: Record<BusinessModel, { label: string }> = {
  saas: { label: "SaaS" },
  marketplace: { label: "Marketplace" },
  transactional: { label: "Transactional" },
  advertising: { label: "Advertising" },
};

function resultToPlainText(result: BusinessModelChooserResult): string {
  const model = MODEL_COPY[result.recommendedModel].label;
  const lines = [`Business Model Chooser — business model recommendation`, `Recommended model: ${model}`, `Why: ${result.rationale}`];
  if (result.runnerUpModel) {
    lines.push(`Runner-up: ${MODEL_COPY[result.runnerUpModel].label} (deciding factor: ${result.decidingFactor})`);
  }
  lines.push(`Next step: ${result.nextStep}`);
  return lines.join("\n");
}

/**
 * Reuses Pricing Your Product's recommended-model/runner-up/deciding-factor layout
 * (docs/decisions/0028, docs/decisions/0030) rather than inventing a new result shape.
 */
export function BusinessModelChooserResultSummary({
  result,
  onRestart,
  headingRef,
}: {
  result: BusinessModelChooserResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
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
      </div>

      <p className="mt-4 text-sm text-ink-700">{result.rationale}</p>

      <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {result.runnerUpModel ? (
          <>
            <div>
              <dt className="text-sm font-semibold text-ink-900">Runner-up</dt>
              <dd className="mt-1 text-sm text-ink-700">{MODEL_COPY[result.runnerUpModel].label}</dd>
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
        This is a starting recommendation based on today&apos;s answers, not a permanent choice — established companies combine
        models, but startups should focus on getting one right first.
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
