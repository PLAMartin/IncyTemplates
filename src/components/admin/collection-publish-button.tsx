"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { publishCollectionAction } from "@/server/actions/admin-collections";
import { Button } from "@/components/ui/button";

/**
 * Runs the mechanically-checkable subset of spec §36.10 (see
 * `validateCollectionForPublish`) before flipping status to `published`. A failed validation
 * surfaces every reason inline rather than a single generic error, so an editor can fix the
 * whole list in one pass instead of one submit-and-fail cycle per issue.
 */
export function CollectionPublishButton({ collectionId, status }: { collectionId: string; status: string }) {
  const router = useRouter();
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handlePublish() {
    setErrors([]);
    setMessage(null);
    startTransition(async () => {
      const result = await publishCollectionAction(collectionId);
      if (result.status === "success") {
        setMessage("Published.");
        router.refresh();
      } else if (result.status === "validation_failed") {
        setErrors(result.errors);
      } else {
        setErrors([result.message]);
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button type="button" disabled={isPending || status === "published"} onClick={handlePublish}>
        {isPending ? "Publishing…" : status === "published" ? "Published" : "Publish"}
      </Button>
      {message ? <p className="text-sm text-brand-700">{message}</p> : null}
      {errors.length > 0 ? (
        <ul className="list-disc space-y-1 rounded-md border border-red-200 bg-red-50 p-3 pl-8 text-sm text-red-700">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
