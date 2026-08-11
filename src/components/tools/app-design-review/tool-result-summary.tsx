"use client";

import { useEffect, useState, type RefObject } from "react";
import type { AppDesignReviewResult } from "@/lib/tools/app-design-review/schema";

function resultToPlainText(result: AppDesignReviewResult): string {
  const lines = ["App Design Review — self-assessment", ""];
  for (const state of result.principleStates) {
    lines.push(`${state.present ? "✓" : "☐"} ${state.label}${state.present ? " — already there" : " — not yet"}`);
  }
  lines.push("", `Tip: ${result.firstTip}`, "", result.closingNote, "", `Next step: ${result.nextStep}`);
  return lines.join("\n");
}

/**
 * Shows all ten Dieter Rams principles as a checklist (present/missing), not a ranked or
 * scored result — the third use of Story Builder's completeness-checklist mechanic, back to
 * its original polarity: a checkmark here means the principle is already there, the same
 * direction as Story Builder rather than Writing Editor's inverted one. See
 * docs/decisions/0041.
 */
export function AppDesignReviewResultSummary({
  result,
  onRestart,
  headingRef,
}: {
  result: AppDesignReviewResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const [copied, setCopied] = useState(false);
  const missingCount = result.principleStates.filter((state) => !state.present).length;

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
        {missingCount === 0 ? "All ten principles are there" : `${missingCount} principle${missingCount === 1 ? "" : "s"} still missing`}
      </h2>

      <ul className="mt-4 space-y-3">
        {result.principleStates.map((state) => (
          <li key={state.principle} className={`rounded-md border p-3 ${state.present ? "border-ink-200" : "border-dashed border-amber-300"}`}>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                  state.present ? "bg-brand-100 text-brand-900" : "bg-amber-100 text-amber-700"
                }`}
              >
                {state.present ? "✓" : "!"}
              </span>
              <span className="text-sm font-medium text-ink-900">{state.label}</span>
              <span className="sr-only">{state.present ? "already there" : "not yet"}</span>
            </div>
          </li>
        ))}
      </ul>

      <dl className="mt-6 grid grid-cols-1 gap-4">
        <div>
          <dt className="text-sm font-semibold text-ink-900">Tip</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.firstTip}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-900">Next step</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.nextStep}</dd>
        </div>
      </dl>

      <p className="mt-6 text-xs text-ink-500">{result.closingNote}</p>

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
          Review another product
        </button>
      </div>
    </div>
  );
}
