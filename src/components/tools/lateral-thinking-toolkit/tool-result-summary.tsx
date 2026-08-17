"use client";

import { useEffect, useState, type RefObject } from "react";
import type { LateralThinkingTechnique, LateralThinkingToolkitResult } from "@/lib/tools/lateral-thinking-toolkit/schema";

const TECHNIQUE_COPY: Record<LateralThinkingTechnique, { label: string }> = {
  perceptual_change: { label: "Perceptual change" },
  random_input: { label: "Random input" },
  provocation: { label: "Provocation" },
  specificity: { label: "Specificity" },
  scale: { label: "Scale" },
};

function resultToPlainText(result: LateralThinkingToolkitResult): string {
  const lines = ["Lateral Thinking Toolkit — your prompts", ""];
  for (const card of result.prompts) {
    lines.push(`${TECHNIQUE_COPY[card.technique].label}: ${card.promptText}`);
  }
  lines.push("", result.encouragement, `Next step: ${result.nextStep}`);
  return lines.join("\n");
}

/**
 * Deliberately no ranking, badge or "recommended" treatment — all five prompts are shown as
 * equal cards, since picking a "winner" among them would undermine the generate-many,
 * judge-later technique they teach. See docs/decisions/0035.
 */
export function LateralThinkingToolkitResultSummary({
  result,
  onRestart,
  headingRef,
  copy,
}: {
  result: LateralThinkingToolkitResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
  copy: Record<string, string>;
}) {
  const [copied, setCopied] = useState(false);

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
        {copy.result_heading}
      </h2>

      <ul className="mt-4 space-y-4">
        {result.prompts.map((card) => (
          <li key={card.technique} className="rounded-md border border-ink-200 p-4">
            <span className="inline-flex items-center rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-700">
              {TECHNIQUE_COPY[card.technique].label}
            </span>
            <p className="mt-2 text-sm text-ink-700">{card.promptText}</p>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-ink-700">{result.encouragement}</p>

      <dl className="mt-6">
        <dt className="text-sm font-semibold text-ink-900">{copy.next_step_label}</dt>
        <dd className="mt-1 text-sm text-ink-700">{result.nextStep}</dd>
      </dl>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex min-h-11 items-center rounded-md border border-ink-200 px-4 text-sm font-medium text-ink-900 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          {copied ? copy.copied_label : copy.copy_result_label}
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-11 items-center rounded-md border border-ink-200 px-4 text-sm font-medium text-ink-900 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          {copy.restart_label}
        </button>
      </div>
    </div>
  );
}
