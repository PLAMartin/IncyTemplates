"use client";

import { useEffect, useState, type RefObject } from "react";
import type { AiPromptBuilderResult } from "@/lib/tools/ai-prompt-builder/schema";

function resultToPlainText(result: AiPromptBuilderResult): string {
  return [result.assembledPrompt, "", `Tip: ${result.tip}`, `Next step: ${result.nextStep}`].join("\n");
}

/**
 * Leads with the assembled prompt itself in a copyable block — the Tool's headline output,
 * spec v4 §37's "prompt builder" — with a craft tip and next step as supporting detail, the
 * same "one direct output, no runner-up" layout Product Positioning Builder uses. See
 * docs/decisions/0042.
 */
export function AiPromptBuilderResultSummary({
  result,
  onRestart,
  headingRef,
}: {
  result: AiPromptBuilderResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
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
        Your prompt
      </h2>

      <pre className="mt-4 whitespace-pre-wrap rounded-md border border-ink-200 bg-paper p-4 font-mono text-sm text-ink-900">
        {result.assembledPrompt}
      </pre>

      <dl className="mt-6 grid grid-cols-1 gap-4">
        <div>
          <dt className="text-sm font-semibold text-ink-900">Tip</dt>
          <dd className="mt-1 text-sm text-ink-700">{result.tip}</dd>
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
          Build another prompt
        </button>
      </div>
    </div>
  );
}
