"use client";

import { useState, useTransition } from "react";
import { publishVisualAssetAction } from "@/server/actions/admin-visuals";
import { Button } from "@/components/ui/button";

export type HistoryAsset = {
  id: string;
  assetType: string;
  sourceType: string;
  status: string;
  url: string | null;
  publishedAt: string | null;
  archivedAt: string | null;
};

/**
 * "Restore a prior approved visual as a new publication action without rewriting history"
 * (spec §9.12 point 11) — this button calls the same publish action as "Approve & publish" in
 * VisualCandidateGrid, just targeting a historical (archived) asset id. See
 * it_publish_visual_asset's header comment (20260812150000_it_visual_asset_lifecycle_functions.sql)
 * for why one function correctly covers both.
 */
export function VisualHistoryList({ frameworkId, history }: { frameworkId: string; history: HistoryAsset[] }) {
  if (history.length === 0) {
    return <p className="text-sm text-ink-500">No archived visuals yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {history.map((asset) => (
        <HistoryCard key={asset.id} frameworkId={frameworkId} asset={asset} />
      ))}
    </div>
  );
}

function HistoryCard({ frameworkId, asset }: { frameworkId: string; asset: HistoryAsset }) {
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRestore() {
    setMessage(null);
    startTransition(async () => {
      const result = await publishVisualAssetAction({ assetId: asset.id, frameworkId });
      if (result.status !== "success") {
        setMessage({ kind: "error", text: result.message });
      }
    });
  }

  return (
    <div className="space-y-2 rounded-md border border-ink-200 bg-paper-raised p-3">
      {asset.url ? (
        // Plain <img>, not next/image — see src/app/(marketing)/products/[slug]/page.tsx's
        // hero image for the SVG/CSP reasoning.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset.url} alt="" className="aspect-[4/3] w-full rounded-md border border-ink-100 object-cover" />
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-md border border-ink-100 text-xs text-ink-500">
          No preview
        </div>
      )}
      <div className="text-xs text-ink-500">
        {asset.assetType} · {asset.sourceType}
        <br />
        Was published {asset.publishedAt ? new Date(asset.publishedAt).toLocaleDateString() : "—"}, archived{" "}
        {asset.archivedAt ? new Date(asset.archivedAt).toLocaleDateString() : "—"}
      </div>
      <Button type="button" variant="secondary" disabled={isPending} onClick={handleRestore}>
        {isPending ? "Restoring…" : "Restore"}
      </Button>
      {message ? <p className="text-xs text-red-700">{message.text}</p> : null}
    </div>
  );
}
