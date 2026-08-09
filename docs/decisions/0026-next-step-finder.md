# 0026 — Next Step Finder: code-based rules, scoped to the six flagship families

## Status
Accepted

## Context
Spec v3 §22 defines the Next Step Finder ("what is the most useful thing for me to do
next?") as a Phase 1.1 enhancement (spec §5.3), the first piece of work taken up after all
six flagship families (spec §5.2) shipped. §22.4 requires "configurable rules/weights
stored as data and tested in code," explicitly rules out an LLM for deterministic routing,
and allows "optional session/result tables, renamed from `it_finder_*` if necessary." §22.2's
five example questions are explicitly "for example," not mandatory, and §22's own design
principle is that the final question "should not force users to know [Guide/Template/Tool]
labels if a better recommendation is clear."

## Decisions

**Three questions, not the spec's example five.** `outcome` (what do you need to do next)
collapses the spec's "what are you working on" and "which journey stage" questions into
one, since every outcome option maps directly to exactly one framework, each of which
already owns a single journey stage — asking both separately would be redundant with this
catalogue's actual shape. `progress` (how much work is already done) sets a default
Guide/Template/Tool guess; `outputPreference` (learn / structure it myself / interactive
result / no preference) can override that guess outright, satisfying §22's own "shouldn't
force users to know the labels" principle — a visitor with no preference just gets the
`progress`-based guess.

**Rules are typed constants in `src/lib/finder/rules.ts`, tested in
`tests/unit/finder-rules.test.ts` — not a database-driven rules table.** This mirrors every
Tool's own scoring-weight tables (e.g. Product Idea Assessor's `DIMENSION_WEIGHTS`), for the
same reason: there's no admin CRUD UI to manage database-stored rules through yet, and a
hand-edited rules table with no UI in front of it isn't meaningfully more "configurable"
than a reviewed, tested code file — it would just be harder to keep correct. `resolveNextStep`
is a pure function operating on a minimal `FinderFrameworkOption[]` projection (not the full
`Framework`/`ProductSummary` types), so its tests don't depend on fixture data shape at all.

**No `it_finder_sessions` / `it_finder_results` persistence.** The Finder runs entirely
client-side — `src/app/(marketing)/finder/page.tsx` fetches all published frameworks and
their outputs server-side once, passes them as props into `FinderRunner`, and
`resolveNextStep` runs synchronously in the browser with nothing sent to a server. This is
the same call [[0013-v3-framework-product-family-model]] made for `it_tool_runs`: no
accounts, no saved-run model exists yet, so a session/result table would have no consumer.
Revisit alongside `it_tool_runs` once Phase 3 (saved work) is scoped.

**Scoped to the six published flagship families only — not the wider v2-era template/bundle
catalogue.** `OUTCOME_FRAMEWORK_SLUG` is a fixed six-entry map; there's no general
"recommend any of the ~40 standalone templates" rules engine. Spec §22.3's "no more than one
bundle recommendation" is trivially satisfied by recommending zero. Building a
generic-catalogue recommendation engine (covering arbitrary categories, stages, formats and
bundle eligibility across the full legacy catalogue) is a materially larger undertaking than
routing among six framework families with known shapes, and nothing in spec §5.3's Phase 1.1
framing requires it — `/templates`, `/journey/*` and the existing filter bar remain the way
to browse that catalogue. The `not_sure` outcome and any outcome whose mapped framework is
unexpectedly unavailable fall back to Product Idea Assessor (the flagship entry point), not
to a generic catalogue browse.

**Route and placement.** `/finder` matches spec §7.1's sitemap exactly. It's not in the
primary header nav — spec §8.1's own recommended nav list doesn't include it either — but is
reachable from the footer's "Browse" group and a homepage prompt next to the journey-stage
grid ("Not sure which stage that is? Answer three quick questions...").

## Follow-up
When a seventh framework is added (spec §37.1 Tier 2 or beyond), add its slug to
`OUTCOME_FRAMEWORK_SLUG` and `outcomeForFrameworkSlug`'s reverse lookup — until then it
simply won't appear as a selectable outcome, which `tests/unit/finder-rules.test.ts` covers
as a defensive fallback path already. When accounts/saved-runs land (spec Phase 3), revisit
whether Finder results are worth persisting, following whatever pattern `it_tool_runs`
lands on.
