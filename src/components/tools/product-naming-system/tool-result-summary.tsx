"use client";

import { useEffect, useState, type RefObject } from "react";
import type { ProductNamingSystemResult } from "@/lib/tools/product-naming-system/schema";

const RECOMMENDATION_COPY: Record<ProductNamingSystemResult["recommendation"], { label: string; className: string }> = {
  name_a: { label: "Name A wins", className: "bg-brand-100 text-brand-900" },
  name_b: { label: "Name B wins", className: "bg-brand-100 text-brand-900" },
  too_close_to_call: { label: "Too close to call on numbers alone", className: "bg-amber-100 text-amber-700" },
  neither_usable: { label: "Neither name is usable as-is", className: "bg-red-100 text-red-700" },
};

function resultToPlainText(result: ProductNamingSystemResult): string {
  return [
    `Product Naming System — Name Comparator result`,
    `Name A: ${result.nameAScore}/100${result.nameAUsable ? "" : " (not usable — taken everywhere)"}`,
    `Name B: ${result.nameBScore}/100${result.nameBUsable ? "" : " (not usable — taken everywhere)"}`,
    `Recommendation: ${RECOMMENDATION_COPY[result.recommendation].label}`,
    `Guidance: ${result.guidance}`,
    `Next step: ${result.nextStep}`,
  ].join("\n");
}

/**
 * Its own component, not a reuse of Better Decision Maker's Expected Value Comparator
 * summary despite the shared "two subjects side by side" layout — this one also needs a
 * per-name usability flag the EV comparator has no equivalent of. See
 * docs/decisions/0024.
 */
export function ProductNamingSystemResultSummary({
  result,
  onRestart,
  headingRef,
}: {
  result: ProductNamingSystemResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const [copied, setCopied] = useState(false);
  const recommendation = RECOMMENDATION_COPY[result.recommendation];

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
        Your result
      </h2>

      <span className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${recommendation.className}`}>
        {recommendation.label}
      </span>

      <div className="mt-4 space-y-4">
        {(
          [
            ["Name A", result.nameAScore, result.nameAUsable],
            ["Name B", result.nameBScore, result.nameBUsable],
          ] as const
        ).map(([label, value, usable]) => (
          <div key={label}>
            <div className="flex items-center justify-between text-sm text-ink-500">
              <span>
                {label}
                {!usable ? <span className="ml-2 text-red-700">Not usable — taken everywhere</span> : null}
              </span>
              <span className="font-semibold text-ink-900">{value}/100</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-ink-100" role="img" aria-label={`${label} score: ${value} out of 100`}>
              <div className={`h-2 rounded-full ${usable ? "bg-brand-600" : "bg-ink-300"}`} style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm text-ink-700">{result.guidance}</p>

      <dl className="mt-6">
        <dt className="text-sm font-semibold text-ink-900">Next step</dt>
        <dd className="mt-1 text-sm text-ink-700">{result.nextStep}</dd>
      </dl>

      <p className="mt-6 text-xs text-ink-500">
        This is a structured read on the criteria you reported, not a legal availability check — always verify
        trademark and domain availability properly before committing to a name.
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
          Compare two more names
        </button>
      </div>
    </div>
  );
}
