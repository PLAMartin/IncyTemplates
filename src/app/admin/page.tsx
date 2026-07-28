import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { MinimalLayout } from "@/components/layout/minimal-layout";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * Static, unauthenticated stub. The admin dashboard and all CRUD UI are
 * Phase 4 (spec §40) — explicitly out of scope this build. No auth check
 * exists here because there's nothing behind this page to protect yet.
 */
export default function AdminPage() {
  return (
    <MinimalLayout>
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <ShieldAlert aria-hidden className="size-10 text-ink-500" />
        <h1 className="font-serif text-2xl font-semibold text-ink-900">Admin tools aren&apos;t available yet</h1>
        <p className="text-ink-500">
          Admin tools require sign-in and are available in a later release, alongside the checkout and account
          features they depend on.
        </p>
        <Link href="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          Back to the homepage
        </Link>
      </div>
    </MinimalLayout>
  );
}
