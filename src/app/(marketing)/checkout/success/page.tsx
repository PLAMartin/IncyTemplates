import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, Clock } from "lucide-react";
import { getOrderByCheckoutSessionId } from "@/server/checkout/get-order-by-checkout-session-id";
import { formatMinorUnits } from "@/lib/money/bundle-savings";
import { DownloadOrderButton } from "@/components/checkout/download-order-button";

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ session_id?: string }> };

/**
 * Stripe redirects here immediately on payment success — the webhook that actually fulfils the
 * order (src/server/checkout/fulfill-checkout-session.ts) can land a moment after or before this
 * page loads. No order found yet is therefore a normal, expected transient state, not an error.
 */
export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;
  const order = sessionId ? await getOrderByCheckoutSessionId(sessionId) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      {order && order.status === "paid" ? (
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <CircleCheck aria-hidden className="mt-1 size-8 shrink-0 text-brand-600" />
            <div>
              <h1 className="font-serif text-3xl font-semibold text-ink-900">Thanks for your order</h1>
              <p className="mt-2 text-ink-700">
                {order.productName} — {formatMinorUnits(order.totalMinor, order.currencyCode)}. A confirmation has been
                sent to {order.customerEmail}.
              </p>
            </div>
          </div>
          {sessionId ? <DownloadOrderButton sessionId={sessionId} /> : null}
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <Clock aria-hidden className="mt-1 size-8 shrink-0 text-ink-500" />
          <div>
            <h1 className="font-serif text-3xl font-semibold text-ink-900">Confirming your order…</h1>
            <p className="mt-2 text-ink-700">
              This usually takes a few seconds. If this doesn&apos;t update shortly,{" "}
              <a href="." className="underline">
                refresh this page
              </a>{" "}
              or <Link href="/contact">contact us</Link> with your payment confirmation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
