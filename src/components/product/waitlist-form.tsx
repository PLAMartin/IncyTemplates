"use client";

import { useId, useState, useTransition } from "react";
import { CircleCheck, CircleAlert } from "lucide-react";
import { submitWaitlistSignup } from "@/server/actions/waitlist";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type WaitlistFormProps = {
  productId: string;
  /** e.g. "Notify me when this launches free" / "Join the waitlist for £39.00" — honest, not generic. */
  label: string;
  source: string;
  className?: string;
};

type FormState =
  | { kind: "idle" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export function WaitlistForm({ productId, label, source, className }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>({ kind: "idle" });
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputId = useId();
  const errorId = useId();
  const statusId = useId();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError(null);

    startTransition(async () => {
      const result = await submitWaitlistSignup({ productId, email, source });
      switch (result.status) {
        case "success":
          setState({ kind: "success" });
          break;
        case "invalid":
          setFieldError(result.message);
          setState({ kind: "idle" });
          break;
        case "not-connected":
        case "error":
          setState({ kind: "error", message: result.message });
          break;
      }
    });
  }

  if (state.kind === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "flex items-start gap-2 rounded-md border border-brand-500 bg-brand-100 p-4 text-sm text-brand-900",
          className,
        )}
      >
        <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0" />
        <p>You&apos;re on the list — we&apos;ll email {email} as soon as this is available.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-2", className)} noValidate>
      <label htmlFor={inputId} className="block text-sm font-medium text-ink-900">
        Email address
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={inputId}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby={fieldError ? errorId : undefined}
          aria-invalid={fieldError ? true : undefined}
          placeholder="you@example.com"
          className="min-h-11 flex-1 rounded-md border border-ink-200 bg-paper-raised px-3 text-sm text-ink-900 placeholder:text-ink-300 focus-visible:outline-2 focus-visible:outline-focus-ring"
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Joining…" : label}
        </Button>
      </div>
      {fieldError ? (
        <p id={errorId} className="text-sm text-red-700">
          {fieldError}
        </p>
      ) : null}
      <div id={statusId} role="status" aria-live="polite" className="sr-only">
        {isPending ? "Submitting…" : ""}
      </div>
      {state.kind === "error" ? (
        <p role="alert" className="flex items-start gap-2 text-sm text-red-700">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </p>
      ) : null}
      <p className="text-xs text-ink-500">We&apos;ll only email you about this template. No spam, unsubscribe anytime.</p>
    </form>
  );
}
