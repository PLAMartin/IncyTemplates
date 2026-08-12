"use client";

import { useState, useTransition } from "react";
import {
  selectVisualCandidateAction,
  rejectVisualCandidateAction,
  updateVisualAltTextAction,
  publishVisualAssetAction,
} from "@/server/actions/admin-visuals";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type CandidateAsset = {
  id: string;
  assetType: string;
  sourceType: string;
  status: string;
  url: string | null;
  altText: string | null;
  decorative: boolean;
  provider: string | null;
  createdAt: string;
};

export function VisualCandidateGrid({ frameworkId, candidates }: { frameworkId: string; candidates: CandidateAsset[] }) {
  if (candidates.length === 0) {
    return <p className="text-sm text-ink-500">No open candidates. Generate or upload one above.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {candidates.map((candidate) => (
        <CandidateCard key={candidate.id} frameworkId={frameworkId} candidate={candidate} />
      ))}
    </div>
  );
}

function CandidateCard({ frameworkId, candidate }: { frameworkId: string; candidate: CandidateAsset }) {
  const [altText, setAltText] = useState(candidate.altText ?? "");
  const [decorative, setDecorative] = useState(candidate.decorative);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<{ status: string; message?: string }>) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (result.status !== "success") {
        setMessage({ kind: "error", text: result.message ?? "Something went wrong." });
      }
    });
  }

  return (
    <div className="space-y-3 rounded-md border border-ink-200 bg-paper-raised p-3">
      {candidate.url ? (
        // Plain <img>, not next/image — see src/app/(marketing)/products/[slug]/page.tsx's
        // hero image for the SVG/CSP reasoning; doubly true here since these are short-lived
        // signed URLs to admin-only staging content, not stable public asset URLs.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={candidate.url} alt="" className="aspect-[4/3] w-full rounded-md border border-ink-100 object-cover" />
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-md border border-ink-100 text-xs text-ink-500">
          No preview
        </div>
      )}
      <div className="text-xs text-ink-500">
        {candidate.assetType} · {candidate.sourceType}
        {candidate.provider ? ` · ${candidate.provider}` : ""} · {candidate.status}
      </div>

      {candidate.status === "candidate" ? (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={() => run(() => selectVisualCandidateAction({ assetId: candidate.id, frameworkId }))}
          >
            Select
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            onClick={() => run(() => rejectVisualCandidateAction({ assetId: candidate.id, frameworkId }))}
          >
            Reject
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            placeholder="Alt text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            disabled={decorative}
          />
          <label className="flex items-center gap-2 text-xs text-ink-700">
            <input type="checkbox" checked={decorative} onChange={(e) => setDecorative(e.target.checked)} />
            Decorative (no alt text needed)
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={() => run(() => updateVisualAltTextAction({ assetId: candidate.id, frameworkId, altText, decorative }))}
            >
              Save alt text
            </Button>
            <Button
              type="button"
              disabled={isPending}
              onClick={() => run(() => publishVisualAssetAction({ assetId: candidate.id, frameworkId }))}
            >
              Approve & publish
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => run(() => rejectVisualCandidateAction({ assetId: candidate.id, frameworkId }))}
            >
              Reject
            </Button>
          </div>
        </div>
      )}

      {message ? <p className="text-xs text-red-700">{message.text}</p> : null}
    </div>
  );
}
