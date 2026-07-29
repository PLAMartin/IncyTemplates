import type { SupabaseClient } from "@supabase/supabase-js";

export const FREE_FILES_BUCKET = "it-free-files";

export type ResolvedFreeTemplateFile =
  | { ok: true; storagePath: string; originalFilename: string | null }
  | { ok: false; reason: "not_found" };

/**
 * Shared eligibility + lookup used both when minting a view grant (route)
 * and when reading file content (view page, which re-checks at view time
 * since a product could be unpublished in the window between form submit
 * and page load).
 */
export async function resolveFreeTemplateFile(
  supabase: SupabaseClient,
  { productId, fileId }: { productId: string; fileId: string },
): Promise<ResolvedFreeTemplateFile> {
  const { data: product, error: productError } = await supabase
    .from("it_products")
    .select("id, access_type, status")
    .eq("id", productId)
    .maybeSingle();

  if (productError) {
    console.error("Product lookup failed:", productError.message);
    return { ok: false, reason: "not_found" };
  }

  const productAvailable = product && product.access_type === "free" && product.status === "published";
  if (!productAvailable) {
    return { ok: false, reason: "not_found" };
  }

  const { data: version, error: versionError } = await supabase
    .from("it_product_versions")
    .select("id")
    .eq("product_id", productId)
    .eq("is_current", true)
    .maybeSingle();

  if (versionError) {
    console.error("Product version lookup failed:", versionError.message);
    return { ok: false, reason: "not_found" };
  }

  if (!version) {
    return { ok: false, reason: "not_found" };
  }

  const { data: file, error: fileError } = await supabase
    .from("it_files")
    .select("id, storage_bucket, storage_path, original_filename")
    .eq("id", fileId)
    .eq("product_version_id", version.id)
    .maybeSingle();

  if (fileError) {
    console.error("File lookup failed:", fileError.message);
    return { ok: false, reason: "not_found" };
  }

  if (!file || file.storage_bucket !== FREE_FILES_BUCKET) {
    return { ok: false, reason: "not_found" };
  }

  return { ok: true, storagePath: file.storage_path, originalFilename: file.original_filename ?? null };
}
