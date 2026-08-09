# 0020 — `searchCatalogue`/`getFeaturedFreeProducts` default to template+bundle

## Status
Accepted — bugfix during v3 implementation

## Context
`it_products`/`catalogue.products` gained `guide` and `tool` rows this pass
(spec §14.7 — see [[0013-v3-framework-product-family-model]]). Before v3,
`catalogue.products` only ever held `template`-typed rows, so
`CatalogueSource.searchCatalogue` and `getFeaturedFreeProducts` — which never
filtered by `product_type` unless a caller explicitly asked — implicitly only
ever returned templates. Adding Guide/Tool rows to the same array silently
started leaking them into `/templates`, `/templates/free` and the homepage's
"Featured free templates" section (both of which are explicitly labelled and
scoped as templates-only surfaces), caught by
`tests/unit/fixture-source.test.ts` failing after the framework rows were
added.

## Decision
Both `FixtureCatalogueSource` and `SupabaseCatalogueSource`:
- `getFeaturedFreeProducts` now explicitly filters `product_type = 'template'`.
- `searchCatalogue` now defaults to `product_type in ('template', 'bundle')`
  when the caller doesn't pass an explicit `type` filter. An explicit
  `filters.type` (e.g. `/tools/page.tsx` passing `type: 'tool'`) still works
  exactly as before and returns that type only.

This preserves every pre-v3 caller's behaviour unchanged while making the new
Guide/Tool types opt-in rather than a silent leak. `filter-bar.tsx`'s Type
dropdown (used only on `/templates` and its sub-pages) was correspondingly
**not** extended with Guide/Tool options — those product types have their own
dedicated `/guides` and `/tools` sections instead.

## Follow-up
If a future universal cross-type search page is built, it should call
`searchCatalogue` with an explicit type list (or a new method) rather than
relying on the "no type filter" default, which is deliberately scoped to
templates+bundles and not intended to mean "everything."
