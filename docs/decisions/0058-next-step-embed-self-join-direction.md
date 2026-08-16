# 0058 — Fix: "Next step" section silently empty against live data (self-referencing FK embed resolved in the wrong direction)

## Status
Accepted

## Context
`0057`'s Follow-up (and `project_build_order` memory after `0055`) flagged that the family
page's "Next step" section didn't render against the live Supabase project for several
families with a real `next_step_framework_slug` — confirmed for both Sticky Pitch Checker and
AI Agent Designer — while the identical page rendered correctly against local fixtures. Root
cause traced and fixed this pass.

## Root cause

`src/server/queries/supabase-source.ts`'s `FRAMEWORK_SELECT` embedded the framework's next-step
framework via:

```
next_step:it_frameworks!next_step_framework_id ( slug )
```

`it_frameworks.next_step_framework_id` is a **self-referencing** foreign key (it_frameworks →
it_frameworks). For a self-join, PostgREST's `!column_name` hint disambiguates *which* FK
constraint to use when a table has more than one relationship to the same target, but on a
self-join it does **not** by itself disambiguate *direction* — verified live: querying
`mvp-scoper` with this exact embed returned

```json
"next_step": [{ "slug": "better-decision-maker" }, { "slug": "ai-agent-designer" }]
```

— the **reverse** relationship (every *other* framework whose own `next_step_framework_id`
points *at* MVP Scoper), not the forward one (MVP Scoper's own `next_step_framework_id`, which
actually points at `product-naming-system`). `mapFramework`'s `row.next_step?.slug ?? null` then
silently produced `null`, since `.slug` on an array is `undefined` — no error anywhere in the
chain, just a quietly missing section. Every framework whose own row happens to have nothing
pointing back at it (true for most Tier 3 families, since `next_step_framework_slug` links are
sparse) got an empty array instead, same silent-`null` outcome.

Fixtures (`content/seed/catalogue.ts`) hardcode the already-resolved slug per framework with no
join involved, so they were never exposed to this — which is exactly why the bug tracked as
"pre-existing, cross-family, live-DB-only" across two prior "what's next" sessions before being
traced here.

**Fix, confirmed live via the raw PostgREST endpoint before touching the app code**: embed via
the FK *column* directly, not through the target table name —

```
next_step:next_step_framework_id ( slug )
```

This resolves the forward (single-row) direction unambiguously (`{"slug": "product-naming-system"}`
for MVP Scoper) and returns `null` cleanly for a framework with no next step
(`decision-framework-picker` → `next_step: null`), the same shape `mapFramework` already
expected. One-line change to `FRAMEWORK_SELECT`.

**Scope check**: grepped every other `!`-hinted embed in `supabase-source.ts`. The other three
(`it_product_content_revisions!current_content_revision_id`,
`it_products!it_bundle_items_included_product_id_fkey`, `it_products!target_product_id`) are all
cross-table FKs (source and target tables differ), which don't have this self-join direction
ambiguity — PostgREST only has one relationship to choose between regardless of hint syntax, so
they're unaffected. `next_step_framework_id` was the only self-referencing FK in this file.

**Live-verified end-to-end**: rebuilt against the live project, confirmed via curl that both
`/products/ai-agent-designer` and `/products/sticky-pitch-checker` now render "Next step" with
the correct linked framework; re-ran the two previously-failing e2e assertions
(`tests/e2e/product-families.spec.ts`) against the live-backed server — both now pass, where
before this fix only the fixtures-backed run passed. `npm run typecheck`/`lint`/`test` (501
tests, unchanged — this is a query-shape fix, no new test surface) all clean.

## Follow-up
None outstanding — this closes the gap flagged after `0055` and again in `0057`. Worth
remembering as a general lesson for any future self-referencing FK embed in this codebase:
embed via the FK column name directly (`alias:fk_column_name(...)`), not via
`target_table!fk_column_name`, to get the "belongs to" (forward, single-object) direction
unambiguously.
