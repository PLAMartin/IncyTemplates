# 0013 — v3 framework/product-family model: what's built, what's deferred

## Status
Accepted

## Context
Spec v3 repositions the site from a flat template/bundle store to a framework/
product-family platform: a framework (e.g. "Product Idea Assessor") sits above
up to three first-class outputs — Guide, Template, Tool — plus Bundle. Building
the full spec (§14 data model, §23 A Bit Gamey pipeline, accounts, commerce,
admin CRUD) in one pass isn't proportionate; this implements spec §45's own
recommended first milestone.

## Decisions

**One `it_products` table for Guide/Template/Tool/Bundle**, per spec §14.7's
literal SQL — not split into per-type tables. `it_products` already owns every
publish-status/search/SEO concern a Guide or Tool needs; splitting would fork
draft/published visibility across two systems for no benefit this milestone.
A Guide's body stays in `content/guides/*.mdx` (existing pipeline), joined to
its `it_products` row by matching `slug` — no `content_path` column added
since there's exactly one join key and nothing yet needs a second one.

**No `it_source_posts` / `it_framework_source_posts` tables this pass**
(spec §14.4). There is no importer and no real source-post data — an
unpopulated provenance schema is dead weight, not plumbing. `it_frameworks`
instead has a single free-text `source_note` column for an attribution line,
enough to satisfy spec §38.1's "framework declares source provenance" quality
bar. Revisit once a real A Bit Gamey import is scoped.

**No `it_tool_runs` table or anonymous-session identity this pass**
(spec §14.12). There's no write path without a persistence/abuse-protection
model, which is out of scope this milestone (no accounts, no saved runs).
Tool state (see [[0016-product-idea-assessor-tool-deterministic-only]]) is
entirely client-side/in-memory — nothing is sent to the server at all.

## Follow-up
When accounts/saved-runs land (spec Phase 3), add `it_tool_runs` and wire
`ToolContext.anonymousSessionId` (already reserved in
`src/lib/tools/types.ts`) through to it. When a real A Bit Gamey import is
scoped, add the source-post tables and migrate `source_note` data into
structured links.
