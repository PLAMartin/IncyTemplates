"use client";

import { useEffect, useState, type RefObject } from "react";
import type { AgentVerdict, AiAgentDesignerResult } from "@/lib/tools/ai-agent-designer/schema";

const VERDICT_COPY: Record<AgentVerdict, { label: string; tone: "simplify" | "recommend" }> = {
  workflow_not_agent: { label: "Use a workflow, not an agent", tone: "simplify" },
  augmented_llm: { label: "Augmented LLM", tone: "recommend" },
  prompt_chaining: { label: "Prompt Chaining", tone: "recommend" },
  routing_system: { label: "Routing System", tone: "recommend" },
  orchestrator_worker: { label: "Orchestrator-Worker", tone: "recommend" },
  evaluator_optimiser: { label: "Evaluator-Optimiser", tone: "recommend" },
};

function resultToPlainText(result: AiAgentDesignerResult): string {
  const verdict = VERDICT_COPY[result.verdict].label;
  return [`AI Agent Designer — recommendation`, `Recommendation: ${verdict}`, `Why: ${result.rationale}`, `Next step: ${result.nextStep}`].join("\n");
}

/**
 * Shows a single verdict, not a ranked list or a recommended-vs-runner-up pair — the Tool is a
 * gated classification (docs/decisions/0043), the same shape as Meeting Reset's single verdict,
 * just with six reachable outcomes instead of four.
 */
export function AiAgentDesignerResultSummary({
  result,
  onRestart,
  headingRef,
}: {
  result: AiAgentDesignerResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const [copied, setCopied] = useState(false);
  const verdict = VERDICT_COPY[result.verdict];

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
        Verdict: {verdict.label}
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
            verdict.tone === "recommend" ? "bg-brand-100 text-brand-900" : "bg-amber-100 text-amber-700"
          }`}
        >
          {verdict.label}
        </span>
      </div>

      <p className="mt-4 text-sm text-ink-700">{result.rationale}</p>

      <dl className="mt-6">
        <dt className="text-sm font-semibold text-ink-900">Next step</dt>
        <dd className="mt-1 text-sm text-ink-700">{result.nextStep}</dd>
      </dl>

      <p className="mt-6 text-xs text-ink-500">
        Revisit this for each new AI feature you&apos;re considering — the right architecture depends on the specific task, not a rule you set once.
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
          Check another
        </button>
      </div>
    </div>
  );
}
