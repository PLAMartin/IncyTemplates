# 0023 — MVP Scoper reuses its free template, writes a new guide and Tool

## Status
Accepted

## Context
Spec v3 §37.1 ranks MVP Scoper fourth in the flagship launch order, right after Better
Decision Maker. §37's portfolio table proposes "Guide + MVP Scope Canvas + keep/defer/remove
tool" as its outputs. Following [[0022-better-decision-maker-family]]'s own follow-up note,
the "is there existing v2-era content to reuse" check was repeated before writing anything
new, and this time it found a genuine match.

## Decisions

**Reused the existing free `mvp-scope-in-one-page` template, not the separate paid
`mvp-scope` template.** Two pre-existing templates cover MVP scoping: `mvp-scope-in-one-page`
(free, standalone, `outcome_statement`/`target_audience`/journey stage all matching this
framework almost verbatim) and `mvp-scope` (paid, part of the Product Definition Pack
bundle, a fuller scoping template with a cut-line exercise for teams past validation). Only
the former had its `framework_id` reassigned — the same "there are two similarly-named
templates, only the free standalone one is a real fit" judgment call
[[0022-better-decision-maker-family]] made for `proceed-revise-pause-decision`, just with
the opposite outcome (a match exists this time). `mvp-scope-in-one-page`'s own
`when_not_to_use` field already pointed at `mvp-scope` for teams past their first release,
which is exactly the boundary this reuse respects — nothing about that relationship needed
to change.

**No existing guide covered MVP scoping technique**, so `content/guides/mvp-scoper.mdx` is
new content, same situation as [[0022-better-decision-maker-family]] (a Template existed,
but no Guide did — the inverse of [[0021-customer-discovery-kit-family]], where a guide
existed but the Tool didn't reuse anything either).

**The Scope Decider Tool scores one candidate feature per run, using a "downgrade gate" for
fakeability rather than one more weighted input.** The score itself comes from necessity and
relevance to the user's riskiest open question, minus an effort penalty
(`src/lib/tools/mvp-scoper/scoring.ts`). Fakeability is checked afterwards: if the feature
could be delivered manually and the first-pass classification wasn't already "remove", it's
downgraded to "defer" regardless of how well it scored — the score number itself is
untouched, only the classification changes, which the result UI (`fakeableOverrideApplied`)
surfaces as a distinct badge rather than folding it into the score. This is the same shape
of decision each earlier Tool made about its own non-additive rule (Customer Discovery
Kit's bias cap, Better Decision Maker's reversibility tiebreak) — a new, purpose-built
mechanic each time, not a shared abstraction extracted across Tools this early.

**`tests/e2e/product-families.spec.ts`'s draft-teaser example swapped from MVP Scoper to
Product Naming System**, the next remaining draft flagship family in `display_order`, for
the same reason each earlier ADR in this sequence made the same swap.

## Follow-up
Product Naming System is next in the launch order (spec §37.1). No existing v2-era guide or
template obviously covers product naming — worth checking again before assuming, but this
family likely needs new content across the board, like Better Decision Maker did.
