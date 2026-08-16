"use client";

import { useEffect, useState, type RefObject } from "react";
import type { NegotiationPrepResult, NegotiationTactic } from "@/lib/tools/negotiation-prep/schema";

const TACTIC_LABEL: Record<NegotiationTactic, string> = {
  batna: "Fallback (BATNA)",
  anchor: "Anchor",
  mesos: "Multiple offers (MESOs)",
};

function resultToPlainText(result: NegotiationPrepResult): string {
  const lines = ["Negotiation Prep — readiness check", ""];
  for (const t of result.tactics) {
    lines.push(`${t.present ? "✓" : "☐"} ${TACTIC_LABEL[t.tactic]}${t.present ? `: ${t.text}` : " — not prepared yet"}`);
  }
  lines.push("", `Tip: ${result.nextTip}`, `Next step: ${result.nextStep}`);
  return lines.join("\n");
}

/**
 * Shows all three tactics as a checklist (prepared/not prepared), not a ranked or recommended
 * result — the fourth use of Story Builder's completeness-checklist mechanic (docs/decisions/
 * 0037), same shape: the Tool checks prep, it doesn't score or pick a winner. See
 * docs/decisions/0055.
 */
export function NegotiationPrepResultSummary({
  result,
  onRestart,
  headingRef,
}: {
  result: NegotiationPrepResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const [copied, setCopied] = useState(false);
  const missingCount = result.tactics.filter((t) => !t.present).length;

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
        {missingCount === 0 ? "You're ready to negotiate" : `${missingCount} tactic${missingCount === 1 ? "" : "s"} still to prepare`}
      </h2>

      <ul className="mt-4 space-y-3">
        {result.tactics.map((t) => (
          <li key={t.tactic} className={`rounded-md border p-3 ${t.present ? "border-ink-200" : "border-dashed border-ink-300"}`}>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                  t.present ? "bg-brand-100 text-brand-900" : "bg-ink-100 text-ink-500"
                }`}
              >
                {t.present ? "✓" : "–"}
              </span>
              <span className="text-sm font-medium text-ink-900">{TACTIC_LABEL[t.tactic]}</span>
              <span className="sr-only">{t.present ? "prepared" : "not prepared yet"}</span>
            </div>
            {t.present ? <p className="mt-2 text-sm text-ink-700">{t.text}</p> : <p className="mt-2 text-sm text-ink-500">Not prepared yet.</p>}
          </li>
        ))}
      </ul>

      {result.prepSummary ? (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-ink-900">Your prep so far</h3>
          <p className="mt-2 whitespace-pre-line rounded-md border border-ink-200 bg-paper p-4 text-sm text-ink-700">{result.prepSummary}</p>
        </div>
      ) : null}

      <dl className="mt-6 grid grid-cols-1 gap-4">
        <div>
          <dt className="text-sm font-semibold text-ink-900">Tip</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.nextTip}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-900">Next step</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.nextStep}</dd>
        </div>
      </dl>

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
