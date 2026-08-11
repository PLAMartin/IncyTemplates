"use client";

import { useEffect, useState, type RefObject } from "react";
import type { HookStage, UserEngagementDesignerResult } from "@/lib/tools/user-engagement-designer/schema";

const STAGE_COPY: Record<HookStage, { label: string }> = {
  trigger: { label: "Trigger" },
  action: { label: "Action" },
  reward: { label: "Reward" },
  investment: { label: "Investment" },
};

function resultToPlainText(result: UserEngagementDesignerResult): string {
  const stage = STAGE_COPY[result.weakestStage].label;
  return [
    `User Engagement Designer — weakest link`,
    `Weakest link: ${stage}`,
    `Why: ${result.rationale}`,
    `Also worth strengthening: ${STAGE_COPY[result.secondWeakestStage].label}`,
    `Next step: ${result.nextStep}`,
  ].join("\n");
}

/**
 * Reports the weakest link in the engagement loop, not a "recommended" candidate — the
 * inverse of every prior scoring-matrix Tool's layout. No deciding-factor field exists here
 * (docs/decisions/0036), so the runner-up slot is relabelled "also worth strengthening"
 * instead of "runner-up," since there's no competition being resolved.
 */
export function UserEngagementDesignerResultSummary({
  result,
  onRestart,
  headingRef,
}: {
  result: UserEngagementDesignerResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const [copied, setCopied] = useState(false);
  const stage = STAGE_COPY[result.weakestStage];

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
        Your weakest link: {stage.label}
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">{stage.label}</span>
      </div>

      <p className="mt-4 text-sm text-ink-700">{result.rationale}</p>

      <dl className="mt-6 grid grid-cols-1 gap-4">
        <div>
          <dt className="text-sm font-semibold text-ink-900">Also worth strengthening</dt>
          <dd className="mt-1 text-sm text-ink-700">{STAGE_COPY[result.secondWeakestStage].label}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-900">Next step</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.nextStep}</dd>
        </div>
      </dl>

      <p className="mt-6 text-xs text-ink-500">
        This points at where to focus first, not a permanent verdict — revisit it as your product changes, and strengthen
        the loop one link at a time.
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
