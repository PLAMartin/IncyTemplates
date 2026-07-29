"use client";

import { useId, useState, useTransition } from "react";
import { CircleCheck, CircleAlert, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type ViewFormProps = {
  productId: string;
  fileId: string;
  slug: string;
  source: string;
  className?: string;
};

type FormState = { kind: "idle" } | { kind: "success" } | { kind: "error"; message: string };

const CONSENT_TEXT_VERSION = "2026-07-01";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function ViewForm({ productId, fileId, slug, source, className }: ViewFormProps) {
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [state, setState] = useState<FormState>({ kind: "idle" });
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputId = useId();
  const errorId = useId();
  const statusId = useId();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError(null);

    if (!isValidEmail(email)) {
      setFieldError("Enter a valid email address to view this template.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/templates/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            fileId,
            email,
            marketingConsent,
            consentTextVersion: CONSENT_TEXT_VERSION,
            source,
          }),
        });
        const body = await response.json();

        if (!response.ok) {
          setState({ kind: "error", message: body.error?.message ?? "Something went wrong. Please try again." });
          return;
        }

        setState({ kind: "success" });
        window.location.href = `/templates/${slug}/view`;
      } catch {
        setState({ kind: "error", message: "Something went wrong. Please try again." });
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
        <p>
          Taking you to the template…{" "}
          <a href={`/templates/${slug}/view`} className="underline">
            click here
          </a>{" "}
          if you&apos;re not redirected.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-3", className)} noValidate>
      <div>
        <label htmlFor={inputId} className="block text-sm font-medium text-ink-900">
          Email address
        </label>
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
          className="mt-1 min-h-11 w-full rounded-md border border-ink-200 bg-paper-raised px-3 text-sm text-ink-900 placeholder:text-ink-300 focus-visible:outline-2 focus-visible:outline-focus-ring"
        />
        {fieldError ? (
          <p id={errorId} className="mt-1 text-sm text-red-700">
            {fieldError}
          </p>
        ) : null}
      </div>

      <label className="flex items-start gap-2 text-sm text-ink-700">
        <input
          type="checkbox"
          checked={marketingConsent}
          onChange={(e) => setMarketingConsent(e.target.checked)}
          className="mt-0.5 size-4 rounded border-ink-200 focus-visible:outline-2 focus-visible:outline-focus-ring"
        />
        <span>Also email me when new free templates are published. No spam, unsubscribe anytime.</span>
      </label>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        <Eye aria-hidden className="size-4" />
        {isPending ? "Loading…" : "View template"}
      </Button>

      <div id={statusId} role="status" aria-live="polite" className="sr-only">
        {isPending ? "Preparing your template…" : ""}
      </div>
      {state.kind === "error" ? (
        <p role="alert" className="flex items-start gap-2 text-sm text-red-700">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
