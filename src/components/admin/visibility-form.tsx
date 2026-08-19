"use client";

import { useState, useTransition } from "react";
import { changeFrameworkVisibility } from "@/server/actions/admin-frameworks";
import { changeProductVisibility } from "@/server/actions/admin-products";
import { changeCollectionVisibility } from "@/server/actions/admin-collections";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { PublicVisibility } from "@/types/admin";

type Props = {
  entityId: string;
  kind: "framework" | "product" | "collection";
  currentVisibility: PublicVisibility;
};

/**
 * Shared control behind both the Frameworks and Products visibility
 * managers (`/admin/frameworks`, `/admin/products`) — same Select + reason
 * + Save shape either way. `kind` picks which Server Action actually writes
 * the change (they hit different tables/audit entity types); a Server
 * Action reference has to be imported directly here rather than passed
 * down as a prop closure, since only Server Actions (not arbitrary
 * functions) can cross the server->client boundary.
 */
export function VisibilityForm({ entityId, kind, currentVisibility }: Props) {
  const [visibility, setVisibility] = useState<PublicVisibility>(currentVisibility);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result =
        kind === "framework"
          ? await changeFrameworkVisibility({ frameworkId: entityId, visibility, reason: reason || undefined })
          : kind === "product"
            ? await changeProductVisibility({ productId: entityId, visibility, reason: reason || undefined })
            : await changeCollectionVisibility({ collectionId: entityId, visibility, reason: reason || undefined });
      if (result.status === "success") {
        setMessage({ kind: "success", text: "Saved." });
        setReason("");
      } else {
        setMessage({ kind: "error", text: result.message });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <Select
        aria-label="Public visibility"
        value={visibility}
        onChange={(e) => setVisibility(e.target.value as PublicVisibility)}
        className="w-auto min-w-32"
      >
        <option value="public">Public</option>
        <option value="unlisted">Unlisted</option>
        <option value="hidden">Hidden</option>
      </Select>
      <Input
        aria-label="Reason (optional)"
        placeholder="Reason (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-auto min-w-40"
      />
      <Button type="submit" variant="secondary" disabled={isPending || visibility === currentVisibility}>
        {isPending ? "Saving…" : "Save"}
      </Button>
      {message ? (
        <span role="status" className={message.kind === "error" ? "text-sm text-red-700" : "text-sm text-brand-700"}>
          {message.text}
        </span>
      ) : null}
    </form>
  );
}
