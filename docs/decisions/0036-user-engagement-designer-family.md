# 0036 — User Engagement Designer: the second Tier 3 family, and the first to score for the weakest link

## Status
Accepted

## Context
The user asked for **User Engagement Designer** (rank 16, priority score 82) by name, the
second Tier 3 family to be explicitly requested rather than defaulted into (following the same
check `0035` raised for Lateral Thinking Toolkit). Spec §37's representative source posts —
*How to trigger users to act*, *Hooking users*, *Help app users see value quickly* — are all
confirmed present in the local `ABitGamey` export and untouched by any prior family.

## Decisions

**Tool mechanic — inverts the named-candidate scoring matrix: find the weakest, not the
strongest.** Every prior scoring Tool (Pricing Your Product, Business Model Chooser, Decision
Framework Picker, Customer Demand Test, Product Prioritisation Tool) scores several candidates
against *shared* dimensions and surfaces the highest scorer. This family's source material —
Nir Eyal's Hook Model (`Hooking users`) — is structurally different: it names four *sequential*
stages every product already has (Trigger, Action, Reward, Investment), not alternative options
to choose between. The Engagement Loop Mapper (`src/lib/tools/user-engagement-designer/`) scores
each stage from its own single, non-overlapping question (no dimension feeds more than one
stage, unlike every prior scoring Tool's cross-cutting dimensions) and reports the **lowest**-scoring
stage — the one worth fixing first, following the real Hook Model diagnostic practice of
identifying and strengthening the weakest link rather than polishing what already works. Because
no dimension crosses stages, there's no "deciding factor" field the way prior Tools have one —
each stage's score already fully explains itself; the runner-up slot is relabelled "also worth
strengthening" instead of "runner-up," since there's no competition being resolved, just a
second-lowest score. Verified all four stages are independently reachable as the diagnosed
weakest link, and that a full four-way tie resolves toward the earliest stage in the funnel
(`STAGE_ORDER`), by direct calculation before writing
`tests/unit/user-engagement-designer-scoring.test.ts`.

**Guide also covers the Bowling Alley Framework** (`Help app users see value quickly`) — a
related but distinct concern (getting a *new* user to their first payoff quickly, via a
straight-line onboarding path and product/conversational "bumpers") rather than the ongoing
habit-loop the Tool diagnoses. Kept in the Guide as complementary material rather than forced
into the Tool's scoring, since it doesn't map onto the four Hook Model stages cleanly.

**`next_step_framework_slug: null` — the third deliberately-terminal family**, the same
reasoning Decision Framework Picker (`0031`) and Product Prioritisation Tool (`0034`) used:
diagnosing your engagement loop is something to revisit as the product changes, not a one-time
step with a causal next family.

**Journey stage: `improve` (reused, second occupant alongside Product/Market Fit Tracker).**
**Category: `product-development`** (reused from MVP Scoper) rather than PMF Tracker's
`founder-management` — this is genuinely product-design work (trigger/onboarding/reward
mechanics), not a founder operating practice, so category follows topic rather than
stage-sibling consistency for its own sake.

**`flagship: false`, `status: "published"` outright** — the same precedent carried from Tier 2
into Tier 3.

**Wired into the Next Step Finder**: a new `design_engagement` outcome added to
`outcomeSchema` and mapped to `user-engagement-designer` in `OUTCOME_FRAMEWORK_SLUG`. No finder
UI copy changed — the outcome-question options are generated dynamically from framework data.

## Follow-up
Tier 3 continues on explicit per-family request only (spec §37.1's "broaden only after demand
evidence"). The next family should be named by the user, not assumed from rank order (Story
Builder is rank 17).
