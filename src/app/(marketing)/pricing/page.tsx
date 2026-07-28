import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { canonicalUrl } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: "Pricing",
  description: "How pricing works at Incy Templates: free templates, individually priced templates, and bundles.",
  alternates: { canonical: canonicalUrl("/pricing") },
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">Pricing</h1>
      <p className="mt-4 text-lg text-ink-700">
        Simple, one-time pricing — no subscriptions. Prices below are shown in GBP.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-md border border-ink-200 bg-paper-raised p-5">
          <h2 className="font-semibold text-ink-900">Free templates</h2>
          <p className="mt-1 text-2xl font-semibold text-ink-900">£0</p>
          <p className="mt-2 text-sm text-ink-500">A genuinely useful set of templates with no account or payment required.</p>
        </div>
        <div className="rounded-md border border-ink-200 bg-paper-raised p-5">
          <h2 className="font-semibold text-ink-900">Individual templates</h2>
          <p className="mt-1 text-2xl font-semibold text-ink-900">One-time price</p>
          <p className="mt-2 text-sm text-ink-500">Priced per template, shown on each product page. No recurring charges.</p>
        </div>
        <div className="rounded-md border border-ink-200 bg-paper-raised p-5">
          <h2 className="font-semibold text-ink-900">Bundles</h2>
          <p className="mt-1 text-2xl font-semibold text-ink-900">Bundle price</p>
          <p className="mt-2 text-sm text-ink-500">Several related templates at a lower combined price than buying separately.</p>
        </div>
      </div>

      <div className="guide-prose mt-10">
        <h2>Where we are right now</h2>
        <p>
          Checkout isn&apos;t live yet — this catalogue is a read-only preview while we build the purchase and
          download flow. Every product and bundle page shows its real price and lets you join a waitlist so we can
          email you the moment it&apos;s available; there&apos;s no hidden charge or account required to do that.
        </p>
        <h2>Tax</h2>
        <p>
          Prices shown do not yet reflect a finalised tax treatment. Our approach to VAT/tax and whether a
          merchant-of-record service is used will be confirmed and clearly stated before checkout goes live.
        </p>
        <h2>Refunds and licensing</h2>
        <p>
          Our refund policy and licence terms are still pending legal review — see the{" "}
          <a href="/legal/refunds">refund policy</a> and <a href="/legal/licences">licence terms</a> pages for their
          current status.
        </p>
      </div>

      <div className="mt-10">
        <ButtonLink href="/templates">Browse templates and see real prices</ButtonLink>
      </div>
    </div>
  );
}
