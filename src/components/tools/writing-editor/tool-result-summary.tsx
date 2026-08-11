"use client";

import { useEffect, useState, type RefObject } from "react";
import type { WritingEditorResult } from "@/lib/tools/writing-editor/schema";

function resultToPlainText(result: WritingEditorResult): string {
  const lines = ["Writing Editor — structured editing review", ""];
  for (const state of result.ruleStates) {
    lines.push(`${state.present ? "☐" : "✓"} ${state.label}${state.present ? " — still a problem" : " — already clean"}`);
  }
  lines.push("", `Fix tip: ${result.firstFixTip}`, "", result.closingNote, "", `Next step: ${result.nextStep}`);
  return lines.join("\n");
}

/**
 * Shows all five Orwell rules as a checklist (flagged/clean), not a ranked or scored result —
 * the second use of Story Builder's completeness-checklist mechanic, inverted: a checkmark
 * here means the rule is already clean, not that a required part is present. See
 * docs/decisions/0040.
 */
export function WritingEditorResultSummary({
  result,
  onRestart,
  headingRef,
}: {
  result: WritingEditorResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const [copied, setCopied] = useState(false);
  const flaggedCount = result.ruleStates.filter((state) => state.present).length;

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
        {flaggedCount === 0 ? "Clean by all five rules" : `${flaggedCount} rule${flaggedCount === 1 ? "" : "s"} still flagged`}
      </h2>

      <ul className="mt-4 space-y-3">
        {result.ruleStates.map((state) => (
          <li key={state.rule} className={`rounded-md border p-3 ${state.present ? "border-dashed border-amber-300" : "border-ink-200"}`}>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                  state.present ? "bg-amber-100 text-amber-700" : "bg-brand-100 text-brand-900"
                }`}
              >
                {state.present ? "!" : "✓"}
              </span>
              <span className="text-sm font-medium text-ink-900">{state.label}</span>
              <span className="sr-only">{state.present ? "still a problem" : "already clean"}</span>
            </div>
          </li>
        ))}
      </ul>

      <dl className="mt-6 grid grid-cols-1 gap-4">
        <div>
          <dt className="text-sm font-semibold text-ink-900">Fix tip</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.firstFixTip}</dd>
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
          Review another draft
        </button>
      </div>
    </div>
  );
}
