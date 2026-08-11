# 0029 — Product Idea Generator: the third Tier 2 family, and the first to lead the chain

## Status
Accepted

## Context
Spec v4 §37.1's Tier 2 order continues with **Product Idea Generator** (rank 9, priority score
88, spec §37's table), described as "Guide + idea capture template + guided generator."
Decision `0028`'s own Follow-up section names it explicitly as the next family once Pricing
Your Product shipped. Spec v4 (`docs/Incytemplates-website-spec-v4.md`) supersedes v3 for this
build but retains its product model unchanged — v4's substantive addition is a Phase-6 admin
content-editor/visibility system, which stays deferred per the same reasoning `0013` already
applied to accounts and commerce. "Build v4" for this pass means: keep shipping families in
spec §37.1's order, using v4 as the spec of record.

No v2-era material covers idea generation, the same situation as most non-first families. The
source posts are *My 5 step idea generating process* (`99841789`), *Ten ideas per day*
(`126453081`) and *How I generate app ideas* (`40732234`), all confirmed present in the local
`ABitGamey` export.

## Decisions

**Journey stage: `idea` — the first family to occupy it.** All eight previously-shipped
families use `validate`/`decide`/`build`/`design`/`launch`/`improve`; none use `idea`, not even
Product Idea Assessor (`validate`). This is the same "first family to occupy an empty stage"
move `0027` made for `improve`.

**`next_step_framework_slug: "product-idea-assessor"` — leads the chain rather than extending
its tail.** Every prior Tier 2 family (`0027`, `0028`) chained onto the previously-terminal
family and became the new terminal point. This family breaks that pattern deliberately: spec
§3.2's journey sequence is `IDEA → VALIDATE → DECIDE → …`, and `idea` precedes `validate`, so
Product Idea Generator belongs at the *front* of the existing founder-journey chain, handing
off to Product Idea Assessor, not appended after Pricing Your Product. Pricing Your Product is
untouched and remains the chain's terminal family — nothing currently points forward from it,
and this family doesn't change that. The Next Step Finder's `not_sure` fallback stays pointed
at Product Idea Assessor unchanged; it's documented as "the flagship starting point," and nine
families in doesn't change that framing.

**Tool mechanic — the first free-text generator, not another scorer.** Every prior Tool (8/8)
is multiple-choice-only: fixed-option questions in, a scored/classified verdict out. That shape
can't produce a genuinely personal idea direction — two of the three source methods (scratch
your own itch, address a niche) are meaningless without the visitor's own specifics. The Idea
Direction Generator (`src/lib/tools/product-idea-generator/`) adds three optional short
free-text inputs (one per idea-sourcing method from *How I generate app ideas*) alongside one
required select (daily-practice commitment). Still fully deterministic and consistent with
`0016` — the visitor's text is only ever interpolated into one of three fixed template strings
per method, never sent anywhere or interpreted by any model. `richness()` (trimmed word count)
is the scoring proxy for "which answer is worth starting from," the same fixed-lookup-table
spirit as every other Tool's scoring, and `METHOD_ORDER` breaks richness ties deterministically
— the same fixed-iteration-order tie-break shape used since Pricing Your Product's
`MODEL_ORDER`/`DIMENSION_ORDER`. The Tool-runner's `Step` type becomes a discriminated union
(`kind: "text" | "select"`) to support this — the first Tool whose step UI isn't 100% radio
groups.

**Template stays AI-agent-ready, matching universal precedent, not the exception first
assumed.** Every Tier 1/Tier 2 family template (`Decision Worksheet`, `Name Scorecard`,
`First 10 Customers Plan`, `PMF Signal Tracker`, `Pricing Model Comparison Worksheet`, etc.) is
`(Markdown, AI-agent-ready)` — confirmed by checking every `display_name` in
`content/seed/catalogue.ts`. An early draft of this plan assumed a recurring log like Idea
Capture Log should skip the badge (by analogy to the older, pre-family "Weekly Founder Review"
template), but PMF Signal Tracker — also a recurring log — carries the badge, so Idea Capture
Log does too, for consistency with every other family's template rather than the one v2-era
outlier.

**Category reuses `product-strategy`** (Product Idea Assessor's own category) — no new
taxonomy needed, same "reuse existing rows" approach every prior family has taken.

**`flagship: false`, `status: "published"` outright** — the Tier 2 precedent from `0027`/`0028`
holds.

**Wired into the Next Step Finder**: a new `generate_ideas` outcome added to `outcomeSchema`
and mapped to `product-idea-generator` in `OUTCOME_FRAMEWORK_SLUG`. No finder UI copy changed —
the outcome-question options are generated dynamically from framework data.

## Build note
A `next build` run mid-way through this change produced a build-time `404` for
`/products/product-idea-generator` despite the framework data being correct (verified directly
against `content/seed/catalogue.ts` with `tsx`) — a stale incremental Turbopack build-cache
artifact, not a real bug. `rm -rf .next` and a clean rebuild resolved it. Unrelated: the full
e2e suite surfaced two pre-existing `color-contrast` axe violations on the catalogue/product
pagination "Previous" control (`src/components/catalogue/pagination.tsx`, last touched in the
original catalogue build, commit `0cb48c7`, long before this family) — not introduced by this
change, not fixed by it either; worth its own pass.

## Follow-up
The next Tier 2 family in spec §37.1's order is **Business Model Chooser** (rank 10).
