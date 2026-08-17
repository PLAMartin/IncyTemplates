"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { AdminActionResult } from "@/server/actions/admin-guides";

type HistoryEntry = {
  id: string;
  revision_number: number;
  change_note: string | null;
  published_at: string | null;
};

type Props = {
  currentRevisionId: string | null;
  history: HistoryEntry[];
  onRollback: (sourceRevisionId: string) => Promise<AdminActionResult>;
};

/**
 * Type-agnostic revision history/rollback list — same shape as the old `GuideRollbackList`,
 * generalized (spec v8 §12.3.1's "one editorial contract") to take the rollback action as a
 * prop instead of importing `rollbackGuideRevisionAction` directly, so Guide, Template and
 * Tool editors can each pass their own (Tool's bundles a common-copy + tool-copy rollback
 * behind the one callback).
 */
export function ContentRevisionRollbackList({ currentRevisionId, history, onRollback }: Props) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRollback(sourceRevisionId: string) {
    setPendingId(sourceRevisionId);
    setMessage(null);
    startTransition(async () => {
      const result = await onRollback(sourceRevisionId);
      setMessage(result.status === "success" ? "Rolled back — now live." : result.message);
    });
  }

  if (history.length === 0) {
    return <p className="text-sm text-ink-500">No published revisions yet.</p>;
  }

  return (
    <div className="space-y-2">
      <ul className="divide-y divide-ink-100 rounded-md border border-ink-200">
        {history.map((entry) => (
          <li key={entry.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <div>
              <span className="font-medium text-ink-900">Revision {entry.revision_number}</span>
              {entry.id === currentRevisionId ? (
                <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">Live</span>
              ) : null}
              {entry.change_note ? <p className="mt-0.5 text-ink-500">{entry.change_note}</p> : null}
              <p className="text-xs text-ink-400">{entry.published_at ? new Date(entry.published_at).toLocaleString() : ""}</p>
            </div>
            {entry.id !== currentRevisionId ? (
              <Button
                type="button"
                variant="secondary"
                disabled={isPending && pendingId === entry.id}
                onClick={() => handleRollback(entry.id)}
              >
                {isPending && pendingId === entry.id ? "Rolling back…" : "Roll back to this"}
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
      {message ? (
        <p role="status" className="text-sm text-ink-700">
          {message}
        </p>
      ) : null}
    </div>
  );
}
