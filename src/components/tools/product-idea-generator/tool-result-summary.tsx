"use client";

import { useEffect, useState, type RefObject } from "react";
import type { IdeaMethod, ProductIdeaGeneratorResult } from "@/lib/tools/product-idea-generator/schema";

const METHOD_COPY: Record<IdeaMethod, { label: string }> = {
  scratch_your_own_itch: { label: "Scratch your own itch" },
  address_a_niche: { label: "Address a niche" },
  improve_existing: { label: "Improve an existing product" },
};

function resultToPlainText(result: ProductIdeaGeneratorResult): string {
  const recommended = result.candidates.find((c) => c.method === result.recommendedMethod)!;
  const lines = [
    `Product Idea Generator — idea direction`,
    `Recommended direction (${METHOD_COPY[recommended.method].label}): ${recommended.promptText}`,
    `First test step: ${recommended.testStep}`,
  ];
  const others = result.candidates.filter((c) => c.method !== result.recommendedMethod);
  for (const candidate of others) {
    lines.push(`Also worth exploring (${METHOD_COPY[candidate.method].label}): ${candidate.promptText}`);
  }
  lines.push(`Daily practice: ${result.dailyPracticeNudge}`);
  lines.push(`Next step: ${result.nextStep}`);
  return lines.join("\n");
}

/**
 * Renders the generator's result: one recommended idea direction (the richest free-text
 * answer, per `scoring.ts`), any other directions the visitor also gave enough to work with,
 * a daily-practice nudge and a pointer forward to Product Idea Assessor. See docs/decisions/0029.
 */
export function ProductIdeaGeneratorResultSummary({
  result,
  onRestart,
  headingRef,
  copy,
}: {
  result: ProductIdeaGeneratorResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
  copy: Record<string, string>;
}) {
  const [copied, setCopied] = useState(false);
  const recommended = result.candidates.find((c) => c.method === result.recommendedMethod)!;
  const others = result.candidates.filter((c) => c.method !== result.recommendedMethod);

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

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-900">
          {METHOD_COPY[recommended.method].label}
        </span>
      </div>

      <p className="mt-4 text-sm text-ink-700">{recommended.promptText}</p>

      <dl className="mt-6 grid grid-cols-1 gap-4">
        <div>
          <dt className="text-sm font-semibold text-ink-900">{copy.result_test_step_label}</dt>
          <dd className="mt-1 text-sm text-ink-700">{recommended.testStep}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-900">{copy.result_daily_practice_label}</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.dailyPracticeNudge}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-900">{copy.result_next_step_label}</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.nextStep}</dd>
        </div>
      </dl>

      {others.length > 0 ? (
        <div className="mt-6 border-t border-ink-200 pt-6">
          <h3 className="text-sm font-semibold text-ink-900">{copy.result_others_heading}</h3>
          <ul className="mt-3 space-y-3">
            {others.map((candidate) => (
              <li key={candidate.method}>
                <span className="inline-flex items-center rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-700">
                  {METHOD_COPY[candidate.method].label}
                </span>
                <p className="mt-1 text-sm text-ink-700">{candidate.promptText}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-6 text-xs text-ink-500">{copy.result_disclaimer}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex min-h-11 items-center rounded-md border border-ink-200 px-4 text-sm font-medium text-ink-900 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          {copied ? copy.result_copied_label : copy.result_copy_button}
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-11 items-center rounded-md border border-ink-200 px-4 text-sm font-medium text-ink-900 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          {copy.result_restart_button}
        </button>
      </div>
    </div>
  );
}
