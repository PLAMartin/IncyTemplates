# 0034 — Product Prioritisation Tool: the eighth and final Tier 2 family

## Status
Accepted

## Context
Spec v4 §37.1's Tier 2 order concludes with **Product Prioritisation Tool** (rank 14, priority
score 84, spec §37's table), described as "Guide + weighted matrix + priority scorer." Decision
`0033`'s Follow-up section names it explicitly as the next family once Customer Demand Test
shipped. The primary source posts are *Four ways to prioritise tasks and optimise productivity*
(`157060546`) and *How to prioritise tasks* (`109994026`), both confirmed present in the local
`ABitGamey` export and untouched by any prior family.

## Decisions

**Tool mechanic — named-candidate scoring matrix**, matching the pattern this family's source
material genuinely supports (the same reasoning that led Customer Demand Test, `0033`, back to
it after Product Positioning Builder, `0032`, departed from it). *Four ways to prioritise
tasks* names exactly four comparable scheduling strategies itself: **Earliest Due Date**
(complete whichever task is due soonest — task length is irrelevant), **Moore's Algorithm**
(when not every deadline is achievable, drop the most time-consuming task to minimise the
*count* of overdue tasks), **Shortest Processing Time** (do the quickest task first, to clear
the list and build momentum) and **Weighted Processing Time** (rank by value divided by
duration — the strategy the source post's author says is their own default). Four dimensions
(`deadlines`, `everythingAchievable`, `valueVariation`, `whatWouldHelpMost`), ranked, with a
runner-up and deciding factor, no gate. Each candidate's reachable, non-dominated winning
combination was verified by direct calculation (`npx tsx -e ...`) before writing
`tests/unit/product-prioritisation-tool-scoring.test.ts` — Moore's Algorithm's margin over its
nearest rival is the thinnest of the four (5 vs 3, versus 6+ point margins for the others), so
its specific winning combination was checked with particular care.

**Template combines both source posts, not just the Tool's four candidates.** *How to
prioritise tasks* covers the Eisenhower importance/urgency 2×2 matrix (do first / schedule /
delegate / don't do) — a different, complementary lens the Tool's scoring doesn't use directly.
Rather than leave that material only in the Guide, the Weighted Priority Matrix template
sequences both: sort by importance/urgency first, then apply value-per-duration scoring to
what's left — giving the Template genuine depth from both posts rather than restating the
Guide.

**`next_step_framework_slug: null` — the second family to be deliberately, legitimately
terminal**, the same reasoning Decision Framework Picker used (`0031`): prioritising a task
list is a recurring operational practice a founder returns to repeatedly as the list changes,
not a one-time step that causally leads to one particular next family. Forcing a link here
would be arbitrary in the same way it would have been for Decision Framework Picker.

**Journey stage: `build` (reused, second occupant alongside MVP Scoper)** — a natural pairing:
MVP Scoper decides *what* to build, this family decides *in what order* to work on it.
**Category: `product-development`** (reused from MVP Scoper).

**`flagship: false`, `status: "published"` outright** — the Tier 2 precedent holds.

**Wired into the Next Step Finder**: a new `prioritise_tasks` outcome added to
`outcomeSchema` and mapped to `product-prioritisation-tool` in `OUTCOME_FRAMEWORK_SLUG`. No
finder UI copy changed — the outcome-question options are generated dynamically from framework
data.

**Naming note**: the framework itself is named "Product Prioritisation Tool" per spec — since
"Tool" is already part of the family name, the Tool *product's* own slug is `priority-scorer`
rather than the usual `{family-slug}-tool` convention (which would have produced the redundant
`product-prioritisation-tool-tool`). This is safe because routing for Tool-type products uses
`tool_key`, not `slug` (`src/components/catalogue/product-card.tsx`'s `productHref`) — the
product `slug` field is metadata/SEO only here, confirmed before deviating from the pattern.

## Follow-up
This closes spec §37.1's Tier 2 (ranks 7–14, all eight families now shipped:
Product/Market Fit Tracker, Pricing Your Product, Product Idea Generator, Business Model
Chooser, Decision Framework Picker, Product Positioning Builder, Customer Demand Test, Product
Prioritisation Tool). Spec §37.1 frames Tier 3 (ranks 15–25) as "broaden only after demand
evidence" — continuing family-by-family into Tier 3 by default, the way Tier 2 continued
automatically from Tier 1, is **not** the same kind of default call; it should be confirmed
with the product owner rather than assumed.
