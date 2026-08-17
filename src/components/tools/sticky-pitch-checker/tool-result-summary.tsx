"use client";

import { useEffect, useState, type RefObject } from "react";
import type { FactorState, StickyPitchCheckerResult } from "@/lib/tools/sticky-pitch-checker/schema";

function resultToPlainText(result: StickyPitchCheckerResult): string {
  const lines = ["Sticky Pitch Checker — self-assessment", "", `Sticks: ${result.stickCount}/6`, `Spreads: ${result.spreadCount}/4`, ""];
  for (const state of result.factorStates) {
    lines.push(`${state.present ? "✓" : "☐"} ${state.label}${state.present ? " — already there" : " — not yet"}`);
  }
  lines.push("", `Tip: ${result.firstTip}`, "", result.closingNote, "", `Next step: ${result.nextStep}`);
  return lines.join("\n");
}

function FactorGroupList({ title, states }: { title: string; states: FactorState[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
      <ul className="mt-2 space-y-3">
        {states.map((state) => (
          <li key={state.factor} className={`rounded-md border p-3 ${state.present ? "border-ink-200" : "border-dashed border-amber-300"}`}>
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
    </div>
  );
}

/**
 * Shows all ten factors as two grouped checklists (Stick/Spread), not a ranked or scored
 * result — the fifth use of Story Builder's completeness-checklist mechanic, same polarity
 * as App Design Review: a checkmark means the factor is already there. Grouped visually
 * (unlike App Design Review's single flat list) since the ten factors come from two distinct
 * named frameworks (SUCCESs, STEPPS), not one. See docs/decisions/0057.
 */
export function StickyPitchCheckerResultSummary({
  result,
  onRestart,
  headingRef,
  copy,
}: {
  result: StickyPitchCheckerResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
  copy: Record<string, string>;
}) {
  const [copied, setCopied] = useState(false);
  const missingCount = result.factorStates.filter((state) => !state.present).length;
  const stickStates = result.factorStates.filter((state) => state.group === "stick");
  const spreadStates = result.factorStates.filter((state) => state.group === "spread");

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
        {missingCount === 0 ? "All ten factors are there" : `${missingCount} factor${missingCount === 1 ? "" : "s"} still missing`}
      </h2>

      <dl className="mt-3 flex gap-6 text-sm">
        <div>
          <dt className="font-medium text-ink-500">Sticks</dt>
          <dd className="font-semibold text-ink-900">{result.stickCount}/6</dd>
        </div>
        <div>
          <dt className="font-medium text-ink-500">Spreads</dt>
          <dd className="font-semibold text-ink-900">{result.spreadCount}/4</dd>
        </div>
      </dl>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FactorGroupList title={copy.stick_group_title!} states={stickStates} />
        <FactorGroupList title={copy.spread_group_title!} states={spreadStates} />
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4">
        <div>
          <dt className="text-sm font-semibold text-ink-900">{copy.tip_label}</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.firstTip}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-900">{copy.next_step_label}</dt>
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
          {copied ? copy.copy_button_copied_label : copy.copy_button_label}
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-11 items-center rounded-md border border-ink-200 px-4 text-sm font-medium text-ink-900 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          {copy.restart_button_label}
        </button>
      </div>
    </div>
  );
}
