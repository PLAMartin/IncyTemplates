# 0018 — Framework "next step" is a direct self-reference, not `it_product_relationships`

## Status
Accepted

## Context
Spec §14.11 defines a generic `it_product_relationships` table with a
`next_step` relationship type (among others: `same_family`, `related`,
`alternative`, `bundle_upgrade`, `prerequisite`) for cross-linking outputs.
This milestone has exactly one framework-to-framework link to express:
Product Idea Assessor → Customer Discovery Kit.

## Decision
`it_frameworks` gets a single `next_step_framework_id uuid references
it_frameworks(id) on delete set null` column
(`supabase/migrations/20260809160005_it_frameworks.sql`) instead of a row in
the generic relationships table. `on delete set null` (not `restrict`):
retiring or renaming the next-step target shouldn't block deleting this row.
The fixture data source (`content/seed/catalogue.ts`) stores this as a plain
`next_step_framework_slug: string | null` field on each framework fixture;
`SupabaseCatalogueSource` resolves it via a self-join embed
(`next_step:it_frameworks!next_step_framework_id(slug)`).

`it_product_relationships` itself is untouched and still exists for
output-to-output relationships (spec's original intent) — this decision only
concerns the framework-to-framework "next step" link specifically.

## Follow-up
Once more families are published and multiple next-step/related/alternative
links exist per framework, revisit whether a single column still suffices or
whether it's worth migrating to `it_product_relationships` (or a parallel
`it_framework_relationships` table) for a proper many-to-many model. Building
that generic plumbing for one link wasn't proportionate this pass.
