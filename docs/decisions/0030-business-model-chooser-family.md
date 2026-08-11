# 0030 — Business Model Chooser: the fourth Tier 2 family, a second branch onto Pricing Your Product

## Status
Accepted

## Context
Spec v4 §37.1's Tier 2 order continues with **Business Model Chooser** (rank 10, priority
score 87, spec §37's table), described as "Guide + comparison canvas + model chooser."
Decision `0029`'s Follow-up section names it explicitly as the next family once Product Idea
Generator shipped. The primary source post is *Choosing our business model* (`108220696`),
confirmed present in the local `ABitGamey` export — a comprehensive single post covering eight
named business models with definitions, examples and key metrics for each.

## Decisions

**Four candidates, not eight.** The source post frames "top 3" business models — SaaS,
Marketplace, Transactional — plus five "other business models" (Subscription, Usage-based,
E-commerce, Enterprise, Advertising). Several of the "other" models (Subscription, Usage-based,
E-commerce) are really pricing mechanics, not structural business models, and overlap directly
with ground Pricing Your Product already covers (`one_time`/`flat_subscription`/`usage_based`/
`tiered_subscription`). To keep this family's boundary distinct from Pricing Your Product's and
keep the Tool's scoring table tractable, the candidate set is the post's own "top 3" plus
**Advertising** — the most structurally distinct of the "other" models (the payer isn't the end
user at all) and a genuinely common choice founders weigh. Enterprise, Subscription,
Usage-based and E-commerce remain in the Guide as colour but aren't scored candidates.

**Tool mechanic — reuses Pricing Your Product's named-candidate scoring matrix, without a
gate.** Four models scored across four dimensions (`audienceStructure`, `payer`,
`valueDeliveryPattern`, `growthLever`), ranked, with a runner-up and deciding factor —
deliberately the same mechanic as Pricing Your Product (`0028`) rather than a new one, since it
fits just as well here and adds no new pattern to test/maintain. Unlike Pricing Your Product,
there's **no disqualification gate**: nothing in this domain is a hard categorical exclusion the
way a one-off purchase ruled out every subscription model — every combination here is a matter
of degree. Each candidate's reachable winning combination was verified by direct calculation
before writing `tests/unit/business-model-chooser-scoring.test.ts` (the lesson from `0028`: a
scoring table needs each candidate to have a genuine winning case, not just point contributions
that always lose to another candidate).

**`next_step_framework_slug: "pricing-your-product"` — a second, independent branch into the
same target, not inserted into the middle of the existing chain.** Choosing the structural
business model logically precedes choosing the pricing mechanic within it, so this family points
forward to Pricing Your Product. Product/Market Fit Tracker already points at Pricing Your
Product too — a "next step" link is many-to-one, not exclusive, the same way the `launch` stage
already serves both First Customers Planner and Pricing Your Product (`0028`). Splicing this
family into the middle of the existing nine-family chain (e.g. between Product Idea Assessor and
Customer Discovery Kit) was considered and rejected: it would require editing multiple
already-shipped, already-tested families' `next_step_framework_slug` fields and their e2e
assertions for a placement that's arguable either way, for no real benefit — the same
conservative, low-blast-radius reasoning `0029` used to justify leading into the chain instead
of extending it, applied here to justify branching into it instead of splicing through it.

**Journey stage: `decide` (reused).** Choosing a business model is a strategic decision, the
same character as Better Decision Maker's stage; stages aren't exclusive to one family
(precedent: `launch` already serves two families). **Category: `business-planning`** (reused
from Pricing Your Product) — the closest existing fit for the commercial side of the business.

**`flagship: false`, `status: "published"` outright** — the Tier 2 precedent holds.

**Wired into the Next Step Finder**: a new `choose_business_model` outcome added to
`outcomeSchema` and mapped to `business-model-chooser` in `OUTCOME_FRAMEWORK_SLUG`. No finder UI
copy changed — the outcome-question options are generated dynamically from framework data.

## Follow-up
The next Tier 2 family in spec §37.1's order is **Decision Framework Picker** (rank 11).
