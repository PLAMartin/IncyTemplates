"use client";

import { useEffect, useState, type RefObject } from "react";
import type { PatedElement, StoryBuilderResult } from "@/lib/tools/story-builder/schema";

const ELEMENT_LABEL: Record<PatedElement, string> = {
  place: "Place",
  action: "Action",
  thought: "Thought",
  emotion: "Emotion (shown)",
  dialogue: "Dialogue",
};

function resultToPlainText(result: StoryBuilderResult): string {
  const lines = ["Story Builder — structure check", ""];
  for (const el of result.elements) {
    lines.push(`${el.present ? "✓" : "☐"} ${ELEMENT_LABEL[el.element]}${el.present ? `: ${el.text}` : " — missing"}`);
  }
  lines.push("", `Tip: ${result.nextTip}`, `Next step: ${result.nextStep}`);
  return lines.join("\n");
}

/**
 * Shows all five story-spine elements as a checklist (present/missing), not a ranked or
 * recommended result — the Tool checks structure, it doesn't score or pick a winner. See
 * docs/decisions/0037.
 */
export function StoryBuilderResultSummary({
  result,
  onRestart,
  headingRef,
}: {
  result: StoryBuilderResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const [copied, setCopied] = useState(false);
  const missingCount = result.elements.filter((e) => !e.present).length;

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
        {missingCount === 0 ? "Your story spine is complete" : `${missingCount} part${missingCount === 1 ? "" : "s"} still missing`}
      </h2>

      <ul className="mt-4 space-y-3">
        {result.elements.map((el) => (
          <li key={el.element} className={`rounded-md border p-3 ${el.present ? "border-ink-200" : "border-dashed border-ink-300"}`}>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                  el.present ? "bg-brand-100 text-brand-900" : "bg-ink-100 text-ink-500"
                }`}
              >
                {el.present ? "✓" : "–"}
              </span>
              <span className="text-sm font-medium text-ink-900">{ELEMENT_LABEL[el.element]}</span>
              <span className="sr-only">{el.present ? "present" : "missing"}</span>
            </div>
            {el.present ? <p className="mt-2 text-sm text-ink-700">{el.text}</p> : <p className="mt-2 text-sm text-ink-500">Not written yet.</p>}
          </li>
        ))}
      </ul>

      {result.storySpine ? (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-ink-900">Your story spine so far</h3>
          <p className="mt-2 whitespace-pre-line rounded-md border border-ink-200 bg-paper p-4 text-sm text-ink-700">{result.storySpine}</p>
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
