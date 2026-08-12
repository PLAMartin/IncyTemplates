/**
 * Seeds the IncyTemplates Visual Recipe v1 row (spec v5 §11.6, §14.13
 * it_visual_recipes) against the live linked Supabase project.
 *
 * Not part of scripts/seed.ts's catalogue pipeline: a Visual Recipe is a
 * design/config record with a required created_by -> it_profiles(id), not
 * catalogue content, and needs a real staff profile to exist first (see
 * docs/decisions/0046-visual-recipe-v1-palette.md).
 *
 * config_data's colour values are the site's actual shipped design tokens
 * (src/app/globals.css: --color-brand-*, --color-paper, --color-accent-amber-*,
 * pine/teal + warm paper + amber per docs/decisions/0002-visual-identity-direction.md)
 * rather than spec §11.6's literal navy/purple/lilac/mint description — see
 * 0046 for why. Stores token *names*, not raw hex, matching the spec's own
 * instruction to "reference named design tokens from the application theme."
 *
 * Idempotent: safe to re-run (upsert on recipe_key+version).
 *
 * Run with `npm run seed:visual-recipe` (wired to `tsx scripts/seed-visual-recipe.ts`).
 */

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

  const { data: owner, error: ownerError } = await supabase
    .from("it_profiles")
    .select("id")
    .eq("role", "owner")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (ownerError || !owner) {
    console.error(
      `Could not find an owner-role profile to record as created_by/approved_by: ${ownerError?.message ?? "no owner profile exists yet"}.`,
    );
    process.exitCode = 1;
    return;
  }

  const configData = {
    backgroundToken: "--color-paper",
    primaryToken: "--color-ink-900",
    structuralAccentToken: "--color-brand-500",
    supportingAccentTokens: ["--color-accent-amber-500"],
    surfaceTokens: ["--color-brand-100", "--color-accent-amber-100", "--color-ink-100"],
    style: [
      "flat 2D, vector-like forms, not photorealism",
      "generous whitespace, one dominant visual idea",
      "thin/simple icons with consistent stroke weight",
      "moderate rounded rectangles/cards, minimal shadow and decorative effects",
      "friendly and modern, not cartoonish or childish",
    ],
    avoid: [
      "stock-photo aesthetic",
      "gratuitous 3D rendering",
      "logos/trademarks or third-party brand marks",
      "headings, paragraphs or decorative words baked into the image unless the asset type explicitly permits short labels",
    ],
  };

  const promptTemplate =
    "Communicate one concept clearly for {{assetType}}: {{objective}}. Subject: {{subject}}. " +
    "Use a white or very pale neutral background ({{backgroundToken}}), {{primaryToken}} for primary type/line colour, " +
    "{{structuralAccentToken}} as the main structural/action accent, and {{supportingAccentTokens}} as restrained supporting accents. " +
    "Flat 2D vector-like forms, generous whitespace, thin consistent-stroke icons, moderate rounded rectangles, minimal shadow. " +
    "Avoid headings, paragraphs, logos and decorative words unless explicitly permitted. Avoid photorealism, 3D rendering and stock-photo aesthetics.";

  const { data, error } = await supabase
    .from("it_visual_recipes")
    .upsert(
      {
        recipe_key: "incytemplates-v1",
        version: 1,
        name: "IncyTemplates Visual Recipe v1",
        status: "approved",
        config_data: configData,
        prompt_template: promptTemplate,
        created_by: owner.id,
        approved_by: owner.id,
        approved_at: new Date().toISOString(),
      },
      { onConflict: "recipe_key,version" },
    )
    .select("id, recipe_key, version, status")
    .single();

  if (error) {
    console.error(`Upsert failed: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Seeded visual recipe: ${data.recipe_key} v${data.version} (${data.status}), id=${data.id}`);
}

main();

export {};
