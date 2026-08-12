import type { Metadata } from "next";
import { CircleAlert, KeyRound } from "lucide-react";
import { MinimalLayout } from "@/components/layout/minimal-layout";
import { MagicLinkForm } from "@/components/auth/magic-link-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ redirectTo?: string; error?: string }> };

/**
 * Real passwordless sign-in (spec v4 Phase 6 — admin/editorial). No
 * self-serve sign-up: `requestMagicLink` uses `shouldCreateUser: false`, so
 * this only ever authenticates an email already provisioned as an
 * `auth.users` row in Supabase. Customer self-signup/accounts remain out of
 * scope (spec §40) — this page exists to unlock `/admin` for staff.
 */
export default async function SignInPage({ searchParams }: Props) {
  const { redirectTo, error } = await searchParams;

  return (
    <MinimalLayout>
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <KeyRound aria-hidden className="size-10 text-ink-500" />
        <h1 className="font-serif text-2xl font-semibold text-ink-900">Sign in</h1>
        <p className="text-ink-500">Enter your email to get a one-time sign-in link.</p>
        {error === "link-invalid-or-expired" ? (
          <p role="alert" className="flex items-start gap-2 text-left text-sm text-red-700">
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            That sign-in link is invalid or has expired. Request a new one below.
          </p>
        ) : null}
        {error === "not-staff" ? (
          <p role="alert" className="flex items-start gap-2 text-left text-sm text-red-700">
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            That account doesn&apos;t have admin access.
          </p>
        ) : null}
        <MagicLinkForm redirectTo={redirectTo} className="w-full text-left" />
      </div>
    </MinimalLayout>
  );
}
