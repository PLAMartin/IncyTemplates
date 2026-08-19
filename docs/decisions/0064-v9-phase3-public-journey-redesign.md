# 0064 — v9 Phase 3: public journey redesign

## Status
Complete and live-verified; not yet committed. Covers spec v9 §40 Phase 3: homepage rewrite,
simplified header/nav, the "Start a Product" Collection page, family-page collection context,
secondary catalogue curation, and sitemap coverage for the new route.

## Context
Phase 1 built the Collection data model and admin, but nothing on the public site actually used
it — `getCollectionBySlug`/`getActiveCoreCollection` existed on `CatalogueSource` since `0062`
but were never even exported from `src/server/queries/index.ts`'s ergonomic barrel, so no page
could import them without reaching into the class directly. Phase 3 is where the Collection
becomes something a visitor actually sees: a public page, the homepage's primary structure, and
the header's primary framing.

## What was built

**Query-layer gap closed**: added the two missing barrel exports (`getCollectionBySlug`,
`getActiveCoreCollection`) to `src/server/queries/index.ts` — a real, if small, leftover gap from
Phase 1, not new scope.

**New shared component** (`src/components/collections/collection-steps.tsx`): `CollectionSteps`
(the five connected step cards, used on the homepage, `/products`, and the Collection page
itself — one visual language everywhere, not three different renderings) and
`CollectionStepBadge` (the compact "Start a Product · Step N of 5" context badge for family
pages).

**New public Collection route** (`/collections/[slug]`, `generateStaticParams` pinned to
`start-a-product` today): promise/headline, the five-step `CollectionSteps` grid, the Shift Swap
worked-example thread (spec §3.7), and a primary "Start with [step 1]" CTA — spec §7.2's required
content. `/start/product` is a plain redirect to the canonical `/collections/start-a-product`
(spec §7.1: "use one canonical URL and redirect the other" — `/collections/[slug]` chosen as
canonical since it generalises to a future second collection without a code change).

**Homepage rewritten** (`src/app/(marketing)/page.tsx`): replaced the v3-era structure (13
sections including a 7-stage journey grid, a 26-framework wall, a separate free-templates grid,
a paid-bundle spotlight, and a guides teaser — all pre-dating the curated launch) with 9 focused
sections matching spec §10.1: hero (both CTAs go to the Tool and the Collection), the five-step
`CollectionSteps` grid, "How each step helps" (Guide/Template/Tool), the Product Idea Assessor
spotlight, a new worked-example thread section, a restrained static "Beyond the first five steps"
teaser (no dynamic catalogue grid — the 21 non-core families are unlisted and correctly can't
populate one anyway), the A Bit Gamey section, newsletter, final CTA. The old 7-stage "Where are
you in the journey?" grid is gone from the homepage entirely (still reachable via `/journey/*`
and the footer) — spec §3.2 is explicit the seven-stage taxonomy is secondary metadata, not the
primary launch journey.

**Navigation simplified** (`src/config/site.ts`): `primaryNav` cut from 6 items
(Products/Guides/Templates/Tools/How it works/About) to spec §8.1's 4
(Start here/Products/How it works/About) — "Start here" links to the Collection. `MobileNav`
needed no code change (it already renders whatever `primaryNav` contains). Footer gained
"Start a Product" as the first Browse link.

**`/products` restructured** (spec §8.2/§10.2): now leads with the same `CollectionSteps` grid,
followed by "More from Incy Templates" — which currently renders nothing, correctly, since
`getFrameworkTeasers()` already only returns `public_visibility: 'public'` frameworks and all 21
non-core families are `unlisted` (Phase 1). The "curated set" requirement turned out to already
be enforced at the query layer from Phase 1, not something this page needed to filter itself.

**Family page gained collection context** (`products/[slug]/page.tsx`): `CollectionStepBadge`
renders above the framework name when it's a member of the active core collection (all 5 core
family pages now show e.g. "Start a Product · Step 2 of 5").

**Sitemap**: added `/collections/start-a-product` to `STATIC_PATHS`. `/start/product` is
deliberately excluded (it's a redirect, not a canonical URL). Confirmed `getFrameworks()` and
`searchCatalogue()` — the two sitemap data sources — already filter `public_visibility = 'public'`
(Phase 1 query-layer behaviour), so the sitemap was already correctly excluding the 21 unlisted
families before this pass; no fix needed there.

## Real bug found and fixed
A classic JSX whitespace-collapse gotcha in the new Collection page's worked-example paragraph:
`<strong>Improve</strong> idea,` rendered as "Improveidea," with the space silently eaten,
because the space sits at the start of a JSX text node that spans multiple source lines — Babel's
per-line whitespace trimming strips leading whitespace per line regardless of what precedes it on
the same source line. Confirmed via `page.textContent()`, not just visual inspection (bold-to-
normal-weight font transitions can visually hide a genuinely missing space). Fixed with an
explicit `{" "}` expression container, which isn't subject to the trimming rule — the standard fix
for this. Checked the rest of this session's new/edited files for the same `</tag>` immediately
followed by more text pattern; found one other instance (`products/[slug]/page.tsx`'s
"Recommended starting point" `<strong>`) but it's pre-existing code where the closing tag is
immediately followed by another closing tag, not text — not affected.

## Verification
`typecheck`/`lint`/`test` (530 tests, unchanged — no new logic needing unit coverage, this pass
is markup/composition) all clean. Zero-credential `npm run build` clean —
`/collections/[slug]` and `/start/product` both build correctly against fixture data (Phase 1
already seeded a fixture-side "start-a-product" collection). Live-verified via screenshots
(desktop homepage, Collection page, `/products`, mobile homepage, mobile nav) against the real
project — five-step journey, worked-example thread, restrained "Beyond the first five steps"
section (no catalogue wall), and the family-page collection badge all render correctly. Re-ran 42
e2e tests against the live-backed dev server after all changes — full `accessibility.spec.ts` (11
axe scans, including homepage and the now-restructured product/family pages),
`catalogue-browse.spec.ts`, `finder.spec.ts`, and all 28 `product-families.spec.ts` tests — all
pass, no regressions from the nav/homepage/family-page changes.

## Explicit acceptance-criteria check (spec §10.1)
- Proposition understandable without scrolling — confirmed via mobile screenshot (headline + one
  dominant CTA visible above the fold).
- Five-step journey understandable without the seven-stage taxonomy — the 7-stage grid is gone
  from the homepage; the five-step `CollectionSteps` grid is the primary journey visual.
- No Unlisted/Hidden family appears anywhere on the homepage or `/products` — enforced by the
  query layer (`getFrameworkTeasers`/`getActiveCoreCollection` only ever return public members),
  not by page-level filtering that could be forgotten later.
- No broad wall of product cards competing with the Core Collection — the old 26-framework grid,
  featured-free-templates grid, and paid-bundle spotlight are all removed from the homepage.
- Continue-state — correctly absent everywhere (Phase 4, no progress-tracking data source exists
  yet); nothing was built to fake it.

## Follow-up (Phase 3 scope, not done this pass)
- Spec §8.3's "secondary links to Guides/Templates/Tools only after the primary journey" in
  mobile nav — not added; those routes remain reachable via `/products` → family pages and the
  footer, judged sufficient for now rather than adding a secondary mobile-nav section.
- No structured data specific to the Collection page (e.g. an `ItemList`/`CollectionPage` schema)
  was added — only the existing `breadcrumbJsonLd` pattern was reused. Spec §26.1.1 "Collection
  hierarchy" structured-data guidance not read/applied this pass.
- `/journey/*` pages and their footer link are untouched — still using the seven-stage taxonomy,
  correctly positioned as secondary per spec, not audited for their own coherence.
- Phase 4 (continue-your-journey), Phase 5 (analytics) remain fully unbuilt, as before.
