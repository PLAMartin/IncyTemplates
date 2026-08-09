# 0021 — Customer Discovery Kit built as the second full Guide/Template/Tool family

## Status
Accepted

## Context
Spec v3 §37.1 ranks Customer Discovery Kit second in the flagship launch order, right after
Product Idea Assessor, and §37's portfolio table proposes "Guide + Interview Planner/Evidence
Log + evidence analyser" as its outputs. [[0013-v3-framework-product-family-model]] shipped
this family as a draft, flagship-only teaser (per [[0014-draft-flagship-family-public-teasers]])
alongside the four other non-canonical flagship families. This milestone completes it,
following the same Guide/Template/Tool pattern Product Idea Assessor established.

## Decisions

**Reused two existing v2-era free templates as this family's Template outputs, instead of
writing new ones.** `customer-interview-planner` and `assumption-and-evidence-tracker`
(both pre-existing, published, free templates already part of the Idea Validation Pack
bundle) map directly onto spec §37's "Interview Planner/Evidence Log" description — the
former plans who to talk to and how to ask, the latter logs what's learned separately from
what's assumed. Both had their `framework_id` reassigned to
`framework-customer-discovery-kit`, the same "reassign an existing product to a new
framework" move [[0013-v3-framework-product-family-model]] used for
`proven-better-new-assessment`. Neither was removed from the Idea Validation Pack bundle —
a product can belong to both a framework and a bundle simultaneously; the `products/[slug]`
page already renders every product whose `product_type` and `framework_id` match under one
output-type column, so two Templates render side by side without any page change.

**Wrote a new guide (`content/guides/customer-discovery-kit.mdx`) rather than repurposing
the existing `run-a-customer-interview-that-changes-your-mind.mdx`.** The existing guide's
`slug` doesn't match the framework's slug, and renaming it would break its existing URL for
no benefit (the same reasoning [[0019-copy-improve-differentiate-terminology]] applied to
leaving `proven-better-new-assessment`'s slug alone). The new guide instead summarises the
plan → interview → log → know-when-to-stop cycle at framework-overview depth and links out
to the existing guide for the full interview-technique deep dive — the same
"framework-level guide plus an existing deeper guide left standalone" shape
`product-idea-assessor.mdx` / `test-a-product-idea.mdx` already established, just not
called out as a pattern until now.

**Evidence Analyser Tool is deterministic only, same as Product Idea Assessor**
([[0016-product-idea-assessor-tool-deterministic-only]] applies here too, unstated in that
ADR's title but the same reasoning holds — no AI call, runs entirely client-side, no
Tool-run persistence). Its scoring mechanic is deliberately not a copy of Product Idea
Assessor's per-classification weighted sum: `questionStyle` (how leading the interview
questions were) acts as a **cap** on the weighted score from the other four dimensions
rather than being averaged in with them, because leading questions genuinely invalidate the
rest of the evidence regardless of how strong it otherwise looks. This is reflected in the
result as a separate `biasRisk` field alongside the score, not folded into a single
readiness enum — `src/components/tools/customer-discovery-kit/tool-result-summary.tsx` is
consequently its own component (two badges, not one), not a reuse of Product Idea Assessor's
`ToolResultSummary`, which is concretely typed to its single-readiness-verdict result shape.

**`tests/e2e/product-families.spec.ts`'s draft-teaser example swapped from Customer
Discovery Kit to Better Decision Maker.** That spec asserted Customer Discovery Kit stayed a
"Coming soon" teaser — now false. Better Decision Maker is next in `display_order` among the
remaining four draft flagship families and needed no other changes to serve the same
assertions (draft, flagship, visible on `/products` and its own `/journey/decide`).

## Follow-up
Better Decision Maker is next in the launch order (spec §37.1). When it's built, the same
"is there existing v2-era template/guide content to reuse" check this ADR made is worth
repeating before writing anything new.
