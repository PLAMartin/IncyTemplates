# 0032 — Product Positioning Builder: the sixth Tier 2 family, and the first Tool without a scoring mechanic

## Status
Accepted

## Context
Spec v4 §37.1's Tier 2 order continues with **Product Positioning Builder** (rank 12, priority
score 86, spec §37's table), described as "Guide + positioning one-pager + statement builder."
Decision `0031`'s Follow-up section names it explicitly as the next family once Decision
Framework Picker shipped. The primary source posts are *How to stand out in a crowded market*
(`147793195`) and *How to build a brand that makes money* (`149464236`), both confirmed present
in the local `ABitGamey` export.

## Decisions

**No named-candidate scoring matrix — the third consecutive Tier 2 Tool mechanic to be
reconsidered against its own source material rather than defaulting to the last one used.**
Pricing Your Product and Business Model Chooser both scored four named candidates against
weighted dimensions; Decision Framework Picker reused that shape a third time. This family's
source material doesn't support the same treatment: *How to build a brand that makes money*
gives one formula (pair an action with a product to reach a desired outcome, tied to what the
customer admires), not a set of comparable named candidates, and *How to stand out in a crowded
market*'s five cut-through tactics (scary, strange, sexy, free gifts, familiar) aren't
mutually-scored alternatives either — nothing in the source ranks them against each other by
weighted dimensions. Forcing either into a scoring-matrix shape would mean inventing structure
the source material doesn't actually contain, which spec §43.3 ("flag unsupported claims
instead of inventing evidence") and the project's source-fidelity principle both argue against.

**Tool mechanic — reuses Product Idea Generator's free-text interpolation (docs/decisions/0029)
for the statement, plus a direct one-to-one lookup for the tactic.** Three required and one
optional free-text field (`idealCustomer`, `desiredAction`, `desiredOutcome`,
`admiredIdentity`) are assembled into a positioning statement using the source post's own
action → product → outcome → admiration pairing — not a generic "for X who Y" marketing
template, which doesn't appear anywhere in the source material. `cutThroughApproach` is a
single required select mapped directly to one of the five tactics named in *How to stand out in
a crowded market* — a lookup, not a computed score, because there's nothing to weigh it
against. Unlike Product Idea Generator, three of the four text fields are **required**
(`z.string().trim().min(1)`, not a cross-field `.refine()`) since a positioning statement with a
missing customer, action or outcome isn't a partial result the way a idea-generator with only
one filled-in method is — it's just incomplete.

**Result layout leads with the assembled statement, not a recommended-candidate badge first** —
the headline output is the sentence itself; the tactic recommendation is presented as
supporting detail underneath, reflecting that this Tool builds something rather than picking
between named options.

**`next_step_framework_slug: "product-naming-system"` — a second branch into an existing
family, alongside MVP Scoper.** Positioning naturally precedes settling on a name that matches
it (you can't name something well until you know how you're positioning it), so this family
points forward into Product Naming System rather than either leading a new sub-chain or being
spliced into the middle of the existing one — the same "second, independent branch into an
existing target" pattern Business Model Chooser used for Pricing Your Product (`0030`).

**Journey stage: `design` (reused, second occupant alongside Product Naming System).**
**Category: `go-to-market`** (reused from First Customers Planner) — positioning is
quintessentially go-to-market work, a better fit than `product-strategy` or `business-planning`.

**`flagship: false`, `status: "published"` outright** — the Tier 2 precedent holds.

**Wired into the Next Step Finder**: a new `build_positioning` outcome added to
`outcomeSchema` and mapped to `product-positioning-builder` in `OUTCOME_FRAMEWORK_SLUG`. No
finder UI copy changed — the outcome-question options are generated dynamically from framework
data.

## Follow-up
The next Tier 2 family in spec §37.1's order is **Customer Demand Test** (rank 13).
