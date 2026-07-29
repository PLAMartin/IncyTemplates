# 0004 — Seed catalogue publish status

## Status
Accepted

## Context
Spec §37 literally says to "seed... draft products," but Phase 1's exit
criteria require that "seed products can be browsed" and that
"published/draft visibility is correct" — both need at least some published
content to demonstrate.

## Decision
Seed most of the §37 catalogue (8 free products, 2 bundles) as
`status: 'published'` with a `published_at` date, but deliberately leave 1-2
products `draft` and one `scheduled` with a future `scheduled_for` date, so
the catalogue's visibility filtering is actually exercised and provable, not
just assumed.

All seed copy is marked `is_placeholder: true` in the data (mirroring
`schema_data.placeholder` in the DB) since none of it has been through
business/legal approval yet — per §37's closing line and the launch
checklist's outstanding "Initial catalogue content approved" item.

## Follow-up
Needs explicit product-owner sign-off before any of this seed content is
treated as real/launchable copy.
