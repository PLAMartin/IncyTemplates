# 0049 — Catalogue-card visuals, batched, with a family_hero fallback

## Status
Accepted

## Context
`0047`/`0048` wired a published visual into exactly one place: the family page's hero slot. Every
catalogue/listing surface (homepage, `/products`, `/journey/*`) — all built on `FrameworkCard` +
`FrameworkTeaser` — still rendered no image at all. This closes that gap.

## Decisions

**Batched, not per-framework.** A listing page renders many teasers in one request;
`getFrameworkVisual()` (the single-framework helper from `0047`) would mean N+1 queries. Added a
private `getFrameworkCardImages(frameworkIds)` to `SupabaseCatalogueSource` instead: one query
against `it_visual_assets_public` for every requested framework (`asset_type in
('family_card','family_hero')`), one query against `it_visual_asset_variants` for the resulting
asset ids, joined in JS. Same two-query-not-embedded-select pattern as `getFrameworkVisual`, for
the same reason (PostgREST relationship inference through a view is unverified against a live
schema — this file's own header comment already established that convention).

**`family_card` preferred, `family_hero` an accepted fallback.** Spec §11.8 explicitly endorses
this: "A family does not need a unique generated asset for every type... one approved master
family visual may supply both family_card and family_hero crops/variants when appropriate."
Concretely useful today: no framework has a `family_card`-typed visual yet (Product Idea Assessor
`0047` and every visual made through the admin workspace so far is typed `family_hero`), so
without the fallback this feature would render nothing until someone specifically creates a
`family_card` asset. With it, Product Idea Assessor's existing hero visual shows up on its
catalogue card immediately — verified live, `/products` screenshot shows exactly one populated
card among the ones with no visual yet, image and layout both correct.

**`FrameworkTeaser` gains `cardImage: FrameworkTeaserImage | null`**, not a separate parallel
lookup the page has to wire in itself — every `FrameworkCard` consumer (`homepage`, `/products`,
`/journey/[stage]`) already passes a `FrameworkTeaser` straight through, so this is zero call-site
changes beyond the type gaining a field. Fixture source returns `cardImage: null` unconditionally,
same "absence must never block the page" convention as `getFrameworkVisual`'s fixture
implementation (spec §44 item 29).

**Plain `<img>` in `FrameworkCard`, not `next/image`** — same SVG/CSP reasoning as the family
page's hero image (`0047`) and the admin Visuals workspace's own candidate/history previews
(`0048`); not re-litigated per call site, same open decision either way.

## Follow-up
Homepage/journey-page card grids weren't independently screenshotted this pass (only `/products`
was) — same component, same data path, so no reason to expect different behaviour, but not
independently verified. The `next/image`-vs-SVG decision (now touching three separate call sites)
is worth resolving for real once uploaded, not just rendered, visuals exist — see `0047`'s and
`0048`'s Follow-up sections, unchanged.
