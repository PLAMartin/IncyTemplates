"use client";

import { useEffect, useState, type RefObject } from "react";
import type { MvpScoperResult } from "@/lib/tools/mvp-scoper/schema";

const CLASSIFICATION_COPY: Record<MvpScoperResult["classification"], { label: string; className: string }> = {
  keep: { label: "Keep", className: "bg-brand-100 text-brand-900" },
  defer: { label: "Defer", className: "bg-amber-100 text-amber-700" },
  remove: { label: "Remove", className: "bg-red-100 text-red-700" },
};

function resultToPlainText(result: MvpScoperResult): string {
  const classification = CLASSIFICATION_COPY[result.classification].label;
  return [
    `MVP Scoper — Scope Decider result`,
    `Classification: ${classification}${result.fakeableOverrideApplied ? " (downgraded — fake it first)" : ""}`,
    `Score: ${result.score}/100`,
    `Guidance: ${result.guidance}`,
    `Next step: ${result.nextStep}`,
  ].join("\n");
}

/**
 * Its own component, not a reuse of any earlier Tool's result summary — this is the first
 * Tool with a three-way classification badge (Keep/Defer/Remove) plus a distinct "downgraded
 * by the fakeability gate" state that needs its own visual treatment. See
 * docs/decisions/0023.
 */
export function MvpScoperResultSummary({
  result,
  onRestart,
  headingRef,
}: {
  result: MvpScoperResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const [copied, setCopied] = useState(false);
  const classification = CLASSIFICATION_COPY[result.classification];

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
        Your result: {classification.label}
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${classification.className}`}>
          {classification.label}
        </span>
        {result.fakeableOverrideApplied ? (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
            Downgraded — fake it first
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm text-ink-500">
          <span>Score</span>
          <span className="font-semibold text-ink-900">{result.score}/100</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-ink-100" role="img" aria-label={`Score: ${result.score} out of 100`}>
          <div className="h-2 rounded-full bg-brand-600" style={{ width: `${result.score}%` }} />
        </div>
      </div>

      <p className="mt-4 text-sm text-ink-700">{result.guidance}</p>

      <dl className="mt-6">
        <dt className="text-sm font-semibold text-ink-900">Next step</dt>
        <dd className="mt-1 text-sm text-ink-700">{result.nextStep}</dd>
      </dl>

      <p className="mt-6 text-xs text-ink-500">
        This is a structured read on what you reported for one feature, not a full backlog review — run it again for
        each candidate feature you&apos;re weighing.
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
          Score another feature
        </button>
      </div>
    </div>
  );
}
