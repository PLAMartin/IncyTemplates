/**
 * One-time backfill (like `scripts/import-guides.ts`): imports the real 258-post A Bit Gamey
 * corpus into `it_source_posts` and creates a first Reuse Taxonomy v1 assessment for each post
 * via `scripts/assess-abitgamey-use.ts`'s deterministic rules-based classifier (spec v7
 * §12.8/§23.2 — no LLM call).
 *
 * Reads the local ABitGamey checkout (a separate git repo, not part of this one) at
 * `ABITGAMEY_SOURCE_PATH` — set this in `.env.local` only; it is never read outside this
 * script, never committed, and the app never depends on it at runtime (spec v7 §12.8: "the
 * private A Bit Gamey repository remains a source, not a runtime dependency"). Only
 * `posts.csv` metadata and per-post HTML bodies are read; `*.delivers.csv`/`*.opens.csv`
 * (subscriber analytics) are never touched.
 *
 * Idempotent for `it_source_posts` (upsert on post_id) and `it_source_post_mapping_reviews`
 * (insert-if-missing — never overwrites an existing editorial decision). NOT idempotent for
 * assessments: every run inserts a new versioned `it_source_post_use_assessments` row per
 * post, matching spec's "re-analysis creates a new assessment version" rule.
 *
 * Run with `npm run import:abitgamey` (requires `.env.local` with
 * `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `ABITGAMEY_SOURCE_PATH` set,
 * and at least one `it_profiles` row with role 'owner'/'admin').
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, join } from "node:path";

async function main() {
  const envLocalPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envLocalPath)) {
    process.loadEnvFile(envLocalPath);
  }

  const sourcePath = process.env.ABITGAMEY_SOURCE_PATH;
  if (!sourcePath || !existsSync(sourcePath)) {
    console.error(
      "Missing or invalid ABITGAMEY_SOURCE_PATH — set it in .env.local to the local ABitGamey checkout " +
        "(e.g. /Users/phil/Documents/ABitGamey). Never commit this path or read it outside this script.",
    );
    process.exitCode = 1;
    return;
  }

  const { getSupabaseServiceRoleClient, hasServiceRoleConfig } = await import("../src/lib/supabase/service-role-client");
  const { parseCsv } = await import("./lib/parse-csv");
  const { assessAbitGameyPost } = await import("./assess-abitgamey-use");
  type AssessModule = typeof import("./assess-abitgamey-use");
  type RawSourcePost = Parameters<AssessModule["assessAbitGameyPost"]>[0];
  type SourceMappingFrameworkOption = Parameters<AssessModule["assessAbitGameyPost"]>[1][number];

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
    console.error("No 'owner' or 'admin' it_profiles row found — see scripts/import-guides.ts's bootstrap note.");
    process.exitCode = 1;
    return;
  }
  const actorProfileId = actor.id as string;

  const { data: frameworkRows, error: frameworksError } = await supabase
    .from("it_frameworks")
    .select("id, slug, name, outcome_statement, method_summary");
  if (frameworksError) {
    console.error(`Failed to load frameworks: ${frameworksError.message}`);
    process.exitCode = 1;
    return;
  }
  const frameworks: SourceMappingFrameworkOption[] = (frameworkRows ?? []).map((f) => ({
    id: f.id as string,
    slug: f.slug as string,
    name: f.name as string,
    outcomeStatement: f.outcome_statement as string,
    methodSummary: (f.method_summary as string | null) ?? null,
  }));

  const contentDir = join(sourcePath, "www", "content");
  const postsCsvPath = join(contentDir, "substack-raw 30.7.26", "posts.csv");
  const postsHtmlDir = join(contentDir, "substack-raw 30.7.26", "posts");
  const categoriesPath = join(contentDir, "catalogue", "categories.json");

  if (!existsSync(postsCsvPath)) {
    console.error(`posts.csv not found at ${postsCsvPath} — check ABITGAMEY_SOURCE_PATH.`);
    process.exitCode = 1;
    return;
  }

  const posts = parseCsv(readFileSync(postsCsvPath, "utf8")).filter((row) => row.is_published === "true");
  const categoryByPostId = new Map<string, string>();
  if (existsSync(categoriesPath)) {
    const categories = JSON.parse(readFileSync(categoriesPath, "utf8")) as { posts: { post_id: string; category: string }[] };
    for (const entry of categories.posts) {
      categoryByPostId.set(entry.post_id, entry.category);
    }
  }

  const htmlFilenames = new Set(existsSync(postsHtmlDir) ? readdirSync(postsHtmlDir) : []);

  let imported = 0;
  let skipped = 0;

  for (const row of posts) {
    const postId = row.post_id;
    const title = row.title;
    if (!postId || !title) {
      console.warn(`Skipping a row with a missing post_id/title.`);
      skipped += 1;
      continue;
    }

    const filename = `${postId}.html`;
    if (!htmlFilenames.has(filename)) {
      console.warn(`Skipping ${postId}: no HTML body found at posts/${filename}.`);
      skipped += 1;
      continue;
    }

    const html = readFileSync(join(postsHtmlDir, filename), "utf8");
    const category = categoryByPostId.get(postId) ?? null;

    const rawPost: RawSourcePost = {
      postId,
      title,
      subtitle: row.subtitle || null,
      category,
      html,
    };

    const { error: postError } = await supabase.from("it_source_posts").upsert(
      {
        id: postId,
        source_type: "abitgamey",
        title,
        subtitle: row.subtitle || null,
        published_at: row.post_date || null,
        source_repository: "PLAMartin/ABitGamey",
        source_path: `www/content/substack-raw 30.7.26/posts/${filename}`,
        source_category: category,
        content_hash: createHash("sha256").update(html).digest("hex"),
      },
      { onConflict: "id" },
    );
    if (postError) {
      console.error(`it_source_posts upsert failed for ${postId}: ${postError.message}`);
      process.exitCode = 1;
      continue;
    }

    const assessment = assessAbitGameyPost(rawPost, frameworks);

    const { error: assessmentError } = await supabase.from("it_source_post_use_assessments").insert({
      source_post_id: postId,
      taxonomy_version: assessment.taxonomyVersion,
      analysis_version: assessment.analysisVersion,
      analysis_method: assessment.analysisMethod,
      source_content_hash: createHash("sha256").update(html).digest("hex"),
      extracted_principle: assessment.extractedPrinciple,
      problem_statement: assessment.dimensions.problemStatement,
      source_stage: assessment.dimensions.sourceStage,
      user_task: assessment.dimensions.userTask,
      method_tags: assessment.dimensions.methodTags,
      frequency: assessment.dimensions.frequency,
      judgement_level: assessment.dimensions.judgementLevel,
      score_problem: assessment.scores.problem,
      score_actionability: assessment.scores.actionability,
      score_repeatability: assessment.scores.repeatability,
      score_structure: assessment.scores.structure,
      score_automation: assessment.scores.automation,
      suggested_uses: assessment.suggestedUses,
      suggested_frameworks: assessment.suggestedFrameworks,
      suggested_public_stage_key: assessment.suggestedPublicStageKey,
      confidence: assessment.confidence,
      rationale: assessment.rationale,
      created_by: actorProfileId,
    });
    if (assessmentError) {
      console.error(`Assessment insert failed for ${postId}: ${assessmentError.message}`);
      process.exitCode = 1;
      continue;
    }

    // insert-if-missing: never overwrite an existing human review decision on re-run.
    const { error: reviewError } = await supabase
      .from("it_source_post_mapping_reviews")
      .upsert({ source_post_id: postId, status: "unreviewed" }, { onConflict: "source_post_id", ignoreDuplicates: true });
    if (reviewError) {
      console.error(`Mapping review row failed for ${postId}: ${reviewError.message}`);
      process.exitCode = 1;
      continue;
    }

    imported += 1;
    console.log(`Assessed ${postId} — ${assessment.suggestedUses.join("+")} (score ${assessment.scores.problem + assessment.scores.actionability + assessment.scores.repeatability + assessment.scores.structure + assessment.scores.automation}/10)`);
  }

  console.log(`Done: ${imported}/${posts.length} posts assessed, ${skipped} skipped (missing HTML body).`);
}

main();
