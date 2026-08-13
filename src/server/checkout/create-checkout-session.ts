import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripeClient } from "@/lib/stripe/client";
import { serverEnv } from "@/lib/env/server";

export type CreateCheckoutSessionResult =
  | { ok: true; url: string }
  | { ok: false; reason: "not_found" | "not_purchasable" };

/**
 * Validates a product is genuinely purchasable and creates a Stripe Checkout Session for it.
 * `origin` is the caller's own request origin (not a static site-config value) so success/cancel
 * URLs are correct in local dev, preview deployments and production alike — same reasoning as
 * `auth/callback/route.ts`'s `request.nextUrl.origin` use.
 *
 * `customer_creation: "always"` ensures Stripe returns a Customer even for guest checkout with
 * no saved payment method, so `it_customers.stripe_customer_id` reliably populates during
 * fulfilment (spec §9.6: buy without an existing account).
 */
export async function createCheckoutSession(
  supabase: SupabaseClient,
  { productId, origin }: { productId: string; origin: string },
): Promise<CreateCheckoutSessionResult> {
  const { data: product, error } = await supabase
    .from("it_products")
    .select("id, product_type, access_type, status, stripe_price_id")
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    console.error("Product lookup failed:", error.message);
    return { ok: false, reason: "not_found" };
  }

  if (!product) {
    return { ok: false, reason: "not_found" };
  }

  const purchasable = product.status === "published" && product.access_type === "paid" && Boolean(product.stripe_price_id);
  if (!purchasable) {
    return { ok: false, reason: "not_purchasable" };
  }

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: product.stripe_price_id!, quantity: 1 }],
    customer_creation: "always",
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancelled`,
    metadata: {
      product_id: product.id,
      product_type: product.product_type,
      environment: serverEnv.APP_ENV,
    },
  });

  if (!session.url) {
    console.error(`Stripe returned a Checkout Session with no url for product ${productId}`);
    return { ok: false, reason: "not_purchasable" };
  }

  return { ok: true, url: session.url };
}
