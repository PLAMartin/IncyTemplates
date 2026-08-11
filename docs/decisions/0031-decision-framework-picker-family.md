# 0031 — Decision Framework Picker: the fifth Tier 2 family, deliberately distinct from Better Decision Maker

## Status
Accepted

## Context
Spec v4 §37.1's Tier 2 order continues with **Decision Framework Picker** (rank 11, priority
score 86, spec §37's table), described as "Guide/reference + cheat sheet + framework picker."
Decision `0030`'s Follow-up section names it explicitly as the next family once Business Model
Chooser shipped. Spec §37's representative source posts are *Six thinking hats*, *Inversion:
How to think in reverse*, *Simple rules* and *Better decisions in 6 steps* — but three of those
four are already the named techniques Better Decision Maker's Decision Worksheet bundles into
one process ("classify it by reversibility, invert the question to find what would guarantee
failure, check it against your simple rules, and estimate expected value" — see
`content/seed/catalogue.ts`'s `decision-worksheet` product). Building this family from the same
three techniques risked shipping a redundant restatement of Better Decision Maker rather than a
genuinely separate family.

## Decisions

**Four candidates deliberately distinct from Better Decision Maker's four.** Reading further
into the source material (*Six thinking hats*, *How 3 tech titans make decisions*, *Razors I
use to simplify decisions*) surfaced techniques Better Decision Maker never touches: Six
Thinking Hats (not used by BDM at all), First Principles Thinking (Musk, from the tech-titans
post — BDM never reasons from first principles), Razors (a named "rule of thumb" concept from
its own dedicated post, distinct from Sull's "simple rules" business-prioritisation concept BDM
already cites), and the Boundary Rule (the 37%-rule/secretary-problem "when to stop searching"
heuristic from the *Simple rules* post's "boundary rules" subtype — a sequential-search shape
BDM never addresses, since BDM only ever compares exactly two named options). Reversibility,
inversion, simple-rules-as-personal-checklist and expected-value — BDM's actual four — are
deliberately excluded from this family's candidate set.

**Framing note added to the Guide's opening paragraph** making the split explicit: Better
Decision Maker is one process combining several techniques for a single consequential decision;
Decision Framework Picker is a reference for picking one standalone technique for whatever
differently-shaped decision is actually in front of you, day to day.

**Tool mechanic — reuses the named-candidate scoring matrix a third time.** Four frameworks
scored across four dimensions (`involvement`, `decisionShape`, `precedent`,
`timeWorthInvesting`), ranked, with a runner-up and deciding factor — the same mechanic as
Pricing Your Product (`0028`) and Business Model Chooser (`0030`), no gate (nothing here is a
hard categorical exclusion). Each candidate's reachable, non-dominated winning combination was
verified by direct calculation (`npx tsx -e ...` against the real scoring module) before
writing `tests/unit/decision-framework-picker-scoring.test.ts` — the Boundary Rule's ceiling
(5) is lower than the other three candidates' ceilings (7 each), so its winning combination was
checked with particular care to confirm it still beats every rival under its own best inputs
(5 vs 3/3/2), not just that it scores non-zero.

**`next_step_framework_slug: null` — no manufactured next step.** Unlike Business Model Chooser,
which has a genuine causal link forward to Pricing Your Product (choose the structure before
the pricing mechanic within it), picking a thinking framework doesn't causally lead to one
particular next family. Forcing a next-step link here to match the pattern every other Tier 2
family has set so far would be arbitrary. This family is legitimately terminal, the same way
Pricing Your Product is (`0028`) — a family can be a dead end in the founder-journey chain
without that being a defect.

**Journey stage: `decide` (reused, third occupant).** Category: **`founder-management`**
(reused from Weekly Founder Review) rather than `business-planning` (Pricing Your Product,
Business Model Chooser) — this is about how a founder thinks and operates generally, not the
commercial/planning side of the business specifically.

**`flagship: false`, `status: "published"` outright** — the Tier 2 precedent holds.

**Wired into the Next Step Finder**: a new `pick_a_decision_framework` outcome added to
`outcomeSchema` and mapped to `decision-framework-picker` in `OUTCOME_FRAMEWORK_SLUG`. No
finder UI copy changed — the outcome-question options are generated dynamically from framework
data.

## Follow-up
The next Tier 2 family in spec §37.1's order is **Product Positioning Builder** (rank 12).
