# 0062 — v9 Collection model and launch visibility curation (spec v9, Phase 0+1)

## Status
Accepted — code complete; migration `20260819120000_it_collections.sql` and the regenerated
`supabase/seed.sql` have been applied to the live Supabase project; the launch visibility review
has been run live. Scope deliberately limited to spec v9 §40 Phase 0 (baseline audit) and
Phase 1 (Collection model and curation controls) — Phases 2–6 (family content polish, homepage/nav
rewrite, continue/return state, analytics, launch QA) are explicitly out of scope for this pass.

## Context
`docs/Incytemplates-website-spec-v9.md` supersedes v8 (spec of record since `a9def11`, fully
built). v9 changes the near-term product strategy from broad catalogue expansion to a **curated
Core Collection** — "Start a Product": Product Idea Assessor → Customer Discovery Kit → Customer
Demand Test → MVP Scoper → First Customers Planner — while preserving the rest of the
implemented platform via the existing Public/Unlisted/Hidden visibility model rather than
deleting anything.

## Baseline audit (Phase 0)
Confirmed live before making any change: 26 frameworks, all `status='published'`,
`public_visibility='public'`; 79 products, all `published`/`public`. All 5 target core families
already have a Guide+Template+Tool (Customer Discovery Kit has two Templates). The existing
`flagship` boolean (6 frameworks) does **not** match the 5-family Core Collection — it includes
Better Decision Maker/Product Naming System and excludes Customer Demand Test — confirming per
spec §12.3.2 that Collection membership needed new, purpose-built data rather than a relabelled
column. No README/decision-doc "spec of record" pointer was updated as part of adoption — matching
actual precedent (the v8 adoption commit `a9def11` didn't touch `README.md` either); `README.md`'s
"Current milestone" section was already known-stale (still describes v3) before this pass and
remains so, a pre-existing gap, not something this session's scope covers.

## What was built

**Schema** (`supabase/migrations/20260819120000_it_collections.sql`): `it_collections` and
`it_collection_frameworks` exactly per spec §14.3.1's DDL. RLS mirrors the existing
`it_frameworks` pattern — anon/authenticated read published+non-hidden rows, staff read
everything, all writes are service-role-only (no staff write RLS policy, matching
`src/server/admin/frameworks.ts`'s established convention).

**Query layer** (`src/server/queries/types.ts`, `supabase-source.ts`, `fixture-source.ts`):
`getCollectionBySlug`/`getActiveCoreCollection`, returning a Collection with its ordered,
public-only member frameworks. Member frameworks are filtered defensively in application code
rather than via a PostgREST embedded `!inner` filter — this file has repeatedly found embedded-
relationship filtering unverified against the live schema (see the `next_step` self-join comment,
`0058`), so this queries broadly and filters in code instead, matching that file's existing
pattern.

**Seed data** (`content/seed/catalogue.ts`, `scripts/seed.ts` → `supabase/seed.sql`): the "Start a
Product" collection, 5 members in spec §3.4's order, using the spec's own step labels and
"Core transition" copy verbatim.

**Admin UI** (`/admin/collections`, `/admin/collections/new`, `/admin/collections/[id]`,
`src/server/admin/collections.ts`, `src/server/actions/admin-collections.ts`): list/create/edit a
Collection, add/edit/remove/reorder members (two-phase step_order update to dodge the
non-deferrable unique constraint), visibility control (reuses `VisibilityForm`, now supporting a
third `"collection"` kind), and a Publish action gated by `validateCollectionForPublish` — the
**mechanically-checkable** subset of spec §36.10 (name/slug/headline/short-description present;
≥5 members for a core collection, ≥2 otherwise; step order unique and contiguous; every member
framework published+public; transition copy present on every non-final step). The qualitative
§38.6 Core Collection quality gate (coherent terminology, real worked examples, no placeholder
copy) is **not** automated — it needs a human editorial read of rendered pages, which is Phase 2
content-polish work. Role gates follow this repo's existing split: collection content
create/edit/publish/member-management is `editor` (matching Guide/Template/Tool/Visual publish
actions); visibility changes are `admin` (matching `changeFrameworkVisibility`).

**Launch visibility review** (`scripts/v9-launch-visibility-review.ts`, `npm run
v9:launch-visibility-review`): a fixed, explicit, human-reviewed list of the 21 non-core
frameworks (confirmed against the live baseline above), setting each framework and its products
to `unlisted` through the same audited update+`it_write_audit_log` path
`setFrameworkVisibility`/`setProductVisibility` use — deliberately inlined rather than importing
those functions directly, since they're marked `import "server-only"` (stripped by Next's
bundler, but not resolvable by a plain `tsx` script run outside it — every other standalone
script in this directory avoids the same trap the same way). The 21-slug list is fixed, not "every
framework except the five core ones" computed dynamically, so a future new framework is never
silently unlisted by a later re-run without a fresh editorial decision.

## Live results
- `it_collections`/`it_collection_frameworks` live, "Start a Product" seeded with all 5 steps in
  the correct order and transition copy (verified via `supabase db query --linked`).
- 21 frameworks + 63 products flipped `public` → `unlisted`; 5 frameworks + 40 products (the core
  families plus every framework-independent v2/v3-era template/bundle) remain `public`. Audit log
  confirms 21 + 63 = 84 `visibility_change` rows with a shared, explicit reason.
- Nothing deleted, hidden, or otherwise made inaccessible — unlisted items keep working via direct
  URL, matching spec §5.3/§9.4.

## Real bug found and fixed during live verification
Flipping the 21 non-core frameworks to `unlisted` broke the "Next step" section on 4 of the 5 Core
Collection family pages and 3 non-core family pages, caught only by re-running
`tests/e2e/product-families.spec.ts` against the live-updated data (not by typecheck/lint/unit
tests). Root cause: `it_frameworks_teasers` (the view `getFrameworkTeasers()`/the family page's
"Next step" lookup reads) was already tightened to `public_visibility = 'public'` only, in a
**pre-existing** migration (`20260812110000_it_frameworks_teasers_public_only.sql`, v4) — so any
family whose legacy `next_step_framework_id` pointed at a now-unlisted framework silently lost its
"Next step" section (the target framework's own page still renders fine via direct access; only
the *teaser* used to build the next-step card disappeared). This is exactly the "old flagship
chain must not override the v9 Core Collection path" scenario spec §3.4 anticipates. Fixed by
updating the 5 core families' `next_step_framework_slug` to the actual Core Collection order
(`product-idea-assessor → customer-discovery-kit → customer-demand-test → mvp-scoper →
first-customers-planner → null`), re-seeded live, re-verified — the 4 affected core-family "Next
step" assertions pass again. **First Customers Planner is now deliberately terminal**
(`next_step_framework_slug: null`) rather than pointing at the now-unlisted Product/Market Fit
Tracker — spec §36.10 wants "a useful review/continue outcome rather than an accidental dead end"
here, but building that real continue-journey UI is Phase 4, not this pass; `null` is the honest
interim state (no section renders) rather than a misleading link. The 3 non-core-to-non-core
chains that broke the same way (Product/Market Fit Tracker → Pricing Your Product, Business Model
Chooser → Pricing Your Product, Product Positioning Builder → Product Naming System) were **not**
re-chained — non-core content coherence is Phase 2/3 scope — their e2e assertions were updated to
expect no "Next step" section instead, which is now accurate.

## Verification
`typecheck`/`lint`/`test` (530 unit tests, up from 518) all clean, including a zero-credential
`npm run build` with `.env.local` moved aside (the known Phase-6 fixtures-build gotcha — confirmed
still fixed, `/admin/collections*` routes list dynamic). New unit coverage: 3 fixture-source
collection-query tests, 9 `validateCollection` tests (refactored out of
`validateCollectionForPublish` specifically so this logic is unit-testable without a live/mocked
DB — no other admin CRUD module in this repo has unit tests, verification there has always been
live/e2e-only, so this is a deliberate, scoped exception for genuinely branchy new logic, not a
new blanket pattern). Live e2e: new `tests/e2e/admin-collections.spec.ts` (2 tests, deliberately
read-only — this admin UI writes directly with no draft state, unlike the Template/Tool content
editors, so a create/edit/reorder e2e test would either leave throwaway rows live or risk mutating
the real "Start a Product" collection; added to `playwright.config.ts`'s authenticated `admin`
project). Full relevant live e2e re-run clean: all 28 `product-families.spec.ts` tests, both
`catalogue-browse.spec.ts` tests, both new `admin-collections.spec.ts` tests, and the existing
`admin-template-editor.spec.ts`/`admin-tool-editor.spec.ts` suites (7 tests) — 39 total, 0
failures when run serially. Two transient failures seen under parallel workers on a cold dev
server (Turbopack still compiling a route when Enter was pressed, breaking focus/navigation
mid-keystroke) reran clean — the same class of "dev-server-under-parallel-load flake" already
documented in `project_build_order` memory for `0061`, not a regression.

## Follow-up (explicitly not done this pass)
- Homepage/nav rewrite, `/collections/start-a-product` public page, secondary-catalogue curation
  ranking — spec v9 Phase 3.
- Family-by-family content polish/coherence pass against the qualitative §38.6 gate — Phase 2.
- Anonymous continue-journey state, First Customers Planner's real "review/continue" terminal
  experience — Phase 4.
- Progression/return analytics — Phase 5.
- `README.md`'s stale "Current milestone" section (still v3) — pre-existing, unrelated to this
  pass, not fixed.
