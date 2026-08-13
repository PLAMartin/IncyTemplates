import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { serverEnv } from "@/lib/env/server";
import { getStripeClient, hasStripeConfig } from "@/lib/stripe/client";
import { getSupabaseServiceRoleClient, hasServiceRoleConfig } from "@/lib/supabase/service-role-client";
import { fulfillCheckoutSession } from "@/server/checkout/fulfill-checkout-session";

export const runtime = "nodejs";

const UNIQUE_VIOLATION = "23505";

/**
 * Stripe requires the raw, unparsed request body for signature verification — `request.text()`,
 * never `request.json()` (which no other route in this app needs, since this is the first
 * webhook receiver here).
 *
 * Only `checkout.session.completed` is processed this pass. Every other event type spec §19.3
 * lists (async_payment_succeeded/failed, payment_intent.payment_failed, charge.refunded, dispute
 * events) is still recorded in it_webhook_events for audit/idempotency, but not acted on —
 * explicit, flagged follow-up (docs/decisions/0051-stripe-checkout-fulfillment.md), not silently
 * dropped.
 */
export async function POST(request: NextRequest) {
  if (!hasServiceRoleConfig() || !hasStripeConfig() || !serverEnv.STRIPE_WEBHOOK_SECRET) {
    // 503, not 400/403 — Stripe treats a 5xx as "retry later," which is correct for a
    // misconfigured-environment failure rather than a genuinely bad delivery.
    return NextResponse.json({ error: "Webhook receiving isn't configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, serverEnv.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const supabase = getSupabaseServiceRoleClient();

  const { data: recorded, error: recordError } = await supabase
    .from("it_webhook_events")
    .insert({
      provider: "stripe",
      provider_event_id: event.id,
      event_type: event.type,
      payload: event as unknown as Record<string, unknown>,
    })
    .select("id")
    .single();

  if (recordError) {
    if (recordError.code === UNIQUE_VIOLATION) {
      // Duplicate delivery of an event already recorded — acknowledge without reprocessing.
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("Failed to record Stripe webhook event:", recordError.message);
    return NextResponse.json({ error: "Failed to record event." }, { status: 500 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, processed: false });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const result = await fulfillCheckoutSession(supabase, session.id);

  if (!result.ok) {
    console.error(`Fulfilment failed for checkout session ${session.id}: ${result.reason}`);
    await supabase
      .from("it_webhook_events")
      .update({ processing_status: "failed", last_error: result.reason, attempts: 1 })
      .eq("id", recorded.id);
    return NextResponse.json({ error: "Fulfilment failed." }, { status: 500 });
  }

  await supabase
    .from("it_webhook_events")
    .update({ processing_status: "processed", processed_at: new Date().toISOString() })
    .eq("id", recorded.id);

  return NextResponse.json({ received: true });
}
