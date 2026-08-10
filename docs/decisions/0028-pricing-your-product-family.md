# 0028 — Pricing Your Product: the second Tier 2 family

## Status
Accepted

## Context
Spec v3 §37.1's Tier 2 order continues with **Pricing Your Product** (rank 8, priority score 89,
spec §37's table), described as "Guide + pricing comparison + scenario calculator." Decision
0027's own Follow-up section names it explicitly as the next family once Product/Market Fit
Tracker shipped. No existing v2-era content covers pricing, so — like Better Decision Maker,
Product Naming System, First Customers Planner and Product/Market Fit Tracker before it — all
three outputs are new content.

## Decisions

**Tool mechanic — pricing model recommender, not a numeric calculator.** Spec §37 calls this a
"scenario calculator," which could plausibly mean a numeric revenue calculator. Two numeric
alternatives (a tiered-structure builder, a revenue scenario comparator) were considered and
rejected in favour of matching every other Tool's shape: answer qualitative questions, get one
scored/classified recommendation. Lower risk, more consistent with the seven prior Tools, and the
qualitative inputs (does value scale with a countable unit, is use ongoing or one-off, who's the
buyer, how visible is competitor pricing) map cleanly onto real pricing-model choice without
requiring the visitor to already know their own numbers.

**Tool mechanic detail — a scoring matrix over four named candidates, not one score against
thresholds.** Every prior Tool scores a single subject against fixed thresholds or between two
options (Better Decision Maker). This is the first to score **four candidate pricing models**
against each other and recommend the highest scorer — a generalisation of Product Idea Assessor's
three-way classification table. It combines that with a **hard disqualification gate**
(`purchasePattern: "one_off"` removes every subscription model from consideration outright,
regardless of the other three answers — the same non-additive-rule shape as MVP Scoper's
fakeability gate, Product Naming System's availability gate and PMF Tracker's disappointment
gate, here applied to eliminate candidates rather than force a single verdict) and a
**runner-up + deciding-factor report** (First Customers Planner / PMF Tracker's strongest/weakest
pattern, applied to candidates instead of dimensions: the runner-up model plus the one input
dimension whose point gap most separated it from the winner).

An early version of the scoring table gave `usage_based` no dimension where it wasn't
dominated or tied-and-tiebroken-away by `tiered_subscription` — every point `usage_based` could
earn, `tiered_subscription` earned at least as much. Caught by writing the unit tests before
trusting the table: each candidate needed its own reachable winning case, not just its own point
contributions. The rebalanced table (`src/lib/tools/pricing-your-product/scoring.ts`) gives
`usage_based` a distinguishing edge from a clear value metric (+3 vs tiered's +1) and moves
`enterprise` to a `tiered_subscription`-only signal, so all four candidates — including the
gate-only `one_time` path — have a genuine winning input combination, verified in
`tests/unit/pricing-your-product-scoring.test.ts`.

**Chains onto Product/Market Fit Tracker, continuing the founder journey.** PMF Tracker's
`next_step_framework_slug` (`null` since 0027, when it was the terminal family) now points at
`pricing-your-product`; its guide's closing paragraph and `priority_rationale` were updated to
hand off forward, the same pattern 0027 applied to First Customers Planner. Pricing Your Product
becomes the new terminal family (`next_step_framework_slug: null`); the "no next step" /
"links onward" e2e assertions in `tests/e2e/product-families.spec.ts` moved accordingly.

**Journey stage reuses `launch`, category reuses `business-planning`.** Unlike PMF Tracker, there
was no uncovered journey stage to argue for — all seven stages already had at least one family.
`launch` fits: pricing is a go-to-market-readiness decision, the same stage First Customers
Planner already occupies (stages aren't exclusive to one family). `business-planning`
("Templates for planning the commercial side of the business") is the closest existing category
fit; no new Stage or Category row was needed.

**`flagship: false`, `status: "published"` outright — the Tier 2 precedent from 0027 holds.**

## Follow-up
The next Tier 2 family in spec §37.1's order is **Product Idea Generator** (rank 9).
