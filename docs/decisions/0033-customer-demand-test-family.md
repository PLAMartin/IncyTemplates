# 0033 — Customer Demand Test: the seventh Tier 2 family, revisiting the scoring-matrix mechanic

## Status
Accepted

## Context
Spec v4 §37.1's Tier 2 order continues with **Customer Demand Test** (rank 13, priority score
85, spec §37's table), described as "Guide + experiment planner + test selector." Decision
`0032`'s Follow-up section names it explicitly as the next family once Product Positioning
Builder shipped. Spec §37's representative source posts (*Before building it, test if anyone
wants it*, *Questions to test product ideas*) overlap with posts already used by Product Idea
Assessor and Customer Discovery Kit — the same kind of overlap risk `0031` flagged for Decision
Framework Picker.

## Decisions

**Distinct territory from Product Idea Assessor and Customer Discovery Kit, found by reading
past the shared source posts.** *Before building it, test if anyone wants it* (`163505114`) is
almost entirely about **pretotyping** — a topic neither Product Idea Assessor (evidence-quality
classification and scoring) nor Customer Discovery Kit (interview technique) touches. The post
names four specific, comparable techniques for testing real demand through behaviour rather
than opinion: **Fake Door Test** (landing page with a Buy Now/Sign Up button), **Wizard of Oz**
(a real service, fulfilled manually behind the scenes), **YouTube MVP** (a demo video, tracked
by views/shares/signups) and **The Infiltrator** (listing the idea inside an existing
marketplace). *Questions to test product ideas* — already the source for Product Idea Assessor
and Customer Discovery Kit — is referenced only lightly in this family's Guide, not used to
drive its Tool.

**Tool mechanic — reverts to the named-candidate scoring matrix, because this source material
actually supports it.** Product Positioning Builder (`0032`) broke from that mechanic because
its source material didn't contain comparable named candidates; this family's source material
does — the post itself lists exactly four techniques, no invention required. Four dimensions
(`explainability`, `manualFulfilment`, `existingPlatform`, `reachNeeded`), ranked, with a
runner-up and deciding factor, no gate. Each candidate's reachable, non-dominated winning
combination was verified by direct calculation (`npx tsx -e ...`) before writing
`tests/unit/customer-demand-test-scoring.test.ts` — Wizard of Oz's winning case in particular
ties with The Infiltrator at the dimension-total level (5 vs 5) and depends on the fixed
`TEST_ORDER` tie-break (`fake_door_test`, `wizard_of_oz`, `youtube_mvp`, `the_infiltrator`, the
source post's own listed order), so that specific combination is the one used for both the
"first option every step" e2e test and its matching unit test.

**`next_step_framework_slug: "better-decision-maker"` — a third instance of the "branch into an
existing target" pattern** (`0030`, `0032`): a real demand signal, positive or negative, is
exactly the kind of evidence Better Decision Maker helps you act on. Customer Discovery Kit
already points there too — a "next step" link is many-to-one, the same as Pricing Your Product
now has two incoming branches (Product/Market Fit Tracker, Business Model Chooser).

**Journey stage: `validate` (reused, third occupant alongside Product Idea Assessor and
Customer Discovery Kit) — the most natural fit yet, since demand testing is definitionally
validation work. Category: `customer-research`** (reused from Customer Discovery Kit).

**`flagship: false`, `status: "published"` outright** — the Tier 2 precedent holds.

**Wired into the Next Step Finder**: a new `test_demand` outcome added to `outcomeSchema` and
mapped to `customer-demand-test` in `OUTCOME_FRAMEWORK_SLUG`. No finder UI copy changed — the
outcome-question options are generated dynamically from framework data.

## Follow-up
The next and final Tier 2 family in spec §37.1's order is **Product Prioritisation Tool**
(rank 14). Once it ships, Tier 2 is complete and any further family work moves into spec
§37.1's Tier 3 ("broaden only after demand evidence") — worth confirming with the product owner
before defaulting to rank-order continuation past that point.
