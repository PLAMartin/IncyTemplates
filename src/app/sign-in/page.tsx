import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { MinimalLayout } from "@/components/layout/minimal-layout";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

/**
 * Static stub — exists so the header/mobile-nav's existing "Sign in" link
 * isn't a 404. Passwordless magic-link sign-in is Phase 3 (spec §18),
 * which depends on accounts and checkout not built this phase.
 */
export default function SignInPage() {
  return (
    <MinimalLayout>
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <KeyRound aria-hidden className="size-10 text-ink-500" />
        <h1 className="font-serif text-2xl font-semibold text-ink-900">Sign-in launches in a later release</h1>
        <p className="text-ink-500">
          Passwordless, magic-link sign-in isn&apos;t available yet — accounts and checkout haven&apos;t been built
          in this phase, so there&apos;s nothing to sign in to just yet. Every free template and guide can be
          browsed right now without an account.
        </p>
        <Link href="/templates" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          Browse templates instead
        </Link>
      </div>
    </MinimalLayout>
  );
}
