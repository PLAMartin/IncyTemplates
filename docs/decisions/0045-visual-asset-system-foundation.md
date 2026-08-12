# 0045 — Visual Asset System: schema, storage, RLS and the provider-neutral interface

## Status
Accepted (foundation only — see Follow-up)

## Context
Spec v5 (adopted this session, superseding v4 as the spec of record) adds an admin-managed
Visual Asset System on top of v4's product model unchanged: Visual Briefs, versioned Visual
Recipes, three visual-source types (generated/uploaded/rendered), mandatory human approval
before publish, and a provider-neutral generation service boundary (§11.5-§11.10, §12.6,
§14.13, §17). §45's "recommended first development milestone" explicitly allows deferring
production image generation behind a mocked/no-op provider — this build takes exactly that
slice: the data model, storage buckets, RLS, and the `VisualGenerationProvider` TypeScript
interface with a mock implementation. It deliberately does **not** build the admin Visuals
workspace UI (Brief editor, candidate generation, comparison, approval flow, Visual Recipe
administration) — that's a UI surface comparable in size to the whole Phase 6 admin build
(`0044`), and starting it blind risked repeating this session's own lesson about unplanned
scope creep. It's queued as explicit follow-up work, not built in this pass.

## Decisions

**`it_files` is not reused for visual master/variant storage — a schema deviation, following
the pattern `docs/decisions/0005-schema-deviations.md` established.** The spec's literal DDL has
`it_visual_assets.master_file_id`/`it_visual_asset_variants.file_id` as foreign keys into
`it_files`. That table's `product_version_id` is `not null references it_product_versions(id)`
(`20260728155513_product_versions_files_bundles.sql`) — every row is scoped to a specific
downloadable product version. A visual asset can belong to a framework (which has no version
concept at all) or to a product without being a "version" of a downloadable file, so `it_files`'
NOT NULL constraint can't be satisfied. Rather than relax a foundational, heavily-relied-on
constraint, `it_visual_assets`/`it_visual_asset_variants`
(`20260812140005_it_visual_assets_schema.sql`) carry their own
`storage_bucket`/`storage_path`/`mime_type`/`byte_size`/`checksum_sha256` columns directly,
mirroring `it_files`' shape without the mismatched FK.

**Three new enums in their own migration file** (`20260812140000_it_visual_asset_enums.sql`),
reproduced verbatim from spec §14.2: `it_visual_source_type`, `it_visual_asset_status`,
`it_visual_asset_type`. Split from the table migration for the same reason `it_public_visibility`
was (`0044`): a newly created enum type can't be used in the same migration transaction it's
created in.

**No anon/authenticated RLS policy on `it_visual_assets` at all — the strictest table boundary
in this codebase so far.** Every prior "draft vs published" table (`it_product_content_revisions`
in `0044`) becomes fully column-safe once published, so a single `published_at is not null and
parent is public` policy suffices on the base table. `it_visual_assets` can't use that shape:
`prompt_snapshot`, `provider`/`provider_model`/`provider_asset_id`, and `generation_metadata` are
present regardless of status and must never be public (spec §16.1: "never candidate/selected/
admin-only prompt metadata"). Public reads go exclusively through `it_visual_assets_public`
(`20260812140015_it_visual_assets_rls.sql`), a narrow explicit column allowlist (id, framework_id,
product_id, asset_type, alt_text, decorative, published_at only), following the
`it_frameworks_teasers` precedent: deliberately not `security_invoker`, so the view's own `WHERE`
clause is the complete security boundary and there's nothing sensitive in its column list to leak
regardless of the base table's RLS. The view additionally re-checks that the parent
framework/product is itself publicly visible (`status = 'published' and public_visibility <>
'hidden'`), so a published visual on a hidden framework can't leak through this side door.
`it_visual_asset_variants` has no such sensitive-column problem (just storage path/dimensions), so
it gets a direct anon policy instead of needing its own view — scoped by an `exists` against
`it_visual_assets_public` so it inherits the same boundary. `it_visual_recipes` has no
public-facing use yet (rendering a page needs the image files, not the recipe's design-token
config), so it's staff-only, no anon policy at all.

**Two new storage buckets, mirroring the `it-free-files` precedent
(`20260728203024_free_files_storage_bucket.sql`).** `it-admin-staging` (private) holds candidates
until approval — no `storage.objects` policy needed, since a bucket with no matching policy
already denies all non-service-role access by default. `it-public-assets` (`public: true`) holds
approved masters/variants — Supabase serves `public: true` bucket reads through the
`/storage/v1/object/public/` path without an RLS check, so no explicit anon SELECT policy is
needed either; writes stay service-role-only by the same default-deny, matching how
`it_replace_product_file` already handles template file uploads (upload client-side via
service-role first, record rows after).

**`VisualGenerationProvider` interface + `MockVisualGenerationProvider`
(`src/lib/visuals/provider.ts`), matching spec §12.6's suggested TypeScript boundary exactly** —
`generate(request): Promise<GeneratedVisualCandidate[]>`. No production image-generation provider
is selected yet (open decision #25), so the mock is what every future admin Visuals workspace call
will run against until one is chosen; swapping in a real provider later means implementing this
one interface again, not touching calling code. The mock returns genuine, decodable SVG
placeholders (not stub errors) — one per requested candidate, each labelled with the Brief's
`objective`/`subject` text — so a future staging/selection/approval UI has something real to
render against today rather than needing its own fixture data. Bytes are returned as `Uint8Array`
+ explicit `mimeType` rather than the spec's looser `bytesOrFileRef: unknown`, since this
implementation always produces in-memory bytes and a concrete type is strictly more useful to
callers than `unknown`.

**Visual Recipe v1's actual colour values were deliberately NOT seeded.** Spec §11.6 describes a
navy/purple/lilac/mint palette, but the site's actual, already-shipped visual identity
(`docs/decisions/0002-visual-identity-direction.md`, used across all 23 live product families and
the admin panel) is pine/teal + warm paper + amber (`--color-brand-*`/`--color-paper`/
`--color-accent-amber-*` in `src/app/globals.css`) — and that ADR is itself still marked "Proposed
— owner-pending." Spec §44 item 2 explicitly flags the Visual Recipe's design tokens as a
still-open product-owner decision, not something to resolve by guessing which of two conflicting
palette descriptions wins. `VisualRecipeConfig` (`src/lib/visuals/types.ts`) defines the shape a
recipe's `config_data` takes (token *names*, not raw colour values, per spec's own instruction to
"reference named design tokens from the application theme"), but no `it_visual_recipes` row has
been inserted — seeding one with a guessed palette risks it later being treated as "approved by"
once a real staff account exists, which is a harder mistake to unwind than just asking first.

## Follow-up
One thing blocked this from being a usable end-to-end system; it's now resolved, one remains:

- ~~**Confirm the Visual Recipe v1 palette**~~ Resolved same day — see
  `0046-visual-recipe-v1-palette.md`: uses the shipped pine/teal identity, not spec §11.6's
  navy/purple description. `it_visual_recipes` row `incytemplates-v1` v1 is seeded and approved.
- **The admin Visuals workspace UI** (Brief editor, bounded candidate generation, comparison grid,
  selection/approval/publish/rollback, Visual Recipe administration restricted to Admin/Owner per
  spec §16.3) — not started. This is Phase 6's remaining scope extension and is comparable in size
  to the whole `0044` admin build; start it as its own scoped pass once the palette question above
  is resolved, not blind.

Also still open from spec §44, unrelated to whether the UI gets built: the production
image-generation provider selection (#25), generation budget/rate limits (#26), who may activate a
new global Visual Recipe version (#27 — spec §16.3 already recommends Admin/Owner, matches this
build's RLS), rejected-candidate retention policy (#28), and whether all six flagship families
need an approved visual before public launch (#29).
