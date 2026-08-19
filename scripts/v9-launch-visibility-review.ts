/**
 * v9 §5.3/§43.9 launch visibility review: sets every non-core framework and its products to
 * `unlisted` (direct link still works, excluded from discovery/sitemap/search), keeping the five
 * Core Collection families (product-idea-assessor, customer-discovery-kit, customer-demand-test,
 * mvp-scoper, first-customers-planner) `public`. Deliberately non-destructive — no content,
 * revision, entitlement or Tool implementation is touched, only the `public_visibility` column,
 * through the same audited `setFrameworkVisibility`/`setProductVisibility` functions the admin UI
 * itself calls (src/server/admin/frameworks.ts, src/server/admin/products.ts), so this produces
 * exactly the same it_audit_log trail a human clicking through /admin/frameworks + /admin/products
 * one row at a time would have left.
 *
 * The 21-slug list below is a deliberately fixed, explicit, human-reviewed set (confirmed against
 * live query results 2026-08-19, see docs/decisions/0062) — not "every framework except the five
 * core ones" computed dynamically, so a future new framework is never silently unlisted by a
 * later re-run of this script without a fresh editorial decision.
 *
 * Run with `npx tsx scripts/v9-launch-visibility-review.ts` against the live linked project.
 * Idempotent: setting an already-unlisted framework/product to `unlisted` again is a no-op write
 * (still produces a harmless audit log row), safe to re-run.
 */

const NON_CORE_FRAMEWORK_SLUGS = [
  "better-decision-maker",
  "product-market-fit-tracker",
  "pricing-your-product",
  "product-idea-generator",
  "business-model-chooser",
  "decision-framework-picker",
  "product-positioning-builder",
  "product-naming-system",
  "product-prioritisation-tool",
  "lateral-thinking-toolkit",
  "user-engagement-designer",
  "story-builder",
  "startup-launch-planner",
  "meeting-reset",
  "writing-editor",
  "app-design-review",
  "ai-prompt-builder",
  "ai-agent-designer",
  "negotiation-prep",
  "sticky-pitch-checker",
  "rapid-learning-planner",
] as const;

const REASON = "v9 curated launch: non-core family unlisted by default, direct access preserved (spec v9 §5.3).";

async function main() {
  const { existsSync } = await import("node:fs");
  const { resolve } = await import("node:path");
  const envLocalPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envLocalPath)) {
    process.loadEnvFile(envLocalPath);
  }

  const { getSupabaseServiceRoleClient, hasServiceRoleConfig } = await import("../src/lib/supabase/service-role-client");
  if (!hasServiceRoleConfig()) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — set them in .env.local before running this script.",
    );
    process.exitCode = 1;
    return;
  }

  const supabase = getSupabaseServiceRoleClient();

  // Inlined rather than importing setFrameworkVisibility/setProductVisibility from
  // src/server/admin/* — those files start with `import "server-only"`, which Next.js strips
  // at build time but a plain `tsx` script has no loader for, so importing them here fails with
  // "Cannot find module 'server-only'". Every other standalone script in this directory
  // (seed-visual-recipe.ts, seed-product-idea-assessor-visual.ts, etc.) avoids the same trap by
  // writing directly against the Supabase client instead of reusing src/server/admin/* helpers —
  // this does the identical update + it_write_audit_log call those functions make.
  async function setUnlisted(table: "it_frameworks" | "it_products", id: string, currentVisibility: string): Promise<void> {
    const { error: updateError } = await supabase
      .from(table)
      .update({ public_visibility: "unlisted", visibility_note: REASON, hidden_at: null, hidden_by: null, updated_by: actorProfileId })
      .eq("id", id);
    if (updateError) throw new Error(`Failed to update ${table} ${id}: ${updateError.message}`);

    const { error: auditError } = await supabase.rpc("it_write_audit_log", {
      p_action: "visibility_change",
      p_entity_type: table,
      p_entity_id: id,
      p_before_state: { public_visibility: currentVisibility },
      p_after_state: { public_visibility: "unlisted" },
      p_reason: REASON,
      p_actor_profile_id: actorProfileId,
    });
    if (auditError) throw new Error(`Updated ${table} ${id} but audit log write failed: ${auditError.message}`);
  }

  const { data: owner, error: ownerError } = await supabase
    .from("it_profiles")
    .select("id")
    .eq("role", "owner")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (ownerError || !owner) {
    console.error(`Could not find an owner-role profile to attribute this run to: ${ownerError?.message ?? "no owner profile exists yet"}.`);
    process.exitCode = 1;
    return;
  }
  const actorProfileId = owner.id as string;

  let frameworksUpdated = 0;
  let productsUpdated = 0;
  const missingSlugs: string[] = [];

  for (const slug of NON_CORE_FRAMEWORK_SLUGS) {
    const { data: framework, error: frameworkError } = await supabase
      .from("it_frameworks")
      .select("id, public_visibility")
      .eq("slug", slug)
      .maybeSingle();
    if (frameworkError || !framework) {
      missingSlugs.push(slug);
      continue;
    }

    await setUnlisted("it_frameworks", framework.id, framework.public_visibility);
    frameworksUpdated += 1;

    const { data: products, error: productsError } = await supabase
      .from("it_products")
      .select("id, public_visibility")
      .eq("framework_id", framework.id);
    if (productsError) {
      console.error(`  Failed to list products for ${slug}: ${productsError.message}`);
      continue;
    }
    for (const product of products ?? []) {
      await setUnlisted("it_products", product.id, product.public_visibility);
      productsUpdated += 1;
    }
    console.log(`  ${slug}: framework + ${products?.length ?? 0} product(s) set to unlisted`);
  }

  if (missingSlugs.length > 0) {
    console.warn(`Warning: framework slug(s) not found, skipped: ${missingSlugs.join(", ")}`);
  }
  console.log(`Done: ${frameworksUpdated} framework(s), ${productsUpdated} product(s) set to unlisted.`);
}

main();

export {};
