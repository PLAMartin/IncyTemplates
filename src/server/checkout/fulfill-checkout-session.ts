import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripeClient } from "@/lib/stripe/client";

export type FulfillCheckoutSessionResult =
  | { ok: true; orderId: string; alreadyFulfilled: boolean }
  | { ok: false; reason: string };

const UNIQUE_VIOLATION = "23505";

/**
 * Idempotent fulfilment for one Stripe Checkout Session: creates the order + order item,
 * grants entitlements via the existing `it_grant_entitlement`/`it_expand_bundle_entitlements`
 * RPCs (never new entitlement-granting SQL), and records an audit-log entry. No `actor` — this
 * runs from a webhook with no signed-in session, so `it_write_audit_log`'s
 * `p_actor_profile_id` is deliberately left null (a system action, not a human one).
 *
 * Idempotency has two layers: a check-before-insert on `it_orders.stripe_checkout_session_id`
 * (handles a retried webhook delivery cleanly), and a unique-violation catch on the insert
 * itself (handles two near-simultaneous deliveries racing past the check).
 */
export async function fulfillCheckoutSession(
  supabase: SupabaseClient,
  checkoutSessionId: string,
): Promise<FulfillCheckoutSessionResult> {
  const existing = await findOrderByCheckoutSessionId(supabase, checkoutSessionId);
  if (existing.error) return { ok: false, reason: `Failed to check for an existing order: ${existing.error}` };
  if (existing.orderId) return { ok: true, orderId: existing.orderId, alreadyFulfilled: true };

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);

  if (session.payment_status !== "paid") {
    return { ok: false, reason: `Checkout session ${checkoutSessionId} is not paid (status: ${session.payment_status}).` };
  }

  const productId = session.metadata?.product_id;
  if (!productId) {
    return { ok: false, reason: `Checkout session ${checkoutSessionId} is missing product_id metadata.` };
  }

  const email = session.customer_details?.email ?? session.customer_email;
  if (!email) {
    return { ok: false, reason: `Checkout session ${checkoutSessionId} has no customer email.` };
  }

  const { data: product, error: productError } = await supabase
    .from("it_products")
    .select("id, name, product_type, currency_code, price_minor, stripe_price_id")
    .eq("id", productId)
    .maybeSingle();
  if (productError || !product) {
    return { ok: false, reason: `Product ${productId} not found while fulfilling ${checkoutSessionId}.` };
  }

  const stripeCustomerId = typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null);
  const normalizedEmail = email.toLowerCase();
  const now = new Date().toISOString();

  const customerId = await upsertCustomer(supabase, { email: normalizedEmail, stripeCustomerId, now });
  if (!customerId.ok) return { ok: false, reason: customerId.reason };

  const totalMinor = session.amount_total ?? product.price_minor ?? 0;
  const currencyCode = (session.currency ?? product.currency_code).toUpperCase();

  const { data: order, error: orderError } = await supabase
    .from("it_orders")
    .insert({
      customer_id: customerId.customerId,
      status: "paid",
      currency_code: currencyCode,
      subtotal_minor: totalMinor,
      total_minor: totalMinor,
      stripe_checkout_session_id: checkoutSessionId,
      stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null),
      stripe_customer_id: stripeCustomerId,
      customer_email: normalizedEmail,
      paid_at: now,
      metadata: { checkout_session_id: checkoutSessionId },
    })
    .select("id")
    .single();

  if (orderError?.code === UNIQUE_VIOLATION) {
    // Lost a race with another delivery of the same event — that delivery already fulfilled it.
    const raced = await findOrderByCheckoutSessionId(supabase, checkoutSessionId);
    if (raced.orderId) return { ok: true, orderId: raced.orderId, alreadyFulfilled: true };
  }
  if (orderError || !order) {
    return { ok: false, reason: `Failed to create order: ${orderError?.message}` };
  }

  const { data: orderItem, error: orderItemError } = await supabase
    .from("it_order_items")
    .insert({
      order_id: order.id,
      product_id: product.id,
      product_name_snapshot: product.name,
      product_type_snapshot: product.product_type,
      unit_amount_minor: totalMinor,
      total_minor: totalMinor,
      stripe_price_id: product.stripe_price_id,
    })
    .select("id")
    .single();
  if (orderItemError || !orderItem) {
    return { ok: false, reason: `Failed to create order item: ${orderItemError?.message}` };
  }

  const entitlementResult =
    product.product_type === "bundle"
      ? await supabase.rpc("it_expand_bundle_entitlements", {
          p_bundle_product_id: product.id,
          p_customer_id: customerId.customerId,
          p_source_order_item_id: orderItem.id,
          p_profile_id: null,
        })
      : await supabase.rpc("it_grant_entitlement", {
          p_customer_id: customerId.customerId,
          p_product_id: product.id,
          p_source_order_item_id: orderItem.id,
          p_source_bundle_product_id: null,
          p_profile_id: null,
          p_includes_future_updates: true,
        });
  if (entitlementResult.error) {
    return { ok: false, reason: `Failed to grant entitlement(s): ${entitlementResult.error.message}` };
  }

  await supabase.rpc("it_write_audit_log", {
    p_action: "checkout_fulfilled",
    p_entity_type: "it_orders",
    p_entity_id: order.id,
    p_before_state: null,
    p_after_state: { product_id: product.id, customer_id: customerId.customerId, total_minor: totalMinor, currency_code: currencyCode },
    p_reason: null,
    p_actor_profile_id: null,
  });

  return { ok: true, orderId: order.id, alreadyFulfilled: false };
}

async function findOrderByCheckoutSessionId(
  supabase: SupabaseClient,
  checkoutSessionId: string,
): Promise<{ orderId: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from("it_orders")
    .select("id")
    .eq("stripe_checkout_session_id", checkoutSessionId)
    .maybeSingle();
  return { orderId: data?.id ?? null, error: error?.message ?? null };
}

async function upsertCustomer(
  supabase: SupabaseClient,
  { email, stripeCustomerId, now }: { email: string; stripeCustomerId: string | null; now: string },
): Promise<{ ok: true; customerId: string } | { ok: false; reason: string }> {
  const { data: existingCustomer, error: lookupError } = await supabase
    .from("it_customers")
    .select("id")
    .eq("email", email)
    .eq("status", "active")
    .maybeSingle();
  if (lookupError) return { ok: false, reason: `Customer lookup failed: ${lookupError.message}` };

  if (existingCustomer) {
    const { error: updateError } = await supabase
      .from("it_customers")
      .update({ stripe_customer_id: stripeCustomerId, last_order_at: now })
      .eq("id", existingCustomer.id);
    if (updateError) return { ok: false, reason: `Failed to update customer: ${updateError.message}` };
    return { ok: true, customerId: existingCustomer.id };
  }

  const { data: created, error: createError } = await supabase
    .from("it_customers")
    .insert({ email, stripe_customer_id: stripeCustomerId, first_order_at: now, last_order_at: now })
    .select("id")
    .single();
  if (createError || !created) return { ok: false, reason: `Failed to create customer: ${createError?.message}` };
  return { ok: true, customerId: created.id };
}
