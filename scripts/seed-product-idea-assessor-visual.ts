/**
 * Publishes Product Idea Assessor's first family_card/family_hero visual against the live
 * linked Supabase project — the Visual Asset System's end-to-end proof case (spec v5 §45's
 * milestone framing; see docs/decisions/0047-product-idea-assessor-visual.md).
 *
 * Exercises the real lifecycle a future admin Visuals workspace would drive, not a shortcut
 * straight to "published": renders the deterministic SVG (source_type='rendered'), uploads it
 * to the private it-admin-staging bucket as a 'candidate' row, then selects, approves, moves the
 * object to the public it-public-assets bucket, and marks the asset 'published' — recording
 * selected_by/approved_by/published_by against the owner profile with real timestamps, since
 * this is a genuine decision made in conversation, not a placeholder. Finishes by inserting two
 * it_visual_asset_variants rows (card_md, hero_lg); both currently point at the same master
 * bytes, since SVG scales losslessly and no raster image-processing dependency has been added
 * yet — see 0047's Follow-up.
 *
 * Idempotent: safe to re-run (storage upload uses upsert: true; DB rows upsert on natural keys).
 *
 * Run with `npm run seed:product-idea-assessor-visual`.
 */

const FRAMEWORK_SLUG = "product-idea-assessor";
const CANDIDATE_BUCKET = "it-admin-staging";
const PUBLIC_BUCKET = "it-public-assets";

async function main() {
  const { existsSync } = await import("node:fs");
  const { resolve } = await import("node:path");
  const envLocalPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envLocalPath)) {
    process.loadEnvFile(envLocalPath);
  }

  const { getSupabaseServiceRoleClient, hasServiceRoleConfig } = await import("../src/lib/supabase/service-role-client");
  const { renderProductIdeaAssessorFamilySvg } = await import("../src/lib/visuals/render/product-idea-assessor-family");
  const { createHash } = await import("node:crypto");

  if (!hasServiceRoleConfig()) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — set them in .env.local before running this script.",
    );
    process.exitCode = 1;
    return;
  }

  const supabase = getSupabaseServiceRoleClient();

  const { data: framework, error: frameworkError } = await supabase
    .from("it_frameworks")
    .select("id")
    .eq("slug", FRAMEWORK_SLUG)
    .maybeSingle();
  if (frameworkError || !framework) {
    console.error(`Could not find framework "${FRAMEWORK_SLUG}": ${frameworkError?.message ?? "no matching row"}`);
    process.exitCode = 1;
    return;
  }

  const { data: recipe, error: recipeError } = await supabase
    .from("it_visual_recipes")
    .select("id")
    .eq("recipe_key", "incytemplates-v1")
    .eq("version", 1)
    .maybeSingle();
  if (recipeError || !recipe) {
    console.error(
      `Could not find visual recipe incytemplates-v1 v1 — run "npm run seed:visual-recipe" first: ${recipeError?.message ?? "no matching row"}`,
    );
    process.exitCode = 1;
    return;
  }

  const { data: owner, error: ownerError } = await supabase
    .from("it_profiles")
    .select("id")
    .eq("role", "owner")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (ownerError || !owner) {
    console.error(`Could not find an owner-role profile: ${ownerError?.message ?? "no owner profile exists yet"}`);
    process.exitCode = 1;
    return;
  }

  const svg = renderProductIdeaAssessorFamilySvg();
  const bytes = Buffer.from(svg, "utf-8");
  const checksum = createHash("sha256").update(bytes).digest("hex");
  const altText =
    "Three note cards representing scattered idea signals converge into one approved, checked result card.";

  const visualBrief = {
    objective: "Show three fragmented idea signals converging into one clear, scored decision.",
    subject: "Product Idea Assessor",
    inputConcepts: ["scattered notes", "unclear signals"],
    outcomeConcept: "one approved, scored result",
    compositionHint: "convergence",
    assetType: "family_hero",
    notes: "Purely iconographic placeholder pending a production image-generation provider decision (spec §44 item 25).",
  };

  // 1. Find or create the candidate row, staged privately.
  const { data: existing } = await supabase
    .from("it_visual_assets")
    .select("id, status")
    .eq("framework_id", framework.id)
    .eq("asset_type", "family_hero")
    .eq("source_type", "rendered")
    .maybeSingle();

  const candidatePath = `visuals/${framework.id}/candidate/family-card.svg`;
  const { error: uploadError } = await supabase.storage
    .from(CANDIDATE_BUCKET)
    .upload(candidatePath, bytes, { contentType: "image/svg+xml", upsert: true });
  if (uploadError) {
    console.error(`Candidate upload failed: ${uploadError.message}`);
    process.exitCode = 1;
    return;
  }

  const nowIso = new Date().toISOString();
  let assetId: string;

  if (existing) {
    assetId = existing.id;
    const { error: updateError } = await supabase
      .from("it_visual_assets")
      .update({
        status: "candidate",
        visual_recipe_id: recipe.id,
        visual_brief: visualBrief,
        storage_bucket: CANDIDATE_BUCKET,
        storage_path: candidatePath,
        mime_type: "image/svg+xml",
        byte_size: bytes.byteLength,
        checksum_sha256: checksum,
        alt_text: altText,
      })
      .eq("id", assetId);
    if (updateError) {
      console.error(`Candidate row update failed: ${updateError.message}`);
      process.exitCode = 1;
      return;
    }
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from("it_visual_assets")
      .insert({
        framework_id: framework.id,
        asset_type: "family_hero",
        source_type: "rendered",
        status: "candidate",
        visual_recipe_id: recipe.id,
        visual_brief: visualBrief,
        storage_bucket: CANDIDATE_BUCKET,
        storage_path: candidatePath,
        mime_type: "image/svg+xml",
        byte_size: bytes.byteLength,
        checksum_sha256: checksum,
        alt_text: altText,
        created_by: owner.id,
      })
      .select("id")
      .single();
    if (insertError || !inserted) {
      console.error(`Candidate row insert failed: ${insertError?.message}`);
      process.exitCode = 1;
      return;
    }
    assetId = inserted.id;
  }
  console.log(`Staged candidate ${assetId} at ${CANDIDATE_BUCKET}/${candidatePath}`);

  // 2. Select + approve.
  const { error: approveError } = await supabase
    .from("it_visual_assets")
    .update({
      status: "approved",
      selected_at: nowIso,
      selected_by: owner.id,
      approved_at: nowIso,
      approved_by: owner.id,
    })
    .eq("id", assetId);
  if (approveError) {
    console.error(`Select/approve failed: ${approveError.message}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Selected + approved ${assetId}`);

  // 3. Publish: copy the object into the public bucket, then flip the row.
  const publicPath = `visuals/${framework.id}/${assetId}/master/family-card.svg`;
  const { error: copyError } = await supabase.storage
    .from(CANDIDATE_BUCKET)
    .copy(candidatePath, publicPath, { destinationBucket: PUBLIC_BUCKET });
  if (copyError) {
    console.error(`Publish copy failed: ${copyError.message}`);
    process.exitCode = 1;
    return;
  }

  const { error: publishError } = await supabase
    .from("it_visual_assets")
    .update({
      status: "published",
      storage_bucket: PUBLIC_BUCKET,
      storage_path: publicPath,
      published_at: nowIso,
      published_by: owner.id,
    })
    .eq("id", assetId);
  if (publishError) {
    console.error(`Publish row update failed: ${publishError.message}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Published ${assetId} -> ${PUBLIC_BUCKET}/${publicPath}`);

  // 4. Variants — both point at the same master bytes (SVG scales losslessly; see 0047's
  // Follow-up on deferring true raster derivatives until an image-processing dependency exists).
  const variants = [
    { variant_key: "card_md", width: 480, height: 360 },
    { variant_key: "hero_lg", width: 960, height: 720 },
  ];
  for (const variant of variants) {
    const { error: variantError } = await supabase.from("it_visual_asset_variants").upsert(
      {
        visual_asset_id: assetId,
        variant_key: variant.variant_key,
        storage_bucket: PUBLIC_BUCKET,
        storage_path: publicPath,
        width: variant.width,
        height: variant.height,
        format: "svg",
        byte_size: bytes.byteLength,
      },
      { onConflict: "visual_asset_id,variant_key,format" },
    );
    if (variantError) {
      console.error(`Variant ${variant.variant_key} upsert failed: ${variantError.message}`);
      process.exitCode = 1;
      continue;
    }
    console.log(`Recorded variant ${variant.variant_key} (${variant.width}x${variant.height})`);
  }

  console.log("Done.");
}

main();

export {};
