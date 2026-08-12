# 0044 — Admin/editorial operations: Phase 6, staff auth and the draft/publish/rollback spine

## Status
Accepted

## Context
Phase 6 of the spec (`docs/Incytemplates-website-spec-v4.md:3181`) is the last content-model
phase before launch readiness: "Deliver Framework/source-post management, browser-based Guide
content editor with Markdown preview, Template metadata/instruction editor plus validated
replacement-file upload/versioning, Tool-facing text editor and Tool-declared safe configuration
editor, Product-content draft revisions/authenticated preview/publish/rollback, Public/Unlisted/
Hidden controls, ... audit log." The MVP acceptance bar (§41, line 3268) and launch checklist
(§42, line 3307) both restate the same list as pass/fail gates: an Editor must be able to publish
Guide text, replace a Template file as a new version, and edit Tool-facing copy — all without a
deployment — while Hidden outputs must be provably inaccessible (including by direct URL) and
Draft revisions must never be publicly readable. Every one of those gates drove a concrete table,
RLS policy, or route in this build; nothing here is speculative beyond what §41/§42 require.

The whole phase exists to solve one problem: every prior phase's content (Guide bodies, Template
instructions, Tool copy, visibility) lived only in migration/seed SQL or in code — changing it
meant a deployment. Phase 6 moves those specific surfaces into database rows editable from
`/admin`, while deliberately keeping Tool *logic* (scoring functions, verdict trees) out of
reach: spec line 998 ("must never expose a generic ... editor or allow arbitrary executable code
to be stored and executed from database content") is the hard constraint behind the
`ToolCopySchema` design below, not an incidental choice.

Two scope decisions, both already documented at their source rather than newly asserted here:

- **The 8 new pgTAP tests (`supabase/tests/it_visibility_rls_test.sql`,
  `it_content_revisions_test.sql`) were authored but never run.** `supabase/tests/README.md`
  states plainly: "Execution status: not yet run... this environment has no Docker daemon
  installed (both `supabase test db` and `supabase test db --linked` shell out to Docker
  regardless of link state)." The project itself *is* linked (`Incytemplates`,
  `gcflcfwonzmsrbybckey`) and the two pending migrations were pushed to it via `supabase db
  push` during this same build — only the pgTAP runner's Docker dependency blocks execution.
  This is an environment limitation, not a design gap — the tests exist and assert real
  behaviour, they just haven't executed against a live Postgres yet.
- **`tests/e2e/admin-auth.spec.ts` covers the unauthenticated gate only** — the `/admin` redirect,
  the sign-in form's own behaviour, an axe scan — not an authenticated admin CRUD flow. Its own
  top comment explains why: "needs a way to establish a real staff session in a test browser
  context — e.g. Supabase's `auth.admin.generateLink` to mint a usable magic-link URL, or seeding
  a session cookie directly — which isn't wired up yet." `playwright.config.ts`'s scope comment
  was updated to match (see Follow-up).

## Decisions

**Auth: magic-link sign-in, no self-serve sign-up, staff-only for now.**
`src/server/actions/auth.ts`'s `requestMagicLink` calls `supabase.auth.signInWithOtp` with
`shouldCreateUser: false` — a link is only ever sent to an email that already has an `auth.users`
row, provisioned directly in Supabase. `src/components/auth/magic-link-form.tsx` is the only UI,
reused as-is for both `/sign-in` and (implicitly) any future customer magic-link flow; its footer
copy ("Staff accounts only") is the one piece that's Phase-6-specific. `safeRedirectPath()` only
ever forwards a same-origin absolute path into `emailRedirectTo`, closing the open-redirect hole
that pattern invites.

**Two-tier gate: `src/proxy.ts` optimistic, `src/server/auth/dal.ts` authoritative.** `proxy.ts`
(this repo's renamed `middleware.ts` — see its own header comment and `AGENTS.md`) matches
`/admin/:path*` and does exactly one thing: reject signed-out requests fast, without a database
read, because it runs on every request including prefetches. It does not and cannot check
`it_profiles.role` — that would mean a DB round-trip per request. The actual security boundary is
`requireStaffSession()` / `requireRole()` / `requireAnyRole()` in `src/server/auth/dal.ts`, called
from `src/app/admin/layout.tsx` (every admin route, via `requireStaffSession()`) and from
individual Server Actions where the spec's role matrix demands more than "any staff role." This
split is the DAL pattern the vendored Next.js auth guide recommends
(`node_modules/next/dist/docs/01-app/02-guides/authentication.md`), and the DAL file's own header
comment states the distinction explicitly: proxy is optimistic, DAL is secure.

**Four staff roles, ranked, with an explicit escape hatch for non-linear grants.**
`STAFF_ROLES = ["support", "editor", "admin", "owner"]` with `ROLE_RANK` giving each a numeric
rank, matching the spec's own Support/Editor/Admin/Owner separation (§16.3, line 1706) and the
existing `is_staff()`/`is_admin()` DB functions. `requireRole(minimum)` is a clean "at least X"
check for the common case (Guide/Template/Tool-copy drafting and publishing needs `'editor'`).
But the RLS policy on `it_orders` grants support+admin+owner but *not* editor — editor outranks
support in the linear `ROLE_RANK` but must not see customer orders, since spec line 1712 draws
the line at "no customer-data access" for Editors specifically. `requireAnyRole(allowed[])` exists
for exactly this non-collapsing case; `src/app/admin/orders/page.tsx` uses it
(`requireAnyRole(["support", "admin", "owner"])`) with an inline comment stating the same
reasoning. Visibility changes (`changeFrameworkVisibility`, `changeProductVisibility`) are
deliberately pinned to `requireRole("admin")`, not `'editor'` — spec line 1715 explicitly allows
tightening ("hiding a paid live product may be restricted to Admin/Owner"), and both action files
carry that exact citation. Every other write action (`saveGuideDraftAction`,
`publishGuideRevisionAction`, `rollbackGuideRevisionAction`, the tool-copy equivalents,
`replaceTemplateFileAction`) sits at `requireRole("editor")`, matching spec line 1706's list of
capabilities extended to Editor/Admin.

**Visibility model: `it_public_visibility` enum (`public`/`unlisted`/`hidden`), deliberately not
`it_product_status`'s pre-existing `'unlisted'` value.** `it_product_status` already had an
`'unlisted'` enum member from v3, which conflated lifecycle and visibility — exactly the problem
the v4 spec's introduction calls out. `20260812090000_it_public_visibility_enum.sql` creates a
new, orthogonal enum rather than repurposing the old value (which is left in place, unused by any
policy from this point forward, because Postgres enum values can't be cheaply dropped).
`20260812090005_it_products_frameworks_visibility.sql` adds `public_visibility`, `hidden_at`,
`hidden_by`, `visibility_note` to both `it_products` and `it_frameworks`, then re-creates every
RLS policy that gated on `status = 'published'` to also require `public_visibility <> 'hidden'` —
files, versions, bundle items, product relationships, categories, stages, all of it — so a hidden
product's file metadata isn't independently readable through a side door even though the product
row itself is hidden. **`hidden` is an RLS-layer boundary; `unlisted` is an app-layer-only
filter.** The same migration's comment states this split explicitly: hidden must be enforced at
the DB layer (spec 14.7.2/§41: "inaccessible... including by direct public URL"), but unlisted
outputs must remain directly, publicly readable by URL (§41: "Unlisted outputs remain directly
accessible") while disappearing from catalogue/search/sitemap — a query-shape concern, not a
readability one, so it stays out of RLS `USING` clauses entirely. The one exception:
`it_frameworks_teasers`, the "coming soon" discovery view, is itself a discovery surface, so
`20260812110000_it_frameworks_teasers_public_only.sql` tightens its `WHERE` clause to
`public_visibility = 'public'` specifically (excluding unlisted too), while the base
`it_frameworks` table keeps allowing direct unlisted reads via `getFrameworkBySlug`/
`getFrameworkById` in `src/server/queries/supabase-source.ts`.

**Content revisions: mutable draft, security-definer publish/rollback, one-open-draft-per-product.**
`20260812090010_it_product_content_revisions.sql` picks the "draft is replaced in place" option
the spec explicitly leaves open (line 1526 allows either), because repeated saves while editing
shouldn't fork a new revision row per keystroke — ordinary CMS behaviour. The invariant is
enforced by a partial unique index, `it_product_content_revisions_one_draft_per_product` on
`(product_id) where published_at is null`, the same shape as the pre-existing
`it_product_versions_one_current_per_product` index. `it_upsert_content_draft` is a plain
`INSERT ... ON CONFLICT (product_id) WHERE published_at IS NULL DO UPDATE` — one function, no
race between "check for an existing draft" and "write it." `it_publish_content_revision` flips
`published_at`/`published_by` on the target draft and repoints
`it_products.current_content_revision_id` in the same transaction, then writes an audit row.
`it_rollback_content_revision` reads the spec's own wording (line 1528, "Rollback
creates/publishes a new revision") literally: it inserts a *new*, already-published revision
copying the source's `content_data`, rather than un-publishing history — so revision history is
append-only and a rollback is itself auditable and itself rollback-able. All three functions are
`security definer`, granted only to `service_role`, never to `authenticated` — this repo's RLS
migration has zero staff write policies by design (every privileged write goes through a
server-side service-role route that has already run `requireRole()`), and this table follows that
convention rather than inventing new staff RLS write policies. `it_write_audit_log` itself was
extended with a defaulted trailing `p_actor_profile_id` parameter (a compatible
`CREATE OR REPLACE`) because the pre-existing version always recorded `auth.uid()`, which is null
under a service-role call with no request-bound session — the admin write path needs to record
who actually clicked, not "no one."

**Tool copy: identical draft/publish/rollback shape, keyed by `tool_key` not `product_id`, gated
by a Tool-declared field schema.** `20260812090015_it_tool_copy_revisions.sql` mirrors the content
revisions table/functions exactly (`it_upsert_tool_copy_draft`, `it_publish_tool_copy_revision`,
`it_rollback_tool_copy_revision`), keyed by `tool_key` because a Tool's copy is a property of the
version-controlled registry entry in `src/lib/tools/registry.ts`, not of any one `it_products`
row — no FK to `it_products.tool_key`, which only has a plain index, not a uniqueness constraint.
The safety mechanism spec line 998 requires ("must never expose a generic ... editor or allow
arbitrary executable code") is structural, not just a DB comment: `ToolCopySchema` in
`src/lib/tools/types.ts` is a flat `Record<string, ToolCopyFieldSpec>` (`{label, kind: "text" |
"textarea", defaultValue}`) that a Tool opts into via its `copySchema` field on `ToolDefinition`.
`resolveToolCopy()` in `src/lib/tools/copy.ts` merges admin overrides over declared defaults and
explicitly drops any key present in `content_data` but absent from `schema` — defence in depth
alongside the DB/RLS layer, so even a stray key written directly to
`it_tool_copy_revisions.content_data` can never surface as rendered copy. Only MVP Scoper has a
`copySchema` today (`src/lib/tools/mvp-scoper/copy.ts`, 14 fields: intro heading/bullets/CTA plus
each of its 4 questions' legend/hint), deliberately scoped to intro/legend/hint copy and *not*
per-option labels — those are tightly coupled to `scoring.ts`'s value mapping, and editing wording
there without touching the scoring logic risks copy that no longer matches what an option
actually scores; `listToolsForAdmin()` in `src/server/admin/tool-copy.ts` still lists every
registered Tool via the new `listRegisteredToolKeys()` registry export, flagging `hasCopySchema`
per-tool so the other 22 Tools show up with nothing to edit yet rather than being hidden.

**Template file versioning: atomic version-flip via `it_replace_product_file`, upload-then-record
ordering.** `it_product_versions_one_current_per_product`'s partial unique index means "make this
version current" requires flipping the old current row's `is_current` to false and inserting the
new row in one atomic step — two separate client calls could race or partially fail into zero or
two current rows. `20260812120000_it_replace_product_file.sql` follows the same security-definer,
service-role-only, self-auditing shape as the content-revision functions. The actual file bytes go
to Supabase Storage *first*, client-side via the service-role client in
`src/server/admin/templates.ts`'s `replaceTemplateFile()` — matching the ordering
`scripts/seed-storage.ts` already established (upload, then upsert rows) — and only once that
upload succeeds does the RPC record the new version/file rows; if the RPC fails after a successful
upload, `replaceTemplateFile()` explicitly removes the now-orphaned storage object rather than
leaving unreferenced bytes behind. A 25 MB cap (`MAX_FILE_BYTES`) is enforced before any upload is
attempted. Checksums (`sha256`, via Node's `createHash`) are computed and stored per file.

**Audit log: one `it_write_audit_log` call per mutation, read via a single "staff can read audit
log" RLS policy.** Every write path — visibility changes, draft saves are *not* audited (only
publish/rollback/file-replace/visibility are, matching spec §42's explicit list: "Content
publication, rollback, file replacement and visibility changes appear in audit log" — draft saves
are deliberately excluded from that list), publish, rollback, file replacement — calls
`it_write_audit_log` with a structured `before_state`/`after_state` JSON pair and an optional
`reason`. `src/server/admin/audit-log.ts`'s `listAuditLogForAdmin()` is a plain read through the
session-bound client; the underlying RLS policy uses `is_staff()`, so any of the four staff roles
can view it (unlike orders, which excludes editor) — auditing itself isn't customer data.

**Consistent three-layer convention across Frameworks/Guides/Products/Templates/Tool-copy:
`src/server/admin/*.ts` (query/mutate) → `src/server/actions/admin-*.ts` (Zod-validate,
`requireRole`, call the admin module, `revalidatePath`) → `src/app/admin/**/page.tsx` +
`src/components/admin/*.tsx` (render, call the action).** Every admin module's read functions use
`getSupabaseServerClient()` (session-bound, RLS-respecting) — because the "staff can read
everything regardless of status" RLS policies already cover it, so bypassing RLS for reads would
be pointless privilege escalation — while every write function uses
`getSupabaseServiceRoleClient()`, because this repo's RLS migration deliberately has no staff
write policies anywhere (see `it_orders`/`it_webhook_events`, which read via service-role too:
`it_webhook_events` has *no* anon/authenticated RLS policy at all, so even a staff *read* of it
must go through service-role, gated instead by `requireRole('admin')` at the page level in
`src/app/admin/webhook-events/page.tsx`). Every write function in `src/server/admin/*.ts` states
in a comment that it does *not* itself check authorization — callers must have already run
`requireRole()` — keeping the authorization check in exactly one layer (the Server Action) rather
than duplicated or, worse, only implicit in RLS.

**`src/types/admin.ts` centralises `PublicVisibility`** as the one shared type mirroring the
`it_public_visibility` Postgres enum, imported by every admin module (`frameworks.ts`,
`guides.ts`, `products.ts`, `templates.ts`) rather than each redeclaring the three-value union.

## Follow-up
Two gaps, both already called out at their source rather than newly discovered here:

- **pgTAP suite not yet run.** `it_visibility_rls_test.sql` and `it_content_revisions_test.sql`
  are written to the standard `supabase test new -t pgtap` shape and assert real behaviour (hidden
  unreadable by anon even when published; unlisted readable at the RLS layer but excluded from
  `it_frameworks_teasers`; staff sees everything; one-open-draft-per-product upsert semantics;
  rollback creates rather than mutates; draft content never anon-readable) — but this environment
  has no Docker daemon installed, so `supabase test db --linked` has never executed against them
  despite the project itself being linked and the underlying migrations already pushed. Run once
  Docker is available.
- **No authenticated e2e session yet.** `tests/e2e/admin-auth.spec.ts` proves the unauthenticated
  gate (`proxy.ts`'s redirect) and the sign-in form, but nothing past that — there is no wired-up
  way to mint a real staff session inside a Playwright browser context (candidates noted in the
  spec file itself: `auth.admin.generateLink`, or seeding a session cookie directly). Until that
  exists, the admin CRUD flows (Guide draft/publish/rollback, Template file replacement, Tool-copy
  editing, visibility changes) are exercised only by the pgTAP suite above (once run) and manual
  testing, not by e2e.
