# 0027 — Product/Market Fit Tracker: the first Tier 2 family, closing the Improve-stage gap

## Status
Accepted

## Context
Spec v3 §37.1 splits the ranked 25-product portfolio into "Tier 1 — flagship" (the six
families [[0021-customer-discovery-kit-family]] through
[[0025-first-customers-planner-family]] cover) and "Tier 2 — next," with **Product/Market
Fit Tracker** listed first in Tier 2 (rank 6, priority score 91, spec §37's table) —
immediately after First Customers Planner in the launch order. Independently, the six Tier 1
families' journey stages (validate, validate, decide, build, design, launch) leave
**Improve**, the seventh and final stage in the public journey (spec §7.1/§8.1), with zero
family coverage. Both signals point at the same family, so it's the natural next build after
the Next Step Finder ([[0026-next-step-finder]]).

## Decisions

**All three outputs are new content**, the same situation as three of the five prior
non-first families ([[0022-better-decision-maker-family]],
[[0024-product-naming-system-family]], [[0025-first-customers-planner-family]]) — no v2-era
material covers product-market fit measurement.

**Chains onto First Customers Planner, continuing the founder journey rather than treating
Improve as a separate track.** First Customers Planner's `next_step_framework_slug` (`null`
since 0025, when it was still the terminal family) now points at
`product-market-fit-tracker`; its priority_rationale's "natural close of the founder journey"
clause and its Guide's closing paragraph (which claimed the loop was closed) are both updated
to hand off forward instead — the same pattern every other chained family's Guide already
uses (e.g. Product Naming System's guide already ends "the next step is finding the people
who'll actually use it"). Product/Market Fit Tracker becomes the new terminal family
(`next_step_framework_slug: null`); `tests/e2e/product-families.spec.ts`'s "no next step"
test moved from First Customers Planner to this family, and First Customers Planner picked up
the "links on to its next step" assertion shape every other chained family already has.

**`flagship: false`.** All six Tier 1 families are seeded `flagship: true`; this is
deliberately `false` to accurately reflect spec §37.1's own Tier 1/Tier 2 split. The field's
only runtime effect (`src/server/queries/fixture-source.ts`) is showing a *draft* framework
as a public "Coming soon" teaser — irrelevant here since this framework ships as
`status: "published"` outright, so setting it accurately costs nothing.

**Tool mechanic — a new combination of two existing non-additive rules, not a new mechanic
from scratch.** Every prior Tool contributes its own rule on top of a weighted-sum score
(Product Idea Assessor's classification-weighted table, Customer Discovery Kit's bias cap,
Better Decision Maker's reversibility tiebreak, MVP Scoper's fakeability *downgrade* gate,
Product Naming System's availability *disqualification* gate, First Customers Planner's
inverted-effort dimension plus strongest/weakest reporting). Product/Market Fit Tracker's
`disappointmentSignal` — the Sean Ellis "how would you feel if this disappeared" proxy, given
the heaviest weight (0.35) of five rating dimensions — is **both** the highest-weighted input
**and** a hard disqualification gate: a `"low"` reading forces `fit: "no_fit"` regardless of
how well retention, organic growth, referral and paying intent score, because none of those
secondary signals substitute for genuine disappointment — that's the definitional core of
product-market fit, not one more number to average in. No earlier family combined a hard gate
with First-Customers-Planner-style strongest/weakest reporting; the result summary component
echoes that combination visually too, crossing MVP Scoper's gate-badge treatment with First
Customers Planner's strongest/weakest `<dl>` layout.

**Journey stage and category reuse existing taxonomy** — `stageRef("improve")` and
`catRef("founder-management")` — no new Stage or Category rows were needed, matching every
prior family's approach of reusing existing rows where they fit.

**Wired into the Next Step Finder**, per [[0026-next-step-finder]]'s own follow-up note
anticipating this exact moment ("When a seventh framework is added... add its slug to
`OUTCOME_FRAMEWORK_SLUG`"): a new `check_fit` outcome was added to `outcomeSchema` and mapped
to `product-market-fit-tracker` in `OUTCOME_FRAMEWORK_SLUG`. No finder UI copy needed
changing — the outcome-question options are generated dynamically from framework data.

## Follow-up
The next Tier 2 family in spec §37.1's order is **Pricing Your Product** (rank 8). When it
ships, First Customers Planner's `flagship` framing is fully settled precedent — Tier 2
families are `flagship: false`, `status: "published"` outright (no draft-teaser step). Revisit
whether `flagship` should instead track "currently promoted on the homepage" once enough
Tier 2 families exist that not all of them can be surfaced there at once.
