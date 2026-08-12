import "server-only";
import { createHash } from "node:crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import type { PublicVisibility } from "@/types/admin";
import type { FileFormat, FileRole } from "@/types/catalogue";

const BUCKET = "it-free-files";

export type AdminTemplateListItem = {
  id: string;
  slug: string;
  name: string;
  status: string;
  public_visibility: PublicVisibility;
  access_type: "free" | "paid";
  current_version: string | null;
};

export async function listTemplatesForAdmin(): Promise<AdminTemplateListItem[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("it_products")
    .select("id, slug, name, status, public_visibility, access_type, it_product_versions(version, is_current)")
    .eq("product_type", "template")
    .order("name", { ascending: true });
  if (error) throw new Error(`Failed to load templates: ${error.message}`);

  type Row = AdminTemplateListItem & { it_product_versions: { version: string; is_current: boolean }[] };
  return ((data ?? []) as unknown as Row[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    public_visibility: row.public_visibility,
    access_type: row.access_type,
    current_version: row.it_product_versions.find((v) => v.is_current)?.version ?? null,
  }));
}

export type AdminTemplateFile = {
  id: string;
  file_role: FileRole;
  file_format: FileFormat;
  display_name: string;
  original_filename: string;
  byte_size: number;
  created_at: string;
};

export type AdminTemplateVersion = {
  id: string;
  version: string;
  release_notes: string | null;
  is_current: boolean;
  released_at: string | null;
  files: AdminTemplateFile[];
};

export type AdminTemplateDetail = {
  id: string;
  slug: string;
  name: string;
  status: string;
  public_visibility: PublicVisibility;
  versions: AdminTemplateVersion[];
};

export async function getTemplateForAdmin(productId: string): Promise<AdminTemplateDetail | null> {
  const supabase = await getSupabaseServerClient();

  const { data: product, error: productError } = await supabase
    .from("it_products")
    .select("id, slug, name, status, public_visibility")
    .eq("id", productId)
    .eq("product_type", "template")
    .maybeSingle();
  if (productError) throw new Error(`Failed to load template: ${productError.message}`);
  if (!product) return null;

  const { data: versions, error: versionsError } = await supabase
    .from("it_product_versions")
    .select(
      "id, version, release_notes, is_current, released_at, it_files(id, file_role, file_format, display_name, original_filename, byte_size, created_at)",
    )
    .eq("product_id", productId)
    .order("released_at", { ascending: false });
  if (versionsError) throw new Error(`Failed to load versions: ${versionsError.message}`);

  return {
    ...product,
    versions: ((versions ?? []) as unknown as (AdminTemplateVersion & { it_files: AdminTemplateFile[] })[]).map((v) => ({
      id: v.id,
      version: v.version,
      release_notes: v.release_notes,
      is_current: v.is_current,
      released_at: v.released_at,
      files: v.it_files,
    })),
  };
}

export type ReplaceTemplateFileInput = {
  productId: string;
  version: string;
  releaseNotes?: string;
  fileRole: FileRole;
  fileFormat: FileFormat;
  displayName: string;
  isPublicPreview: boolean;
  originalFilename: string;
  mimeType: string;
  bytes: Buffer;
  actorProfileId: string;
};

const MAX_FILE_BYTES = 25 * 1024 * 1024;

/**
 * Write path: service-role for both the Storage upload and the DB write —
 * see it_replace_product_file (20260812120000_it_replace_product_file.sql)
 * for why the DB side is one atomic RPC rather than separate client calls.
 */
export async function replaceTemplateFile(input: ReplaceTemplateFileInput): Promise<void> {
  if (input.bytes.byteLength > MAX_FILE_BYTES) {
    throw new Error(`File is too large (${Math.round(input.bytes.byteLength / 1024 / 1024)}MB, max 25MB).`);
  }

  const supabase = getSupabaseServiceRoleClient();
  const checksum = createHash("sha256").update(input.bytes).digest("hex");
  const storagePath = `${input.productId}/${Date.now()}/${input.fileRole}/${input.originalFilename}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, input.bytes, {
    contentType: input.mimeType,
    upsert: false,
  });
  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { error: rpcError } = await supabase.rpc("it_replace_product_file", {
    p_product_id: input.productId,
    p_version: input.version,
    p_file_role: input.fileRole,
    p_file_format: input.fileFormat,
    p_display_name: input.displayName,
    p_storage_bucket: BUCKET,
    p_storage_path: storagePath,
    p_original_filename: input.originalFilename,
    p_mime_type: input.mimeType,
    p_byte_size: input.bytes.byteLength,
    p_checksum_sha256: checksum,
    p_actor_profile_id: input.actorProfileId,
    p_release_notes: input.releaseNotes ?? null,
    p_is_public_preview: input.isPublicPreview,
  });
  if (rpcError) {
    // The upload succeeded but the DB record didn't — clean up the orphaned object rather
    // than leaving unreferenced bytes in the bucket.
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw new Error(`Failed to record new version: ${rpcError.message}`);
  }
}
