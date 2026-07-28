"use client";

import { Button } from "@/components/ui/button";

/**
 * Homepage newsletter section (spec §10.1 item 10) — UI only, deliberately
 * not wired to a backend this phase (no email list provider is connected
 * yet). Needs `'use client'` only because a plain `<form onSubmit>` can't
 * live inside a Server Component tree; the handler itself does nothing but
 * prevent a real (non-functional) submission.
 */
export function NewsletterSignup() {
  return (
    <>
      <form onSubmit={(e) => e.preventDefault()} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="newsletter-email" className="block text-sm font-medium text-ink-900">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="you@example.com"
            className="mt-1 min-h-11 w-full rounded-md border border-ink-200 bg-paper px-3 text-sm text-ink-900 placeholder:text-ink-300 focus-visible:outline-2 focus-visible:outline-focus-ring"
          />
        </div>
        <Button type="submit">Subscribe</Button>
      </form>
      <label className="mt-3 flex items-start gap-2 text-xs text-ink-500">
        <input type="checkbox" className="mt-0.5 size-4" />
        Yes, send me occasional marketing emails about new templates and guides. (Optional — unrelated to any free
        template access.)
      </label>
    </>
  );
}
