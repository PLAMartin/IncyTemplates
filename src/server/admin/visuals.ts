import "server-only";
import { createHash } from "node:crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import { serverEnv } from "@/lib/env/server";
import { buildVisualPrompt } from "@/lib/visuals/build-visual-prompt";
import {
  resolveDefaultVisualGenerationProvider,
  resolveVisualGenerationProvider,
  VisualGenerationError,
  type VisualGenerationOptions,
  type VisualProviderKey,
} from "@/lib/visuals/providers";
import type { VisualAssetStatus, VisualAssetType, VisualBrief, VisualSourceType } from "@/lib/visuals/types";
import {
  checkVisualGenerationBudgetAndRateLimits,
  completeVisualGenerationJob,
  createVisualGenerationJob,
  failVisualGenerationJob,
} from "@/server/admin/visual-generation-jobs";

const CANDIDATE_BUCKET = "it-admin-staging";
const PUBLIC_BUCKET = "it-public-assets";
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
/** Absolute ceiling (spec §14.13's DB check constraint mirrors this). VISUAL_GENERATION_MAX_CANDIDATES can only lower it further. */
const MAX_CANDIDATE_COUNT = 4;

export type AdminFrameworkVisualSummary = {
  frameworkId: string;
  frameworkName: string;
  frameworkSlug: string;
  publishedAssetTypes: VisualAssetType[];
  openCandidateCount: number;
};

/** List (read path, session-bound RLS-respecting client — staff read every status, see 0045). */
export async function listFrameworkVisualSummaries(): Promise<AdminFrameworkVisualSummary[]> {
  const supabase = await getSupabaseServerClient();

  const { data: frameworks, error: frameworksError } = await supabase
    .from("it_frameworks")
    .select("id, name, slug")
    .order("name", { ascending: true });
  if (frameworksError) throw new Error(`Failed to load frameworks: ${frameworksError.message}`);

  const { data: assets, error: assetsError } = await supabase
    .from("it_visual_assets")
    .select("framework_id, asset_type, status")
    .not("framework_id", "is", null);
  if (assetsError) throw new Error(`Failed to load visual assets: ${assetsError.message}`);

  return (frameworks ?? []).map((framework) => {
    const rows = (assets ?? []).filter((a) => a.framework_id === framework.id);
    return {
      frameworkId: framework.id,
      frameworkName: framework.name,
      frameworkSlug: framework.slug,
      publishedAssetTypes: [
        ...new Set(rows.filter((r) => r.status === "published").map((r) => r.asset_type as VisualAssetType)),
      ],
      openCandidateCount: rows.filter((r) => r.status === "candidate" || r.status === "selected").length,
    };
  });
}

export type AdminVisualAsset = {
  id: string;
  assetType: VisualAssetType;
  sourceType: VisualSourceType;
  status: VisualAssetStatus;
  visualBrief: VisualBrief | null;
  recipeName: string | null;
  recipeVersion: number | null;
  provider: string | null;
  providerModel: string | null;
  storageBucket: string | null;
  storagePath: string | null;
  url: string | null;
  altText: string | null;
  decorative: boolean;
  createdAt: string;
  selectedAt: string | null;
  approvedAt: string | null;
  publishedAt: string | null;
  archivedAt: string | null;
};

export type AdminFrameworkVisualsDetail = {
  frameworkId: string;
  frameworkName: string;
  frameworkSlug: string;
  activeRecipe: { id: string; name: string; version: number } | null;
  assets: AdminVisualAsset[];
};

/**
 * `it-public-assets` is a public bucket (plain public URL works everywhere). `it-admin-staging`
 * (unapproved candidates) is private — a plain public URL 404s unauthenticated, so candidate
 * previews need a short-lived signed URL instead, generated with the service-role client since
 * this whole function already runs behind requireStaffSession() at the page/layout level.
 */
async function urlFor(
  bucket: string | null,
  path: string | null,
  client: ReturnType<typeof getSupabaseServiceRoleClient>,
): Promise<string | null> {
  if (!bucket || !path) return null;
  if (bucket === PUBLIC_BUCKET) {
    return client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }
  const { data, error } = await client.storage.from(bucket).createSignedUrl(path, 600);
  if (error) return null;
  return data.signedUrl;
}

export async function getFrameworkVisualsForAdmin(frameworkId: string): Promise<AdminFrameworkVisualsDetail | null> {
  const supabase = await getSupabaseServerClient();

  const { data: framework, error: frameworkError } = await supabase
    .from("it_frameworks")
    .select("id, name, slug")
    .eq("id", frameworkId)
    .maybeSingle();
  if (frameworkError) throw new Error(`Failed to load framework: ${frameworkError.message}`);
  if (!framework) return null;

  const { data: recipe } = await supabase
    .from("it_visual_recipes")
    .select("id, name, version")
    .eq("status", "approved")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: assets, error: assetsError } = await supabase
    .from("it_visual_assets")
    .select(
      "id, asset_type, source_type, status, visual_brief, provider, provider_model, storage_bucket, storage_path, alt_text, decorative, created_at, selected_at, approved_at, published_at, archived_at, it_visual_recipes(name, version)",
    )
    .eq("framework_id", frameworkId)
    .order("created_at", { ascending: false });
  if (assetsError) throw new Error(`Failed to load visual assets: ${assetsError.message}`);

  const serviceRoleForUrls = getSupabaseServiceRoleClient();

  type RawRow = {
    id: string;
    asset_type: VisualAssetType;
    source_type: VisualSourceType;
    status: VisualAssetStatus;
    visual_brief: VisualBrief | null;
    provider: string | null;
    provider_model: string | null;
    storage_bucket: string | null;
    storage_path: string | null;
    alt_text: string | null;
    decorative: boolean;
    created_at: string;
    selected_at: string | null;
    approved_at: string | null;
    published_at: string | null;
    archived_at: string | null;
    it_visual_recipes: { name: string; version: number } | null;
  };
  const rows = await Promise.all(
    ((assets ?? []) as unknown as RawRow[]).map(async (row) => ({
      id: row.id,
      assetType: row.asset_type,
      sourceType: row.source_type,
      status: row.status,
      visualBrief: row.visual_brief,
      recipeName: row.it_visual_recipes?.name ?? null,
      recipeVersion: row.it_visual_recipes?.version ?? null,
      provider: row.provider,
      providerModel: row.provider_model ?? null,
      storageBucket: row.storage_bucket,
      storagePath: row.storage_path,
      url: await urlFor(row.storage_bucket, row.storage_path, serviceRoleForUrls),
      altText: row.alt_text,
      decorative: row.decorative,
      createdAt: row.created_at,
      selectedAt: row.selected_at,
      approvedAt: row.approved_at,
      publishedAt: row.published_at,
      archivedAt: row.archived_at,
    })),
  );

  return {
    frameworkId: framework.id,
    frameworkName: framework.name,
    frameworkSlug: framework.slug,
    activeRecipe: recipe ? { id: recipe.id, name: recipe.name, version: recipe.version } : null,
    assets: rows,
  };
}

async function writeAuditLog(
  action: string,
  entityId: string,
  actorProfileId: string,
  afterState?: Record<string, unknown>,
): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();
  await supabase.rpc("it_write_audit_log", {
    p_action: action,
    p_entity_type: "it_visual_assets",
    p_entity_id: entityId,
    p_before_state: null,
    p_after_state: afterState ?? null,
    p_reason: null,
    p_actor_profile_id: actorProfileId,
  });
}

export type GenerateVisualCandidatesInput = {
  frameworkId: string;
  assetType: VisualAssetType;
  brief: VisualBrief;
  candidateCount: number;
  actorProfileId: string;
  /** Defaults to VISUAL_GENERATION_PROVIDER (spec §34) when omitted. */
  provider?: VisualProviderKey;
};

/**
 * Generation path (spec v6 §9.12/§9.13 point 4/6): server-side only, bounded candidate count,
 * staged privately. Provider is resolved through the registry (src/lib/visuals/providers) —
 * defaults to VISUAL_GENERATION_PROVIDER ("test" in this repo's .env, since no live
 * OPENAI_API_KEY exists yet — see docs/decisions/0050-openai-visual-provider.md). One
 * it_visual_generation_jobs row is created per call and tracks the whole request independently
 * of the candidate rows it produces, per spec §14.13.
 */
export async function generateVisualCandidates(input: GenerateVisualCandidatesInput): Promise<number> {
  const providerKey = input.provider ?? resolveDefaultVisualGenerationProvider();
  const count = Math.min(Math.max(input.candidateCount, 1), Math.min(serverEnv.VISUAL_GENERATION_MAX_CANDIDATES, MAX_CANDIDATE_COUNT));
  const supabase = getSupabaseServiceRoleClient();

  const { data: recipeRow, error: recipeError } = await supabase
    .from("it_visual_recipes")
    .select("id, recipe_key, version, name, status, config_data, prompt_template")
    .eq("status", "approved")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (recipeError || !recipeRow) {
    throw new Error(`No approved Visual Recipe exists yet: ${recipeError?.message ?? "run npm run seed:visual-recipe"}`);
  }

  await checkVisualGenerationBudgetAndRateLimits(input.actorProfileId, providerKey);

  const provider = resolveVisualGenerationProvider(providerKey);
  const recipe = {
    id: recipeRow.id,
    recipeKey: recipeRow.recipe_key,
    version: recipeRow.version,
    name: recipeRow.name,
    status: recipeRow.status,
    configData: recipeRow.config_data,
    promptTemplate: recipeRow.prompt_template,
  };
  const request = { assetType: input.assetType, brief: input.brief, recipe };
  const options: VisualGenerationOptions = {
    provider: providerKey,
    candidateCount: count,
    qualityProfile: serverEnv.OPENAI_IMAGE_QUALITY_PROFILE,
    outputProfile: serverEnv.OPENAI_IMAGE_OUTPUT_PROFILE,
  };
  const promptSnapshot = buildVisualPrompt(request, options);

  const jobId = await createVisualGenerationJob({
    frameworkId: input.frameworkId,
    productId: null,
    assetType: input.assetType,
    providerKey,
    providerModel: providerKey === "openai" ? serverEnv.OPENAI_IMAGE_MODEL_SNAPSHOT || serverEnv.OPENAI_IMAGE_MODEL : null,
    providerModelSnapshot: providerKey === "openai" ? serverEnv.OPENAI_IMAGE_MODEL_SNAPSHOT || null : null,
    visualRecipeId: recipeRow.id,
    visualBrief: input.brief,
    promptSnapshot,
    requestConfig: { qualityProfile: options.qualityProfile, outputProfile: options.outputProfile },
    requestedCandidates: count,
    actorProfileId: input.actorProfileId,
  });

  let candidates;
  try {
    candidates = await provider.generate(request, options);
  } catch (error) {
    const generationError =
      error instanceof VisualGenerationError
        ? error
        : new VisualGenerationError("unknown", error instanceof Error ? error.message : "Generation failed.");
    await failVisualGenerationJob(jobId, generationError);
    throw new Error(generationError.message);
  }

  let staged = 0;
  for (const candidate of candidates) {
    const bytes = Buffer.from(candidate.bytes);
    const checksum = createHash("sha256").update(bytes).digest("hex");
    const extension = candidate.mimeType.includes("svg") ? "svg" : candidate.mimeType.split("/")[1] || "bin";
    const path = `visuals/${input.frameworkId}/candidates/${Date.now()}-${staged}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(CANDIDATE_BUCKET)
      .upload(path, bytes, { contentType: candidate.mimeType, upsert: false });
    if (uploadError) throw new Error(`Candidate upload failed: ${uploadError.message}`);

    const { data: inserted, error: insertError } = await supabase
      .from("it_visual_assets")
      .insert({
        framework_id: input.frameworkId,
        asset_type: input.assetType,
        source_type: "generated",
        status: "candidate",
        visual_recipe_id: recipeRow.id,
        generation_job_id: jobId,
        visual_brief: input.brief,
        prompt_snapshot: promptSnapshot,
        provider: candidate.provider,
        provider_model: candidate.model ?? null,
        generation_metadata: candidate.metadata ?? {},
        storage_bucket: CANDIDATE_BUCKET,
        storage_path: path,
        mime_type: candidate.mimeType,
        byte_size: bytes.byteLength,
        checksum_sha256: checksum,
        created_by: input.actorProfileId,
      })
      .select("id")
      .single();
    if (insertError || !inserted) throw new Error(`Failed to record candidate: ${insertError?.message}`);

    await writeAuditLog("visual_generate", inserted.id, input.actorProfileId, { asset_type: input.assetType });
    staged += 1;
  }

  await completeVisualGenerationJob(jobId, staged, count);

  return staged;
}

export type UploadVisualCandidateInput = {
  frameworkId: string;
  assetType: VisualAssetType;
  brief: VisualBrief;
  originalFilename: string;
  mimeType: string;
  bytes: Buffer;
  actorProfileId: string;
};

/** Upload path (spec §9.12 point 4): MIME/size validated, staged privately like a generated candidate. */
export async function uploadVisualCandidate(input: UploadVisualCandidateInput): Promise<void> {
  if (!input.mimeType.startsWith("image/")) {
    throw new Error("Only image files are accepted.");
  }
  if (input.bytes.byteLength > MAX_UPLOAD_BYTES) {
    throw new Error(`File is too large (${Math.round(input.bytes.byteLength / 1024 / 1024)}MB, max 10MB).`);
  }

  const supabase = getSupabaseServiceRoleClient();
  const checksum = createHash("sha256").update(input.bytes).digest("hex");
  const path = `visuals/${input.frameworkId}/candidates/${Date.now()}-${input.originalFilename.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;

  const { error: uploadError } = await supabase.storage
    .from(CANDIDATE_BUCKET)
    .upload(path, input.bytes, { contentType: input.mimeType, upsert: false });
  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { data: inserted, error: insertError } = await supabase
    .from("it_visual_assets")
    .insert({
      framework_id: input.frameworkId,
      asset_type: input.assetType,
      source_type: "uploaded",
      status: "candidate",
      visual_brief: input.brief,
      storage_bucket: CANDIDATE_BUCKET,
      storage_path: path,
      mime_type: input.mimeType,
      byte_size: input.bytes.byteLength,
      checksum_sha256: checksum,
      original_filename: input.originalFilename,
      created_by: input.actorProfileId,
    })
    .select("id")
    .single();
  if (insertError || !inserted) {
    await supabase.storage.from(CANDIDATE_BUCKET).remove([path]);
    throw new Error(`Failed to record upload: ${insertError?.message}`);
  }

  await writeAuditLog("visual_upload", inserted.id, input.actorProfileId, { asset_type: input.assetType });
}

export async function selectVisualCandidate(assetId: string, actorProfileId: string): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();
  const { error } = await supabase.rpc("it_select_visual_candidate", {
    p_asset_id: assetId,
    p_actor_profile_id: actorProfileId,
  });
  if (error) throw new Error(`Failed to select candidate: ${error.message}`);
}

export async function rejectVisualCandidate(assetId: string, actorProfileId: string, reason?: string): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();
  const { error } = await supabase.rpc("it_reject_visual_candidate", {
    p_asset_id: assetId,
    p_actor_profile_id: actorProfileId,
    p_reason: reason ?? null,
  });
  if (error) throw new Error(`Failed to reject candidate: ${error.message}`);
}

export async function updateVisualAltText(assetId: string, altText: string, decorative: boolean): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("it_visual_assets")
    .update({ alt_text: decorative ? null : altText, decorative })
    .eq("id", assetId);
  if (error) throw new Error(`Failed to update alt text: ${error.message}`);
}

const VARIANTS: { key: string; width: number; height: number }[] = [
  { key: "card_md", width: 480, height: 360 },
  { key: "hero_lg", width: 960, height: 720 },
];

/**
 * Approve-and-publish (spec §9.12 point 9, one explicit action) and restore (point 11) share
 * this function — see 20260812150000_it_visual_asset_lifecycle_functions.sql's header comment
 * on why. Promotes the master to public storage if it's still staged privately, then
 * creates/refreshes variant rows. Variants currently share the master's bytes rather than true
 * distinct raster derivatives (no image-processing dependency exists yet) — see
 * docs/decisions/0047-product-idea-assessor-visual.md's Follow-up, same simplification.
 */
export async function publishVisualAsset(assetId: string, actorProfileId: string): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();

  const { data: asset, error: fetchError } = await supabase
    .from("it_visual_assets")
    .select("id, framework_id, storage_bucket, storage_path, mime_type, byte_size")
    .eq("id", assetId)
    .maybeSingle();
  if (fetchError || !asset) throw new Error(`Asset not found: ${fetchError?.message ?? assetId}`);

  let bucket = asset.storage_bucket as string;
  let path = asset.storage_path as string;

  if (bucket === CANDIDATE_BUCKET) {
    const publicPath = `visuals/${asset.framework_id}/${asset.id}/master/${path.split("/").pop()}`;
    const { error: copyError } = await supabase.storage.from(bucket).copy(path, publicPath, { destinationBucket: PUBLIC_BUCKET });
    if (copyError) throw new Error(`Failed to promote master to public storage: ${copyError.message}`);

    const { error: updateStorageError } = await supabase
      .from("it_visual_assets")
      .update({ storage_bucket: PUBLIC_BUCKET, storage_path: publicPath })
      .eq("id", asset.id);
    if (updateStorageError) throw new Error(`Failed to update storage pointer: ${updateStorageError.message}`);

    bucket = PUBLIC_BUCKET;
    path = publicPath;
  }

  const { error: rpcError } = await supabase.rpc("it_publish_visual_asset", {
    p_asset_id: assetId,
    p_actor_profile_id: actorProfileId,
  });
  if (rpcError) throw new Error(`Failed to publish: ${rpcError.message}`);

  for (const variant of VARIANTS) {
    const { error: variantError } = await supabase.from("it_visual_asset_variants").upsert(
      {
        visual_asset_id: assetId,
        variant_key: variant.key,
        storage_bucket: bucket,
        storage_path: path,
        width: variant.width,
        height: variant.height,
        format: (asset.mime_type as string)?.includes("svg") ? "svg" : "png",
        byte_size: asset.byte_size,
      },
      { onConflict: "visual_asset_id,variant_key,format" },
    );
    if (variantError) throw new Error(`Failed to record variant ${variant.key}: ${variantError.message}`);
  }
}
