"use client";

import { useEffect, useState, type RefObject } from "react";
import type { CustomerDemandTestResult, PretotypeTest } from "@/lib/tools/customer-demand-test/schema";

const TEST_COPY: Record<PretotypeTest, { label: string }> = {
  fake_door_test: { label: "Fake Door Test" },
  wizard_of_oz: { label: "Wizard of Oz" },
  youtube_mvp: { label: "YouTube MVP" },
  the_infiltrator: { label: "The Infiltrator" },
};

function resultToPlainText(result: CustomerDemandTestResult): string {
  const test = TEST_COPY[result.recommendedTest].label;
  const lines = [`Customer Demand Test — recommended test`, `Recommended test: ${test}`, `Why: ${result.rationale}`];
  if (result.runnerUpTest) {
    lines.push(`Runner-up: ${TEST_COPY[result.runnerUpTest].label} (deciding factor: ${result.decidingFactor})`);
  }
  lines.push(`Next step: ${result.nextStep}`);
  return lines.join("\n");
}

/**
 * Reuses Pricing Your Product / Business Model Chooser / Decision Framework Picker's
 * recommended/runner-up/deciding-factor layout (docs/decisions/0028, 0030, 0031, 0033) rather
 * than inventing a new result shape.
 */
export function CustomerDemandTestResultSummary({
  result,
  onRestart,
  headingRef,
}: {
  result: CustomerDemandTestResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const [copied, setCopied] = useState(false);
  const test = TEST_COPY[result.recommendedTest];

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
        Your result: {test.label}
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-900">{test.label}</span>
      </div>

      <p className="mt-4 text-sm text-ink-700">{result.rationale}</p>

      <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {result.runnerUpTest ? (
          <>
            <div>
              <dt className="text-sm font-semibold text-ink-900">Runner-up</dt>
              <dd className="mt-1 text-sm text-ink-700">{TEST_COPY[result.runnerUpTest].label}</dd>
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
        Don&apos;t ask people if they&apos;d buy — see if they do. Measure real behaviour (clicks, signups, engagement), not opinions.
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
