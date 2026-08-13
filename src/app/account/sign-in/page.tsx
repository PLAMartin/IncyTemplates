import type { Metadata } from "next";
import { CircleAlert, KeyRound } from "lucide-react";
import { MinimalLayout } from "@/components/layout/minimal-layout";
import { MagicLinkForm } from "@/components/auth/magic-link-form";
import { requestCustomerMagicLink } from "@/server/actions/customer-auth";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ redirectTo?: string; error?: string }> };

/**
 * Customer-facing counterpart to /sign-in (staff-only). Unlike that page, a sign-in link here
 * can go to any email — requestCustomerMagicLink uses shouldCreateUser: true, so this is also
 * effectively account creation: a brand-new email gets a fresh auth.users row (role='customer'
 * by default) the first time it signs in here.
 */
export default async function AccountSignInPage({ searchParams }: Props) {
  const { redirectTo, error } = await searchParams;

  return (
    <MinimalLayout>
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <KeyRound aria-hidden className="size-10 text-ink-500" />
        <h1 className="font-serif text-2xl font-semibold text-ink-900">Sign in</h1>
        <p className="text-ink-500">Enter your email to get a one-time sign-in link to your account.</p>
        {error === "link-invalid-or-expired" ? (
          <p role="alert" className="flex items-start gap-2 text-left text-sm text-red-700">
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            That sign-in link is invalid or has expired. Request a new one below.
          </p>
        ) : null}
        <MagicLinkForm
          redirectTo={redirectTo}
          submitAction={requestCustomerMagicLink}
          footnote="We'll email you a one-time sign-in link — no separate account creation step."
          className="w-full text-left"
        />
      </div>
    </MinimalLayout>
  );
}
