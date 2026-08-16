# 0056 — A Bit Gamey Reuse Taxonomy v1 + admin source-post mapping workspace (spec v7 adopted)

## Status
Accepted

## Context
Spec moved from v6 to v7 on 2026-08-15 (`d70ef22`), at the user's explicit request. v7 retains
v6's product model, editorial controls and Visual Asset/OpenAI System completely unchanged and
adds a versioned **Reuse Taxonomy v1** (spec §23.2, §12.8): a way to assess every A Bit Gamey
source post independently of the archive's own 16-category *subject* taxonomy — not "what is this
post about" but "how could this post be used on IncyTemplates" (source-only background, Guide,
Template, or Tool). `20260809160005_it_frameworks.sql`'s header comment had explicitly deferred
this ("intentionally NOT created in this migration — there is no importer or any real source-post
data yet"); that blocker is what this slice closes.

This decision doc is being written retroactively on 2026-08-16, one day after `d70ef22` shipped —
every other change since `0001` got a same-day decision doc, this one didn't, which broke the
"check the latest-numbered file before answering what's next" convention `project_build_order`
memory relies on. Backfilled now rather than left as a permanent gap.

## Decisions

**Four new tables across three migrations** (`20260815140000`–`20260815140010`), enums in their
own file so `it_source_use_type`/`it_source_mapping_status` commit before anything references
them — the same ordering constraint this codebase already hit for `it_framework_status`
(`20260809160000`) and `it_public_visibility` (`20260812090000`).

- **`it_source_posts`** — imported metadata only (title, source repo/path, category, content
  hash).
- **`it_source_post_use_assessments`** — immutable/versioned suggested assessments, deliberately
  separate from `it_source_posts` so imported metadata is never confused with inferred analysis.
  `reuse_score` is a Postgres `generated always as` sum of five `smallint` 0–2 component columns
  (problem/actionability/repeatability/structure/automation) — matches
  `src/lib/source-mapping/scoring.ts`'s `calculateReuseScore` exactly, so app code and the
  database can never disagree on the total. No update trigger: one row per analysis run, never
  modified.
- **`it_source_post_mapping_reviews`** — the human editorial decision, stored separately from the
  suggestion it reviewed. One row per post (`source_post_id` primary key); accepting, adjusting or
  dismissing a suggestion never touches the assessment row that produced it.
- **`it_framework_source_posts`** — many-to-many framework↔post links with `contribution_type`
  (primary_method/supporting_method/example/evidence/background) and `mapping_origin`
  (manual/accepted_suggestion/adjusted_suggestion). `contribution_type` is free text, not an enum
  — spec's own instruction to keep this vocabulary configurable rather than hard-coded, same
  reasoning already applied to `method_tags`.

**RLS: strictest existing boundary, reused rather than invented.** All four tables get `staff can
read` policies (`is_staff()`) and nothing else — no anon, no authenticated-customer, no staff
*write* policy either. Every write goes through the service-role client
(`src/server/admin/source-posts.ts`) plus an `it_write_audit_log` call, matching `it_visuals_*`'s
posture from `0045`/`0050`: this is pure internal editorial decision-support data, never read by a
public page.

**Suggestion engine is deterministic and rule-based — no LLM call**, the same posture
`src/lib/finder/rules.ts` established (`0026`, "do not use an LLM for deterministic routing") and
spec §12.8 explicitly permits ("AI assistance is optional... the architecture must support
seeded/manual assessments and rule-based analysis without an external model"). Two layers, both
pure functions with no I/O so they're unit-testable without a filesystem or database:

- `src/lib/source-mapping/suggest.ts` maps the five-component score total to a use-type band
  (0–4 source_only, 5–6 template, 7–8 template+tool if `structure + automation >= 3`, 9–10
  tool+template if `structure === 2`) — `suggestUsesFromScore`'s own header comment documents why
  each threshold reads spec's qualitative language ("enough structure/automation to justify
  implementation") the way it does. Guide is a separate, non-threshold signal
  (`hasTeachableMethod`), per spec: suggest it whenever a post has a reusable principle to explain,
  independent of score band.
- `scripts/assess-abitgamey-use.ts` derives the five component scores plus taxonomy dimensions
  (stage/user task/method tags/frequency/judgement level) from title/subtitle/HTML-body signals
  (numbered-list titles, `<li>` counts, keyword regexes) and a **per-category default table**
  (`CATEGORY_DEFAULTS`) hand-derived from the ABitGamey repo's own `docs/content-categories.md`
  prioritisation notes, not invented fresh — each default traces back to that source. Every
  suggestion here is explicitly advisory; nothing in `suggest.ts` or the admin UI ever auto-applies
  a use or a framework link.
- Framework-mapping suggestions rank existing frameworks by significant-word overlap between the
  post's title/subtitle/category and each framework's name/outcome/method-summary text, capped at
  the top 2, confidence bounded to `[0.15, 0.9]` — a keyword heuristic, not semantic matching,
  expected to need iteration once real review volume exposes its misses (see Follow-up).

**`suggested_frameworks` is stored as `jsonb` but validated, never trusted as executable
configuration** — `suggestedFrameworkMappingSchema` in `src/lib/source-mapping/schema.ts`
(a `.refine` requiring either `frameworkId` or a `candidateName`/`candidateSlug` pair, never
neither) is spec's own explicit instruction, and is applied both at import time and whenever the
admin UI reads a suggestion back.

**Admin workspace (`/admin/source-posts` queue + `/admin/source-posts/review/[id]` detail)
mirrors the existing `/admin/frameworks` read/write split**: reads use the session-bound client
(covered by the "staff can read" RLS policies above), writes use the service-role client. Four
actions: accept/adjust/dismiss a suggestion (`reviewSourcePostMapping`, writes only
`it_source_post_mapping_reviews`, never the assessment); add/remove a framework link
(`addFrameworkMapping`/`removeFrameworkMapping`); and **"create framework candidate from
suggestion"** (`createFrameworkCandidateFromSuggestion`), which inserts an `it_frameworks` row
with `status: 'candidate'` (the enum's own default) and nothing else — approval and publication
stay on the existing, separate `/admin/frameworks` workflow. **Nothing in this slice publishes a
product automatically**, stated explicitly in the commit message and worth restating here since
it's the core safety property of the whole feature.

**One-time corpus import (`scripts/import-abitgamey-assessments.ts`, `npm run import:abitgamey`)
reads a local ABitGamey checkout via `ABITGAMEY_SOURCE_PATH`** (`.env.local` only, never
committed, never a runtime dependency of the deployed app — spec §12.8: "the private A Bit Gamey
repository remains a source, not a runtime dependency"). Idempotent for `it_source_posts` (upsert
on id) and `it_source_post_mapping_reviews` (insert-if-missing, never overwrites an existing
editorial decision); **not** idempotent for assessments — every run inserts a new versioned row,
matching spec's "re-analysis creates a new assessment version" rule.

**Live-verified this session** via `supabase db query --linked` (Supabase CLI ≥2.108, queries the
linked remote project directly through the Management API without needing a local `psql` install
or manual Keychain access): the real import already ran against the live `Incytemplates` project
— **258 posts in `it_source_posts`, 258 rows in `it_source_post_use_assessments`, all 258 mapping
reviews at `status = 'unreviewed'`**. No editorial review pass has happened yet; every suggestion
in the live database is still exactly what the rules-based classifier produced at import time.

**Testing**: three new unit test files (185 lines total) cover the pure functions —
`source-mapping-scoring.test.ts`, `source-mapping-suggest.test.ts`,
`assess-abitgamey-use.test.ts`. E2E coverage is limited to the unauthenticated redirect gate for
both new admin routes (`tests/e2e/admin-auth.spec.ts`) — the same documented gap as `0044`/`0048`:
no wired-up way yet to mint an authenticated staff session inside a Playwright e2e context, so the
actual accept/adjust/dismiss review flow has no permanent automated coverage.

## Follow-up
- **The feature's actual purpose — using reviewed mappings to decide what to build next — hasn't
  started.** All 258 imported posts sit at `unreviewed` live; no Editor has accepted, adjusted or
  dismissed a single suggestion yet, and no framework candidate has been created from one.
- **No authenticated e2e coverage** of the review workflow, same still-open gap flagged since
  `0044`.
- **The keyword-overlap framework-mapping heuristic is a first pass**, not semantic matching —
  expect it to need tuning once real review activity surfaces systematic misses (e.g. synonyms,
  paraphrased titles).
- **This decision doc itself was written a day after the code shipped.** Worth treating as a
  reminder to write the doc in the same commit as the code for any future spec-adoption slice,
  not just family/content slices — the "what's next" check in `project_build_order` memory
  depends on `docs/decisions/` being current.
