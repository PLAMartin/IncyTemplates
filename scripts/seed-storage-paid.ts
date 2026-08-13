/**
 * Uploads the paid-template markdown files in content/seed/paid-files/ to
 * the `it-paid-files` Storage bucket on the live linked Supabase project,
 * and upserts the matching it_product_versions / it_files rows so the paid
 * download flow (src/server/checkout/resolve-paid-order-file.ts) has real
 * file rows to read.
 *
 * Mirrors scripts/seed-storage.ts exactly, scoped to the paid bucket instead
 * of the free one. This script connects directly to Supabase using the
 * service-role key and mutates the live project — it needs
 * NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set in .env.local,
 * and the `it-paid-files` bucket migration
 * (20260813150000_paid_files_storage_bucket.sql) must already be pushed.
 *
 * Only covers file_role "template" files (markdown) for products with
 * access_type "paid" that have a matching content/seed/paid-files/<slug>.md
 * file — products without one are skipped, not treated as an error, so this
 * can be re-run as more paid content is written.
 *
 * Idempotent: safe to re-run (storage upload uses upsert: true, DB rows
 * upsert on id).
 *
 * Run with `npm run seed:storage:paid` (wired to `tsx scripts/seed-storage-paid.ts`).
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const BUCKET = "it-paid-files";

async function main() {
  const envLocalPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envLocalPath)) {
    process.loadEnvFile(envLocalPath);
  }

  // Imported after loadEnvFile so src/lib/env picks up .env.local's values.
  const { default: catalogue } = await import("../content/seed/catalogue");
  const { getSupabaseServiceRoleClient, hasServiceRoleConfig } = await import("../src/lib/supabase/service-role-client");
  const { deterministicUuid } = await import("./lib/deterministic-uuid");

  if (!hasServiceRoleConfig()) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — set them in .env.local before running this script.",
    );
    process.exitCode = 1;
    return;
  }

  const supabase = getSupabaseServiceRoleClient();
  const paidProducts = catalogue.products.filter((p) => p.access_type === "paid" && p.product_type === "template");

  let uploaded = 0;

  for (const product of paidProducts) {
    const templateFile = product.files.find((f) => f.file_role === "template" && f.file_format === "markdown");
    if (!templateFile) {
      console.warn(`Skipping ${product.slug}: no markdown template file in catalogue.ts`);
      continue;
    }

    const filePath = resolve(process.cwd(), "content/seed/paid-files", `${product.slug}.md`);
    let bytes: Buffer;
    try {
      bytes = readFileSync(filePath);
    } catch {
      console.warn(`Skipping ${product.slug}: no content file at ${filePath}`);
      continue;
    }

    const productId = deterministicUuid(`product:${product.slug}`);
    const versionId = deterministicUuid(`product-version:${product.slug}:${product.current_version ?? "1.0"}`);
    const fileId = deterministicUuid(`file:${templateFile.id}`);
    const filename = `${product.slug}.md`;
    const storagePath = `${productId}/${versionId}/template/${filename}`;
    const checksum = createHash("sha256").update(bytes).digest("hex");

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, bytes, {
      contentType: "text/markdown; charset=utf-8",
      upsert: true,
    });
    if (uploadError) {
      console.error(`Upload failed for ${product.slug}: ${uploadError.message}`);
      process.exitCode = 1;
      continue;
    }

    const { error: versionError } = await supabase.from("it_product_versions").upsert({
      id: versionId,
      product_id: productId,
      version: product.current_version ?? "1.0",
      is_current: true,
    });
    if (versionError) {
      console.error(`it_product_versions upsert failed for ${product.slug}: ${versionError.message}`);
      process.exitCode = 1;
      continue;
    }

    const { error: fileError } = await supabase.from("it_files").upsert({
      id: fileId,
      product_version_id: versionId,
      file_role: templateFile.file_role,
      file_format: templateFile.file_format,
      display_name: templateFile.display_name,
      storage_bucket: BUCKET,
      storage_path: storagePath,
      original_filename: filename,
      mime_type: "text/markdown",
      byte_size: bytes.byteLength,
      checksum_sha256: checksum,
      is_public_preview: templateFile.is_public_preview,
    });
    if (fileError) {
      console.error(`it_files upsert failed for ${product.slug}: ${fileError.message}`);
      process.exitCode = 1;
      continue;
    }

    uploaded += 1;
    console.log(`Seeded ${product.slug} (${bytes.byteLength} bytes) -> ${storagePath}`);
  }

  console.log(`Done: ${uploaded}/${paidProducts.length} paid templates checked, files uploaded where content existed.`);
}

main();
