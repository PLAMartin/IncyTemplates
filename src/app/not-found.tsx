import Link from "next/link";
import { Compass } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ButtonLink } from "@/components/ui/button";

/**
 * Root `not-found.tsx` renders for any unmatched route across the whole
 * app, so it sits outside the `(marketing)` route group and can't inherit
 * that group's layout — header/footer are included directly here instead,
 * to keep the 404 on-brand rather than a bare Next.js default.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
          <Compass aria-hidden className="size-10 text-ink-500" />
          <h1 className="font-serif text-3xl font-semibold text-ink-900">Page not found</h1>
          <p className="text-ink-500">
            We couldn&apos;t find the page you were looking for. It may have moved, or the link may be out of date.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/templates">Browse templates</ButtonLink>
            <Link href="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Back to the homepage
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
