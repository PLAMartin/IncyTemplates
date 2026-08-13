import type { Metadata } from "next";
import Link from "next/link";
import { canonicalUrl } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: "Checkout cancelled",
  robots: { index: false, follow: false },
  alternates: { canonical: canonicalUrl("/checkout/cancelled") },
};

export default function CheckoutCancelledPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-ink-900">Checkout cancelled</h1>
      <p className="mt-2 text-ink-700">
        No payment was taken. You can pick up where you left off any time from the product page.
      </p>
      <Link href="/templates" className="mt-6 inline-block underline">
        Back to templates
      </Link>
    </div>
  );
}
