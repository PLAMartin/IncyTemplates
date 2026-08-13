"use client";

import { useState, useTransition } from "react";
import { CircleAlert, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type DownloadOrderButtonProps = {
  sessionId: string;
  className?: string;
};

type ButtonState = { kind: "idle" } | { kind: "error"; message: string };

/**
 * Same fetch-then-redirect shape as BuyButton/ViewForm. Unlike those, the destination here is a
 * short-lived Supabase Storage signed URL (see src/app/api/downloads/paid/route.ts) rather than
 * an internal page — the file itself, not a viewer.
 */
export function DownloadOrderButton({ sessionId, className }: DownloadOrderButtonProps) {
  const [state, setState] = useState<ButtonState>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setState({ kind: "idle" });
    startTransition(async () => {
      try {
        const response = await fetch("/api/downloads/paid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const body = await response.json();

        if (!response.ok || !body.url) {
          setState({ kind: "error", message: body.error?.message ?? "Couldn't prepare your download. Please try again shortly." });
          return;
        }

        window.location.href = body.url;
      } catch {
        setState({ kind: "error", message: "Couldn't prepare your download. Please try again shortly." });
      }
    });
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Button type="button" onClick={handleClick} disabled={isPending} className="w-full sm:w-auto">
        <Download aria-hidden className="size-4" />
        {isPending ? "Preparing…" : "Download your file"}
      </Button>
      <div role="status" aria-live="polite" className="sr-only">
        {isPending ? "Preparing your download…" : ""}
      </div>
      {state.kind === "error" ? (
        <p role="alert" className="flex items-start gap-2 text-sm text-red-700">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
