"use client";

import { useEffect, useState, type RefObject } from "react";
import type { CutThroughTactic, ProductPositioningBuilderResult } from "@/lib/tools/product-positioning-builder/schema";

const TACTIC_COPY: Record<CutThroughTactic, { label: string }> = {
  scary: { label: "Scary" },
  strange: { label: "Strange" },
  sexy: { label: "Sexy" },
  free_gift: { label: "Free gift" },
  familiar: { label: "Familiar" },
};

function resultToPlainText(result: ProductPositioningBuilderResult): string {
  const tactic = TACTIC_COPY[result.recommendedTactic].label;
  return [
    `Product Positioning Builder — your statement`,
    `Positioning statement: ${result.positioningStatement}`,
    `Recommended cut-through tactic: ${tactic}`,
    `Why: ${result.tacticExplanation}`,
    `Next step: ${result.nextStep}`,
  ].join("\n");
}

/**
 * Leads with the assembled positioning statement (the Tool's headline output, spec v4 §37's
 * "statement builder") with the recommended cut-through tactic as supporting detail, rather
 * than the recommended-candidate-first layout every scoring-matrix Tool uses — there's no
 * "runner-up" here, just one direct-lookup recommendation. See docs/decisions/0032.
 */
export function ProductPositioningBuilderResultSummary({
  result,
  onRestart,
  headingRef,
}: {
  result: ProductPositioningBuilderResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const [copied, setCopied] = useState(false);
  const tactic = TACTIC_COPY[result.recommendedTactic];

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
        Your positioning statement
      </h2>

      <p className="mt-4 rounded-md border border-ink-200 bg-paper p-4 text-lg text-ink-900">{result.positioningStatement}</p>

      <dl className="mt-6 grid grid-cols-1 gap-4">
        <div>
          <dt className="text-sm font-semibold text-ink-900">Recommended cut-through tactic</dt>
          <dd className="mt-1">
            <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-900">{tactic.label}</span>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-900">Why</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.tacticExplanation}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-900">Next step</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.nextStep}</dd>
        </div>
      </dl>

      <p className="mt-6 text-xs text-ink-500">
        This is a starting statement, not a finished tagline — expect to sharpen the wording once you&apos;ve tested it on real
        prospective customers.
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
