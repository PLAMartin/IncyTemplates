# 0005 — Schema deviations from the spec's literal SQL

## Status
Accepted

## Context
Spec §14's SQL snippets have a couple of gaps between the prose requirements
and the literal `create table` statements, and one new capability (waitlist
capture) was approved that the spec doesn't cover at all.

## Decision
Applied during migration authoring (see `supabase/migrations/`, each
site has an inline SQL comment):
- `it_products.licence_id` is missing its foreign key in the spec's snippet
  — added `references public.it_licences(id)`, since §36's publish
  validation requires a licence.
- Added the partial unique index the prose calls for but the SQL omits: one
  `is_current = true` row per product on `it_product_versions`.
- Added the partial unique index the prose calls for: one `status = 'active'`
  entitlement per customer+product on `it_entitlements` (schema-only this
  phase — nothing writes to `it_entitlements` yet).
- Added a generated `search_vector` tsvector column + GIN index on
  `it_products` (name/short_description/outcome_statement/search_keywords)
  to back §21 search now, since it's cheap schema work and avoids a second
  migration later.
- Added a new table, `it_waitlist_signups`, not present in the spec at all —
  see [[0006-waitlist-cta]] for why it exists. Public INSERT-only RLS, no
  public SELECT.
