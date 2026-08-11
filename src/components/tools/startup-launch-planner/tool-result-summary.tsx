"use client";

import { useEffect, useState, type RefObject } from "react";
import type { LaunchOption, StartupLaunchPlannerResult } from "@/lib/tools/startup-launch-planner/schema";

const OPTION_COPY: Record<LaunchOption, { label: string }> = {
  soft_launch_page: { label: "Soft launch page" },
  friends_and_family: { label: "Friends and family" },
  community_or_social: { label: "Community or social" },
  press: { label: "Press" },
};

function resultToPlainText(result: StartupLaunchPlannerResult): string {
  const lines = ["Startup Launch Planner — your launch plan", ""];
  result.plan.forEach((step, index) => {
    lines.push(`${index + 1}. ${OPTION_COPY[step.option].label}: ${step.tip}`);
  });
  lines.push("", `Why start there: ${result.rationale}`, `Next step: ${result.nextStep}`);
  return lines.join("\n");
}

/**
 * Shows the full ranked plan (all four launch options, in order), not just a recommended
 * candidate and a runner-up — a genuine sequenced plan, matching spec's "plan generator"
 * naming while reusing the proven scoring-matrix mechanism. See docs/decisions/0038.
 */
export function StartupLaunchPlannerResultSummary({
  result,
  onRestart,
  headingRef,
}: {
  result: StartupLaunchPlannerResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const [copied, setCopied] = useState(false);
  const firstStep = result.plan[0]!;

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
        Your launch plan
      </h2>

      <p className="mt-4 text-sm text-ink-700">{result.rationale}</p>

      <ol className="mt-6 space-y-3">
        {result.plan.map((step, index) => (
          <li key={step.option} className="rounded-md border border-ink-200 p-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-900">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-ink-900">{OPTION_COPY[step.option].label}</span>
              {step.option === firstStep.option ? (
                <span className="inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-900">Start here</span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-ink-700">{step.tip}</p>
          </li>
        ))}
      </ol>

      <dl className="mt-6">
        <dt className="text-sm font-semibold text-ink-900">Next step</dt>
        <dd className="mt-1 text-sm text-ink-700">{result.nextStep}</dd>
      </dl>

      <p className="mt-6 text-xs text-ink-500">
        Launching isn&apos;t one-and-done — most successful products launch early, often, and more than once.
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
