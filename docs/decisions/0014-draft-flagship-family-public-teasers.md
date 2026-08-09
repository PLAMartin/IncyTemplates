# 0014 — Draft flagship families are visible as public "Coming soon" teasers

## Status
Accepted — product-owner directed, overriding a stricter default reading

## Context
Spec §41's MVP acceptance criteria state "draft frameworks/products are
inaccessible publicly." The build plan's default assumption was to follow
that literally: the five non-flagship v3 families (Customer Discovery Kit,
Better Decision Maker, MVP Scoper, Product Naming System, First Customers
Planner) would be seeded `status: 'draft'` and simply not appear anywhere
public, leaving only Product Idea Assessor visible. Asked directly, the
product owner wanted the five draft families visible as "Coming soon" cards
instead — genuine breadth signal, not full hiding.

## Decision
A narrow, explicit exception: draft frameworks with `flagship = true` appear
on public listing surfaces (homepage, `/products`, `/journey/*`) via a
dedicated `it_frameworks_teasers` Postgres view
(`supabase/migrations/20260809160010_it_frameworks_rls.sql`) and the
`FrameworkTeaser` TypeScript type (`src/types/catalogue.ts`), which expose
**only** `name`/`slug`/`short_description`/`outcome_statement`/`status`/
`journey_stage` — never `problem_statement`, `method_summary`,
`priority_score`/`priority_rationale`, or any other editorial field. The full
`it_frameworks` table keeps a strict "published only" RLS policy for
anon/authenticated reads; the teaser view is a separate, deliberately narrow
projection, not a relaxation of that policy.

Visiting a draft framework's own `/products/[slug]` page directly renders a
minimal "in development" state (name + short description only, no outputs
section) rather than a 404 or the full editorial page — implemented as a
fallback branch in `src/app/(marketing)/products/[slug]/page.tsx`, using the
same teaser data, never the full `Framework` type.

## Why a view instead of relaxing RLS
RLS restricts *rows*, not *columns* — any policy letting anon see draft rows
at all would also expose every editorial column on that row. The teaser view
sidesteps this by simply never selecting the sensitive columns in its
definition, so there's nothing for the view to leak regardless of which rows
match its `WHERE` clause. See the migration file's comment for the Postgres
view-ownership mechanics this relies on (`security_invoker` not set).

## Follow-up
`tests/e2e/product-families.spec.ts` asserts this boundary end-to-end:
draft-flagship families show teaser-only content on listing pages and the
in-development state on their own page, never full detail.
