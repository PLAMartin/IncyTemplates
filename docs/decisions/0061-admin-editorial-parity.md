# 0061 — Admin editorial parity across Guides, Templates and Tools (spec v8)

## Status
Accepted — code complete; `20260817150000_editorial_common_copy_publish.sql` has been applied
to the live Supabase project via `supabase db push` (confirmed via `supabase migration list`).

## Context
Spec moved from v7 to v8 on 2026-08-17, closing the **admin editorial parity gap**: Guides had
a working Markdown editor (`/admin/guides/[id]`), Templates had file-version upload only with
no metadata/instruction text editor, and Tools had a generic revisioned copy editor but only
`mvp-scoper` (1 of 26) had declared any editable fields. Separately, the visitor-facing
descriptive fields already on `it_products` (`short_description`, `full_description`,
`outcome_statement`, `target_audience`, `when_to_use`, `when_not_to_use`, `seo_title`,
`seo_description`) were not editable from admin for any product type — admin only exposed a
Public/Unlisted/Hidden visibility toggle.

Two scope decisions were confirmed with the user before building:
1. Build the full v8 scope in one pass, including declaring a `copySchema` for all 25 Tools
   that lacked one.
2. Keep `it_tool_copy_revisions` as its own table (do not migrate Tool copy into the unified
   `it_product_content_revisions` store) — the Tool admin editor bundles a common-copy save
   (new table) with the existing tool-specific-copy save (old table) behind one Save
   draft/Publish UI action, coordinating two RPC calls rather than one. Spec v8 §12.3.1
   explicitly allows a legacy adapter during migration; a full migration was judged a bigger,
   riskier change for a mostly-cosmetic architectural win.

## Decisions

**`content_schema_version = 2`.** `it_product_content_revisions.content_data` gains a shape:
`{ common: {...9 fields...}, guide?: {...}, template?: {...} }`. Schema v1 (every pre-v8 Guide
revision — flat `{ body_markdown, author }`, no `common` key) remains valid and readable
forever; `src/server/admin/editorial-content.ts`'s `resolveCommonCopy` is the one place that
interprets both shapes so callers never branch on schema version themselves.

**One shared editorial service** (`src/server/admin/editorial-content.ts`): `commonProductCopySchema`
(Zod), `resolveCommonCopy`, `saveEditorialDraft`/`publishEditorialRevision`/`rollbackEditorialRevision`
— thin wrappers around the existing `it_upsert_content_draft`/`it_publish_content_revision`/
`it_rollback_content_revision` RPCs. Guide, Template, and the Tool editor's common-copy half all
call into this instead of each duplicating the RPC-call plumbing. `src/components/admin/common-product-copy-fields.tsx`
is the matching shared form section (9 fields), and `src/components/admin/content-revision-rollback-list.tsx`
generalizes the old Guide-only rollback list to take its rollback action as a prop.

**Atomic common-copy publish** (`supabase/migrations/20260817150000_editorial_common_copy_publish.sql`):
`it_publish_content_revision` and `it_rollback_content_revision` were extended (`CREATE OR
REPLACE`, same signatures) so that publishing/rolling back a `content_schema_version = 2`
revision with a `common` key atomically writes those 9 values onto `it_products`' denormalised
columns in the same statement that moves `current_content_revision_id` — the public site never
sees a half-published state. A v1 revision's `common` resolves to `null`, so every column
assignment is a no-op for legacy history. Covered by `supabase/tests/it_content_revisions_test.sql`
(pgTAP — not run in this environment; see that file's own execution note) and
`tests/unit/editorial-content.test.ts` (`resolveCommonCopy`, run via `npm run test`).

**Template editor** (`src/server/admin/template-content.ts`, `src/server/actions/admin-template-content.ts`,
`src/components/admin/template-content-editor-form.tsx`): new "Editorial content" section on
`/admin/templates/[id]`, clearly separate from the existing "Create a new version"/"Version
history" file sections (spec §10.11.4 — file upload alone is not v8-compliant). Fields: common
copy + `instructions_markdown` (required) + `required_inputs`/`whats_included`/`example_markdown`/
`interpretation_guidance`/`cta_copy` (optional).

**Tool editor bundling** (`src/server/actions/admin-tool-copy.ts`'s `saveToolContentDraftAction`/
`saveAndPublishToolContentAction`): one Save draft/Publish action writes (a) the common-copy
revision via the shared editorial service when the tool_key has a backing `it_products` row,
then (b) the existing tool-specific-copy revision. If (b) fails after (a) published, the error
message says so explicitly (common copy is live, retry to finish tool copy) rather than pretending
this is one atomic transaction — it isn't, by design (see Context). Rollback stays two independent
actions/history lists (`rollbackToolCopyAction`, new `rollbackToolCommonCopyAction`) since the two
tables are genuinely separate revision timelines with no correlated revision numbers.

**Tool `copySchema` for all 26 Tools.** Every tool in `src/lib/tools/*/` now declares a
`copySchema` (`src/lib/tools/*/copy.ts`) and its Runner component resolves it via
`resolveToolCopy`, mirroring the `mvp-scoper` reference implementation (intro heading/bullets/CTA
+ each question's legend/hint at minimum; several tools also cover back/continue/validation-error/
result-footer copy where an editor's judgement found it clearly safe and worth exposing). Excluded
everywhere, matching `mvp-scoper/copy.ts`'s original reasoning: per-option labels/descriptions
(tightly coupled to `scoring.ts`'s fixed enum values) and any dynamic result content that comes
from `scoring.ts` itself (verdicts, rationale, next-step text) rather than being static UI copy.
`src/app/(marketing)/tools/[toolKey]/page.tsx`'s `TOOL_RUNNERS` map and `getToolCopyForToolKey`
query already called every Runner with a resolved `copy` prop before this work — no changes were
needed there; each Tool only needed to start using the prop it was already being handed.

## Not yet done
- `supabase/tests/it_content_revisions_test.sql` has not been executed (no local Postgres/Docker
  in this environment, consistent with every other pgTAP suite in this repo) — it was extended
  with 4 new assertions for the schema-v2 common-copy publish/rollback behaviour, authored but
  unrun, same status as the rest of that suite.

**Update 2026-08-18: Playwright e2e coverage added, live-verified — and it caught two real,
previously-undetected bugs.** `tests/e2e/admin-template-editor.spec.ts` and
`tests/e2e/admin-tool-editor.spec.ts`, backed by a new reusable staff-session helper
(`tests/e2e/helpers/admin-auth.ts`, `auth.admin.generateLink()` + the existing
`/auth/callback/implicit` page) and a Playwright "setup project"
(`tests/e2e/admin-auth.setup.ts`, `playwright.config.ts`'s `admin-setup`/`admin` projects) that
signs in once and shares the storageState — the first permanent Playwright coverage of an
authenticated admin session in this repo; prior sessions only ever ran the technique as one-off
Node scripts, and calling `signInAsStaff()` from each test's own `beforeEach` was tried first but
flaked: concurrent workers each requesting a fresh magic link for the same staff email invalidate
one another's not-yet-redeemed link. Both specs target the `mvp-scoper` family (Template "MVP
Scope in One Page", Tool "Scope Decider") and are deliberately draft-only — only ever "Save
draft", never "Publish" — safe to run repeatedly against the live project with no cleanup step.
They self-skip (`getStaffAuthConfig()`) when `NEXT_PUBLIC_SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`/
`E2E_STAFF_EMAIL` aren't exported, so CI (no secrets) is unaffected.

Two real bugs surfaced and fixed in the process, both invisible to typecheck/lint/build/unit
tests — only a genuine authenticated click-through caught them:

1. **Every admin rollback button was broken.** `ContentRevisionRollbackList`'s `onRollback` prop
   was passed as `(sourceRevisionId) => rollbackXAction({ ...extra, sourceRevisionId })` — an
   inline closure created in a Server Component page and passed to a Client Component. Next.js
   can only serialize a Server Action reference (optionally `.bind()`-curried) across that
   boundary, not an arbitrary closure; every visit to `/admin/guides/[id]`,
   `/admin/templates/[id]` or `/admin/tools/[toolKey]` 500'd outright ("Event handlers cannot be
   passed to Client Component props"). This predates v8 — the original Guide-only
   `GuideRollbackList` called its action directly from inside the Client Component, so v8's
   generalisation (moving the call out into the page) introduced the regression. Fixed by
   changing `rollbackGuideRevisionAction`/`rollbackTemplateContentAction`/`rollbackToolCopyAction`/
   `rollbackToolCommonCopyAction` to positional args and passing `<action>.bind(null, id)` from
   each page instead.
2. **`npm run build` (the README's advertised zero-credential fixtures build, and what CI's own
   build step runs) failed outright** with no Supabase env set: `getSupabaseServerClient()`
   throws its own "no env configured" guard *before* calling `cookies()`, so Next never observes
   a dynamic API being used and tries to statically prerender `/admin/*`/`/account/*` anyway,
   turning that guard's Error into a hard build failure instead of a "render this dynamically"
   signal. Predates v8 (present since Phase 6 introduced `/admin`); `/account` has the identical
   defect. Fixed with `export const dynamic = "force-dynamic"` on `src/app/admin/layout.tsx` and
   `src/app/account/(protected)/layout.tsx`. Re-verified clean: fixtures build exits 0 with every
   `/admin/*`/`/account/*` route now listed dynamic (`ƒ`), `typecheck`/`lint`/`test` (518 tests)
   all pass.

Also fixed along the way: the Supabase project's auth redirect allowlist only had `localhost:3000`
entries, not this repo's actual e2e/CI convention of port 4000 — added
`{127.0.0.1,localhost}:4000/auth/callback/implicit` to `supabase/config.toml` and pushed live
(confirmed clean single-section diff via `supabase config push`, no other settings touched).

Both new specs pass live, in isolation and as part of the full suite (141/145 e2e tests passing;
the other 4 failures — two axe color-contrast findings on live content, one live-Supabase
sign-in-copy mismatch, one one-off dev-server-under-load flake that reran clean — are pre-existing
and environment-specific, not caused by this work; not investigated further here).
