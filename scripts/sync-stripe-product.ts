/**
 * One-off script: creates a Stripe Product + Price for a paid it_products
 * row (by slug) and writes the returned stripe_product_id/stripe_price_id
 * back onto that row. This is the actual unblock for a live Stripe
 * checkout test — see docs/decisions/0051-stripe-checkout-fulfillment.md's
 * Follow-up section.
 *
 * Cannot be run without a real STRIPE_SECRET_KEY (test-mode key is fine and
 * free — no card required). Not run as part of this decision's build pass;
 * ready to run once test keys exist.
 *
 * Idempotent by skipping, not by updating: Stripe Prices are immutable, so
 * if the row already has a stripe_price_id this script does nothing rather
 * than creating a duplicate Price. To change a price, archive the old
 * Stripe Price/clear the row's stripe_price_id, then re-run.
 *
 * Run with `npm run sync:stripe-product -- <slug>` (defaults to idea-intake).
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";

async function main() {
  const slug = process.argv[2] ?? "idea-intake";

  const envLocalPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envLocalPath)) {
    process.loadEnvFile(envLocalPath);
  }

  // Imported after loadEnvFile so src/lib/env picks up .env.local's values.
  const { getSupabaseServiceRoleClient, hasServiceRoleConfig } = await import("../src/lib/supabase/service-role-client");
  const { getStripeClient, hasStripeConfig } = await import("../src/lib/stripe/client");

  if (!hasServiceRoleConfig()) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — set them in .env.local before running this script.",
    );
    process.exitCode = 1;
    return;
  }

  if (!hasStripeConfig()) {
    console.error("Missing STRIPE_SECRET_KEY — set a Stripe test-mode secret key in .env.local before running this script.");
    process.exitCode = 1;
    return;
  }

  const supabase = getSupabaseServiceRoleClient();
  const { data: product, error } = await supabase
    .from("it_products")
    .select("id, slug, name, access_type, price_minor, currency_code, stripe_product_id, stripe_price_id")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !product) {
    console.error(`No product found with slug "${slug}": ${error?.message ?? "not found"}`);
    process.exitCode = 1;
    return;
  }

  if (product.access_type !== "paid" || !product.price_minor) {
    console.error(`"${slug}" is not a priced paid product (access_type=${product.access_type}, price_minor=${product.price_minor}).`);
    process.exitCode = 1;
    return;
  }

  if (product.stripe_price_id) {
    console.log(
      `"${slug}" is already synced (stripe_product_id=${product.stripe_product_id}, stripe_price_id=${product.stripe_price_id}). Nothing to do.`,
    );
    return;
  }

  const stripe = getStripeClient();

  let stripeProductId = product.stripe_product_id;
  if (!stripeProductId) {
    const created = await stripe.products.create({
      name: product.name,
      metadata: { it_product_id: product.id, it_product_slug: product.slug },
    });
    stripeProductId = created.id;
  }

  const price = await stripe.prices.create({
    product: stripeProductId,
    unit_amount: product.price_minor,
    currency: product.currency_code.toLowerCase(),
    metadata: { it_product_id: product.id },
  });

  const { error: updateError } = await supabase
    .from("it_products")
    .update({ stripe_product_id: stripeProductId, stripe_price_id: price.id })
    .eq("id", product.id);
  if (updateError) {
    console.error(`Created Stripe objects but failed to write them back to the product row: ${updateError.message}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Synced "${slug}": stripe_product_id=${stripeProductId}, stripe_price_id=${price.id}`);
}

main();
