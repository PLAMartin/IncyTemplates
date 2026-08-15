"use client";

import { useState, useTransition } from "react";
import { reviewSourcePostMappingAction } from "@/server/actions/admin-source-posts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { AdminSourcePostReview } from "@/server/admin/source-posts";
import type { SourceUseType } from "@/lib/source-mapping/schema";

const USE_TYPES: SourceUseType[] = ["source_only", "guide", "template", "tool"];

function sameUses(a: string[], b: string[]): boolean {
  return a.length === b.length && [...a].sort().every((v, i) => v === [...b].sort()[i]);
}

type Props = {
  sourcePostId: string;
  assessmentId: string | null;
  suggestedUses: string[];
  review: AdminSourcePostReview | null;
};

export function MappingReviewPanel({ sourcePostId, assessmentId, suggestedUses, review }: Props) {
  const [editing, setEditing] = useState(false);
  const [selectedUses, setSelectedUses] = useState<string[]>(review?.editorialUses.length ? review.editorialUses : suggestedUses);
  const [note, setNote] = useState(review?.editorialNote ?? "");
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(uses: string[], editorialNote?: string) {
    setMessage(null);
    const status = uses.length === 0 ? "dismissed" : sameUses(uses, suggestedUses) ? "accepted" : "adjusted";
    startTransition(async () => {
      const result = await reviewSourcePostMappingAction({
        sourcePostId,
        assessmentId,
        status,
        editorialUses: uses as SourceUseType[],
        editorialNote,
      });
      if (result.status === "success") {
        setMessage({ kind: "success", text: "Saved." });
        setEditing(false);
      } else {
        setMessage({ kind: "error", text: result.message });
      }
    });
  }

  function toggleUse(use: SourceUseType) {
    setSelectedUses((prev) => (prev.includes(use) ? prev.filter((u) => u !== use) : [...prev, use]));
  }

  return (
    <div className="space-y-3">
      <div className="text-sm">
        <span className="font-medium text-ink-700">Current decision: </span>
        <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-700">
          {review?.status ?? "unreviewed"}
        </span>
        {review?.editorialUses.length ? (
          <span className="ml-2 text-ink-700">{review.editorialUses.join(", ")}</span>
        ) : null}
        {review?.editorialNote ? <p className="mt-1 text-ink-500">{review.editorialNote}</p> : null}
      </div>

      {editing ? (
        <div className="space-y-3 rounded-md bg-paper-raised p-3">
          <div className="flex flex-wrap gap-3">
            {USE_TYPES.map((use) => (
              <label key={use} className="flex items-center gap-1.5 text-sm text-ink-900">
                <input type="checkbox" checked={selectedUses.includes(use)} onChange={() => toggleUse(use)} />
                {use.replace("_", " ")}
              </label>
            ))}
          </div>
          <Textarea
            aria-label="Editorial note (optional)"
            placeholder="Editorial note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" disabled={isPending} onClick={() => submit(selectedUses, note || undefined)}>
              {isPending ? "Saving…" : "Save mapping"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="primary" disabled={isPending} onClick={() => submit(suggestedUses)}>
            Accept as suggested
          </Button>
          <Button type="button" variant="secondary" disabled={isPending} onClick={() => setEditing(true)}>
            Edit mapping
          </Button>
          <Button type="button" variant="secondary" disabled={isPending} onClick={() => submit(["source_only"])}>
            Mark source-only
          </Button>
          <Button type="button" variant="ghost" disabled={isPending} onClick={() => submit([])}>
            Dismiss suggestion
          </Button>
        </div>
      )}

      {message ? (
        <p role="status" className={message.kind === "error" ? "text-sm text-red-700" : "text-sm text-brand-700"}>
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
