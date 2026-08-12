# 0047 — Product Idea Assessor's family visual: the Visual Asset System proven end-to-end

## Status
Accepted

## Context
`0045` shipped the Visual Asset System's schema/storage/RLS/provider-interface foundation but
nothing consumed it — no row existed, no page read from it. Spec §45's "recommended first
development milestone" explicitly calls for "Product Idea Assessor approved family visual plus
public card/hero rendering" as part of proving the pattern before scaling up. This closes that
gap: a real visual, published through the actual candidate→selected→approved→published lifecycle,
served from public storage, rendered on the live family page — cheap enough to not need the
admin Visuals workspace UI or an AI provider decision first, and enough to de-risk both before
investing in either.

## Decisions

**Deterministic `rendered` source, not `generated`.** No production image-generation provider is
selected yet (spec §44 item 25), and spec §11.8's asset-type table already permits
`guide_diagram` to be "deterministic SVG/HTML" — nothing forbids the same approach for
`family_hero`. `src/lib/visuals/render/product-idea-assessor-family.ts` is a pure function
(`renderProductIdeaAssessorFamilySvg()`) producing an identical SVG string every call: three
abstract "note" cards converging into one checked result card, representing "fragmented idea
signals → one scored decision." Purely iconographic — no `<text>` elements at all — so it never
depends on baked-in words for meaning (spec §11.9). Colours are the resolved light-mode hex values
behind Visual Recipe v1's token names (`0046`), hardcoded at render time: a standalone SVG served
via `<img src>` has no access to the parent document's CSS custom properties, so token names can't
be referenced live the way they can inside the app's own stylesheet.

**Typed `family_hero`, not `family_card`.** First attempt seeded it as `family_card` and the
family page queried `family_hero` — silent mismatch, `getFrameworkVisual` correctly returned
`null` (absence-must-not-block behaviour working exactly as designed), page just rendered without
a hero. Caught by directly testing the query function in isolation rather than assuming the UI
failure meant a query bug. Retyped to `family_hero` (spec's own definition: "larger
family-page illustration") since that's genuinely what this occupies — the family page's hero
slot, not a catalogue-card thumbnail (which nothing renders yet — see Follow-up).

**Real lifecycle, not a shortcut to `published`.** `scripts/seed-product-idea-assessor-visual.ts`
(`npm run seed:product-idea-assessor-visual`) uploads to the private `it-admin-staging` bucket as
a `candidate` row first, then explicitly selects, approves, copies the object into the public
`it-public-assets` bucket, and marks the row `published` — recording `selected_by`/`approved_by`/
`published_by` against the owner profile with real timestamps. This is a genuine decision made in
this conversation, not a placeholder awaiting the not-yet-built admin UI, so it's recorded as a
real approval rather than left in a permanent draft state nothing will ever formally approve.
Idempotent: re-running finds the existing row by `(framework_id, asset_type, source_type)` and
updates it in place rather than duplicating.

**Both `card_md` and `hero_lg` variants point at the same master SVG bytes.** SVG is lossless at
any scale, and no raster image-processing dependency (e.g. `sharp`) exists in this repo yet —
adding one is a real dependency decision (native binary, build-time cost) that shouldn't be a side
effect of a proof pass. Variant rows still carry distinct, correct `width`/`height` metadata
(spec §11.10's anti-layout-shift requirement), just identical `storage_path`.

**`getFrameworkVisual(frameworkId, assetType)` added to `CatalogueSource`** (`src/server/queries/`),
implemented against Supabase as two separate queries — `it_visual_assets_public` filtered by
framework/asset-type, then `it_visual_asset_variants` filtered by the resulting id — rather than
one embedded PostgREST select. `it_visual_asset_variants`' foreign key points at the base
`it_visual_assets` table, not the `it_visual_assets_public` view, so embedding through the view is
unverified PostgREST relationship-inference behaviour; this file's own header comment already
established the convention of flagging rather than assuming that syntax works. Fixture
implementation returns `null` unconditionally — no fixture visual-asset data exists, and absence
must never block rendering (spec §44 item 29), which the family page's `heroVariant` optional
chaining already relies on structurally, not just by convention.

**Plain `<img>`, not `next/image`, on `src/app/(marketing)/products/[slug]/page.tsx`.** Enabling
SVG through Next's image optimizer means opting into `dangerouslyAllowSVG` plus a CSP tradeoff —
relevant project-wide once the (not yet built) admin workspace allows uploaded, not just rendered,
visuals, since an uploaded SVG is attacker-controllable content in a way a server-rendered one
isn't. Deciding that deliberately, not as a side effect of wiring up one placeholder image.
Explicit `width`/`height` attributes on the plain `<img>` still prevent layout shift without
needing the optimizer.

## Follow-up
- **Catalogue-card (`family_card`) rendering is still unbuilt** — this pass only wired the family
  page's hero slot. `FrameworkCard`/catalogue listings don't render any visual yet.
- **True raster derivatives** (WebP/AVIF at the variant table's distinct sizes, plus an
  `og_1200x630` social-preview variant) need an image-processing dependency decision, deferred
  here.
- **The `next/image`-vs-SVG-security tradeoff** needs a real decision once uploaded visuals exist,
  not just rendered ones.
- **The admin Visuals workspace UI** is still the big remaining piece (`0045`'s other follow-up
  item) — this proof case exists entirely via one-off scripts because that UI doesn't exist yet.
