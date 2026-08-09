# 0025 — First Customers Planner completes all six flagship families

## Status
Accepted

## Context
Spec v3 §37.1 ranks First Customers Planner sixth and last in the Tier 1 flagship launch
order. §37's portfolio table proposes "Guide + First 10 Customers Plan + channel selector"
as its outputs, drawn from source posts on cold outreach and driving product demand.
Following [[0024-product-naming-system-family]]'s own follow-up note, the "is there
existing v2-era content to reuse" check was repeated first and came up empty, the same as
Better Decision Maker and Product Naming System — no existing guide or template covers
customer acquisition.

## Decisions

**All three outputs are new content**, same situation as
[[0022-better-decision-maker-family]] and [[0024-product-naming-system-family]]. The new
**First 10 Customers Plan** template (`content/seed/free-files/first-10-customers-plan.md`)
follows the same placeholder-template convention every other product uses.

**The Channel Selector Tool deliberately echoes Product Idea Assessor's shape as a closing
callback, not a coincidence.** `channelType` (cold outreach / content marketing /
communities and forums / existing network) plays the same role
`classification` played in Product Idea Assessor: it selects a per-dimension weight table
(`src/lib/tools/first-customers-planner/scoring.ts`'s `DIMENSION_WEIGHTS`), and the result
shape — a score, a strongest/weakest factor pair, a `biggestUncertainty`, and a `nextStep`
tied to the weakest factor — matches Product Idea Assessor's result fields almost exactly,
down to `src/components/tools/first-customers-planner/tool-result-summary.tsx` sharing its
single-score-bar layout with `ToolResultSummary` rather than any of the two-subject Tools'
layouts. This is the first tool in the series to reuse an earlier Tool's *shape*
deliberately, appropriate now that the pattern has proven itself across five different
mechanics (classification-weighted, bias-capped, reversibility-tiebreak, fakeability-gated,
availability-disqualified) — closing the loop rather than inventing a sixth one for its own
sake. The one genuinely new mechanic here is `effortToStart` being scored *inverted* (a
low-effort channel contributes more, not less), which none of the five earlier Tools needed.

**`tests/e2e/product-families.spec.ts`'s two draft-teaser tests are retired, not
reassigned.** Every earlier ADR in this sequence swapped the draft-teaser example to the
next remaining draft flagship family. This time there isn't one — First Customers Planner
was the last draft flagship family, so publishing it leaves zero draft frameworks in the
seed data at all. Forcing a synthetic draft framework into the fixtures purely to keep two
tests green would test fixture data invented for the test's sake rather than anything the
product actually does. The retired tests' comment in the spec file documents this and
points at the still-live code paths (`it_frameworks_teasers`, the teaser-fallback branch in
`src/app/(marketing)/products/[slug]/page.tsx`) so they're easy to re-add once a future
framework is genuinely seeded as draft. A new test was added instead for First Customers
Planner's own published page, explicitly asserting **no** "Next step" section renders —
its `next_step_framework_slug` is `null`, being the last family in the chain, and that's
worth asserting directly rather than leaving as an implicit gap in coverage.

## Follow-up
All six families from spec §5.2's first-release scope are now complete, closing out
spec §45's recommended first milestone in full. Further work moves to spec §5.3's Phase 1.1
enhancements (Next Step Finder, save-for-later, related-product recommendations, nurture
sequences) or spec §5.4/§45's Phase 5 commerce work (Stripe checkout, customer
accounts/library, admin CRUD) — see the README's "Current milestone" section for what's
explicitly still out of scope.
