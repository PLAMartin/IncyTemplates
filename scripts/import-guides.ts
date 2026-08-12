/**
 * One-time backfill: imports content/guides/*.mdx into real it_products
 * (product_type='guide') rows plus a published it_product_content_revisions
 * row per guide, on the live linked Supabase project — the DB-backed model
 * spec v4 §14.7.1 introduces (see docs/decisions and
 * src/server/queries/supabase-source.ts's getAllGuides/getGuideBySlug).
 *
 * content/guides/*.mdx is NOT deleted or made read-only by this script —
 * per spec line 1245 ("repository-managed Markdown may remain useful for
 * seed content... and backups"), those files stay in the repo and keep
 * serving as the FixtureCatalogueSource's Guide data (no Supabase
 * configured = still reads the files directly). Only the *live* Supabase
 * project's rendering path moves to the DB after this script runs.
 *
 * Like scripts/seed-storage.ts, this connects directly to the live project
 * with the service-role key — it needs NEXT_PUBLIC_SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY set in .env.local, and requires at least one
 * it_profiles row with role 'admin' or 'owner' to already exist (used as
 * the revision's created_by/published_by actor) — see the manual bootstrap
 * step in the Phase 6 admin/auth setup (invite yourself in Supabase Auth,
 * then `update it_profiles set role = 'owner' where email = '...'`).
 *
 * Idempotent for the it_products row (upsert on a deterministic id) and for
 * relationships (delete-then-reinsert per product, like seed.ts's join
 * tables), but NOT for the content revision: every run publishes a new
 * revision via it_upsert_content_draft + it_publish_content_revision (the
 * same functions the admin editor will use), so re-running after editing an
 * .mdx file correctly creates a new published revision rather than being a
 * no-op — this is "re-import updates content", not just a first-time seed.
 *
 * Run with `npx tsx scripts/import-guides.ts`.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";

async function main() {
  const envLocalPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envLocalPath)) {
    process.loadEnvFile(envLocalPath);
  }

  // Imported after loadEnvFile so src/lib/env picks up .env.local's values.
  const { getSupabaseServiceRoleClient, hasServiceRoleConfig } = await import("../src/lib/supabase/service-role-client");
  const { guideFrontmatterSchema } = await import("../src/lib/mdx/schema");
  const { deterministicUuid } = await import("./lib/deterministic-uuid");

  if (!hasServiceRoleConfig()) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — set them in .env.local before running this script.",
    );
    process.exitCode = 1;
    return;
  }

  const supabase = getSupabaseServiceRoleClient();

  const { data: actor, error: actorError } = await supabase
    .from("it_profiles")
    .select("id")
    .in("role", ["owner", "admin"])
    .limit(1)
    .maybeSingle();

  if (actorError || !actor) {
    console.error(
      "No 'owner' or 'admin' it_profiles row found — invite yourself in Supabase Auth and promote your profile " +
        "to 'owner' first (see the Phase 6 admin auth bootstrap step).",
    );
    process.exitCode = 1;
    return;
  }
  const actorProfileId = actor.id as string;

  const guidesDir = resolve(process.cwd(), "content", "guides");
  const filenames = existsSync(guidesDir) ? readdirSync(guidesDir).filter((f) => f.endsWith(".mdx")) : [];

  let imported = 0;

  for (const filename of filenames) {
    const raw = readFileSync(resolve(guidesDir, filename), "utf8");
    const { data, content } = matter(raw);
    const parsed = guideFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      console.error(`Skipping ${filename}: invalid front matter — ${parsed.error.issues[0]?.message}`);
      process.exitCode = 1;
      continue;
    }
    const guide = parsed.data;

    let frameworkId: string | null = null;
    if (guide.frameworkSlug) {
      const { data: framework } = await supabase
        .from("it_frameworks")
        .select("id")
        .eq("slug", guide.frameworkSlug)
        .maybeSingle();
      if (!framework) {
        console.warn(`${filename}: frameworkSlug "${guide.frameworkSlug}" not found — leaving framework_id null.`);
      }
      frameworkId = framework?.id ?? null;
    }

    const productId = deterministicUuid(`product:${guide.slug}`);

    const { error: productError } = await supabase.from("it_products").upsert({
      id: productId,
      product_type: "guide",
      access_type: "free",
      status: guide.status,
      public_visibility: "public",
      name: guide.title,
      slug: guide.slug,
      short_description: guide.summary,
      seo_title: guide.seoTitle ?? null,
      seo_description: guide.seoDescription ?? null,
      framework_id: frameworkId,
      content_path: `content/guides/${filename}`,
      published_at: guide.status === "published" ? guide.publishedAt : null,
      created_by: actorProfileId,
      updated_by: actorProfileId,
    });
    if (productError) {
      console.error(`it_products upsert failed for ${guide.slug}: ${productError.message}`);
      process.exitCode = 1;
      continue;
    }

    const { data: draft, error: draftError } = await supabase.rpc("it_upsert_content_draft", {
      p_product_id: productId,
      p_content_data: { body_markdown: content.trim(), author: guide.author },
      p_actor_profile_id: actorProfileId,
      p_change_note: `Imported from content/guides/${filename}`,
    });
    if (draftError || !draft) {
      console.error(`Content draft failed for ${guide.slug}: ${draftError?.message}`);
      process.exitCode = 1;
      continue;
    }

    if (guide.status === "published") {
      const { error: publishError } = await supabase.rpc("it_publish_content_revision", {
        p_revision_id: (draft as { id: string }).id,
        p_actor_profile_id: actorProfileId,
      });
      if (publishError) {
        console.error(`Publish failed for ${guide.slug}: ${publishError.message}`);
        process.exitCode = 1;
        continue;
      }
    }

    if (guide.relatedProducts && guide.relatedProducts.length > 0) {
      await supabase.from("it_product_relationships").delete().eq("source_product_id", productId).eq("relationship_type", "related");

      const { data: targets } = await supabase.from("it_products").select("id, slug").in("slug", guide.relatedProducts);
      const rows = (targets ?? []).map((target) => ({
        source_product_id: productId,
        target_product_id: target.id,
        relationship_type: "related",
      }));
      if (rows.length > 0) {
        const { error: relError } = await supabase.from("it_product_relationships").insert(rows);
        if (relError) {
          console.error(`Relationships failed for ${guide.slug}: ${relError.message}`);
          process.exitCode = 1;
        }
      }
    }

    imported += 1;
    console.log(`Imported ${guide.slug} (${guide.status})`);
  }

  console.log(`Done: ${imported}/${filenames.length} guides imported.`);
}

main();
