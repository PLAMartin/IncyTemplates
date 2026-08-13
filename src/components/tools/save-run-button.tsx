"use client";

import { useState, useTransition } from "react";
import { CircleAlert, BookmarkCheck, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type SaveRunButtonProps = {
  toolKey: string;
  input: unknown;
  result: unknown;
  className?: string;
};

type ButtonState = { kind: "idle" } | { kind: "saved" } | { kind: "error"; message: string };

/**
 * Saves a completed Tool run (spec §14.12) so it can be revisited from /account/work. Works for
 * anonymous visitors too — ownership is claimed automatically on sign-in (it_claim_anonymous_
 * tool_runs, wired into src/app/auth/callback/route.ts) — so this never forces sign-in first,
 * same fetch-then-startTransition shape as BuyButton/DownloadOrderButton.
 */
export function SaveRunButton({ toolKey, input, result, className }: SaveRunButtonProps) {
  const [state, setState] = useState<ButtonState>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setState({ kind: "idle" });
    startTransition(async () => {
      try {
        const response = await fetch(`/api/tools/${toolKey}/runs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input, result }),
        });
        const body = await response.json();

        if (!response.ok || !body.id) {
          setState({ kind: "error", message: body.error?.message ?? "Couldn't save this right now. Please try again shortly." });
          return;
        }

        setState({ kind: "saved" });
      } catch {
        setState({ kind: "error", message: "Couldn't save this right now. Please try again shortly." });
      }
    });
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Button type="button" variant="secondary" onClick={handleClick} disabled={isPending || state.kind === "saved"}>
        {state.kind === "saved" ? <BookmarkCheck aria-hidden className="size-4" /> : <Bookmark aria-hidden className="size-4" />}
        {isPending ? "Saving…" : state.kind === "saved" ? "Saved to your account" : "Save this result"}
      </Button>
      <div role="status" aria-live="polite" className="sr-only">
        {isPending ? "Saving your result…" : ""}
      </div>
      {state.kind === "saved" ? (
        <p className="text-sm text-ink-500">Sign in any time to find this under Work in your account.</p>
      ) : null}
      {state.kind === "error" ? (
        <p role="alert" className="flex items-start gap-2 text-sm text-red-700">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
