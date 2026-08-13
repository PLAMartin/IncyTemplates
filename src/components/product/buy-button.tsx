"use client";

import { useState, useTransition } from "react";
import { CircleAlert, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type BuyButtonProps = {
  productId: string;
  /** e.g. "Buy for £9.00" — honest, not generic, same convention as WaitlistForm's label prop. */
  label: string;
  className?: string;
};

type ButtonState = { kind: "idle" } | { kind: "error"; message: string };

/**
 * Mirrors ViewForm's fetch-to-route + startTransition + window.location.href redirect pattern,
 * simplified to a bare button since Stripe Checkout collects the buyer's email itself — there's
 * no form to fill in before redirecting.
 */
export function BuyButton({ productId, label, className }: BuyButtonProps) {
  const [state, setState] = useState<ButtonState>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setState({ kind: "idle" });
    startTransition(async () => {
      try {
        const response = await fetch("/api/checkout/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        const body = await response.json();

        if (!response.ok || !body.url) {
          setState({ kind: "error", message: body.error?.message ?? "Checkout isn't available right now. Please try again shortly." });
          return;
        }

        window.location.href = body.url;
      } catch {
        setState({ kind: "error", message: "Checkout isn't available right now. Please try again shortly." });
      }
    });
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Button type="button" onClick={handleClick} disabled={isPending} className="w-full sm:w-auto">
        <ShoppingCart aria-hidden className="size-4" />
        {isPending ? "Redirecting…" : label}
      </Button>
      <div role="status" aria-live="polite" className="sr-only">
        {isPending ? "Preparing checkout…" : ""}
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
