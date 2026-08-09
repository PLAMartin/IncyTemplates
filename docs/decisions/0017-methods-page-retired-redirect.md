# 0017 — `/methods/proven-better-new` retired via permanent redirect

## Status
Accepted

## Context
The v2 build had a static marketing page at `/methods/proven-better-new`
explaining the (now [[0019-copy-improve-differentiate-terminology|renamed]])
three-way idea classification. Spec v3 makes this content the natural seed
for the Product Idea Assessor family's Guide output.

## Decision
The page's prose was migrated into `content/guides/product-idea-assessor.mdx`
(not duplicated), the old page file
(`src/app/(marketing)/methods/proven-better-new/page.tsx`) was deleted, and
`next.config.ts` adds a permanent redirect:

```
/methods/proven-better-new -> /guides/product-idea-assessor
```

per spec §26.3's slug-redirect requirement — the old URL may already be
linked or indexed. The two known internal references to it
(`src/config/site.ts` footer nav, the homepage's former "Proven–Better–New
method" band) were updated to link to the new destination directly rather
than leaving an internal redirect hop.

## Follow-up
None — this is a completed, one-way migration. If a live Supabase project's
`it_redirects` table (spec §14.14, not used by this static
`next.config.ts` redirect) is ever wired up for admin-managed redirects,
this one could move there too, but the static redirect works today with no
dependency on that table existing.
