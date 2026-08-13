import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export const PAID_FILES_BUCKET = "it-paid-files";

export type ResolvedPaidOrderFile =
  | { ok: true; storagePath: string; originalFilename: string | null }
  | { ok: false; reason: "not_found" };

/**
 * Given a Stripe Checkout Session id (the buyer's proof of purchase — unguessable, embedded in
 * the success-page redirect URL by Stripe itself), verifies the resulting order is paid and
 * resolves the purchased product's current template file in the paid-files bucket. Mirrors
 * resolveFreeTemplateFile's shape, keyed off the order rather than access_type='free' — never
 * trust a client-supplied productId/fileId directly, only what the order itself proves.
 *
 * Assumes exactly one file_role='template' file on the current version, matching every paid
 * product in the seed catalogue today. A product with multiple downloadable files (example,
 * facilitator guide, etc.) is out of scope for this pass.
 */
export async function resolvePaidOrderFile(
  supabase: SupabaseClient,
  { checkoutSessionId }: { checkoutSessionId: string },
): Promise<ResolvedPaidOrderFile> {
  const { data: order, error: orderError } = await supabase
    .from("it_orders")
    .select("id, status, it_order_items(product_id)")
    .eq("stripe_checkout_session_id", checkoutSessionId)
    .maybeSingle();

  if (orderError) {
    console.error("Order lookup failed:", orderError.message);
    return { ok: false, reason: "not_found" };
  }

  const productId = (order?.it_order_items as { product_id: string }[] | null)?.[0]?.product_id;
  if (!order || order.status !== "paid" || !productId) {
    return { ok: false, reason: "not_found" };
  }

  const { data: version, error: versionError } = await supabase
    .from("it_product_versions")
    .select("id")
    .eq("product_id", productId)
    .eq("is_current", true)
    .maybeSingle();

  if (versionError || !version) {
    return { ok: false, reason: "not_found" };
  }

  const { data: file, error: fileError } = await supabase
    .from("it_files")
    .select("id, storage_bucket, storage_path, original_filename")
    .eq("product_version_id", version.id)
    .eq("file_role", "template")
    .maybeSingle();

  if (fileError || !file || file.storage_bucket !== PAID_FILES_BUCKET) {
    return { ok: false, reason: "not_found" };
  }

  return { ok: true, storagePath: file.storage_path, originalFilename: file.original_filename ?? null };
}
