"use client";

import { useEffect, useState, type RefObject } from "react";
import type { HookStage, UserEngagementDesignerResult } from "@/lib/tools/user-engagement-designer/schema";

function stageLabel(stage: HookStage, copy: Record<string, string>): string {
  const key = ({
    trigger: "stage_trigger_label",
    action: "stage_action_label",
    reward: "stage_reward_label",
    investment: "stage_investment_label",
  } satisfies Record<HookStage, string>)[stage];
  return copy[key]!;
}

function resultToPlainText(result: UserEngagementDesignerResult, copy: Record<string, string>): string {
  return [
    `User Engagement Designer — weakest link`,
    `Weakest link: ${stageLabel(result.weakestStage, copy)}`,
    `Why: ${result.rationale}`,
    `Also worth strengthening: ${stageLabel(result.secondWeakestStage, copy)}`,
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
  copy,
}: {
  result: UserEngagementDesignerResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
  copy: Record<string, string>;
}) {
  const [copied, setCopied] = useState(false);
  const stage = stageLabel(result.weakestStage, copy);

  useEffect(() => {
    // Spec §10.6/§32.4: move focus to the result on completion so screen-reader users get
    // an explicit announcement rather than silence after the last question.
    headingRef.current?.focus();
  }, [headingRef]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(resultToPlainText(result, copy));
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
        {copy.result_heading_prefix} {stage}
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">{stage}</span>
      </div>

      <p className="mt-4 text-sm text-ink-700">{result.rationale}</p>

      <dl className="mt-6 grid grid-cols-1 gap-4">
        <div>
          <dt className="text-sm font-semibold text-ink-900">{copy.also_worth_strengthening_label}</dt>
          <dd className="mt-1 text-sm text-ink-700">{stageLabel(result.secondWeakestStage, copy)}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-900">{copy.next_step_label}</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.nextStep}</dd>
        </div>
      </dl>

      <p className="mt-6 text-xs text-ink-500">{copy.footer_note}</p>

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
