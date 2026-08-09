# 0019 — Classification renamed: Proven/Better/New → Copy/Improve/Differentiate

## Status
Accepted — product-owner directed

## Context
The Product Idea Assessor family (Guide, Template, Tool) was built around the
"Proven/Better/New" three-way idea classification, inherited from the v2
`/methods/proven-better-new` page (see
[[0017-methods-page-retired-redirect]]) and the pre-existing
`proven-better-new-assessment` template (see
[[0010-proven-better-new-duplicate-assumption]], a v2-era ADR describing an
earlier, now-superseded judgement call under the old name). Mid-implementation,
the product owner asked for the labels to be renamed to Copy/Improve/
Differentiate — same three categories, same underlying definitions and risk
ordering, new terminology.

## Decision
Renamed everywhere the three categories are named as a scheme, keeping the
category *definitions* unchanged (only the label changed):

- `proven` → `copy`, `better` → `improve`, `new` → `differentiate` in
  `src/lib/tools/product-idea-assessor/schema.ts`'s `classificationSchema`
  and every consumer (`scoring.ts`, `tool-runner.tsx`,
  `tool-result-summary.tsx`, both test files).
- `content/guides/product-idea-assessor.mdx` (title, headings, prose) and
  `content/guides/test-a-product-idea.mdx` (which independently explains the
  same classification).
- `content/seed/catalogue.ts`: the framework's `method_summary`/
  `outcome_statement`/`source_note`, the new Guide/Tool product rows' copy,
  and the pre-existing `proven-better-new-assessment` /
  `proven-better-new-assessment-pro` templates' display copy (name,
  descriptions, FAQ page, how-it-works page).
- `content/seed/free-files/proven-better-new-assessment.md` (placeholder
  template body).

**Slugs, product IDs, and filenames were deliberately left unchanged**
(`proven-better-new-assessment`, `proven-better-new-assessment-pro`, the
`.md` filename) — renaming those would break existing URLs for no benefit;
only display copy needed to change. `src/lib/tools/product-idea-assessor/`'s
directory name and `tool_key`/`PRODUCT_IDEA_ASSESSOR_TOOL_KEY` value
(`"product-idea-assessor"`) were also left unchanged — they name the
*family*, not the classification scheme.

## Follow-up
`docs/decisions/0010-proven-better-new-duplicate-assumption.md` is left
as-is: it's a dated historical record of a naming-era decision, not something
to silently rewrite. If any external copy (marketing, A Bit Gamey posts) still
refers to "Proven–Better–New," that's a separate, deliberate editorial
decision outside this codebase change.
