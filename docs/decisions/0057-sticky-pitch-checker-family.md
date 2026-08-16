# 0057 — Sticky Pitch Checker: the first family sourced from the Reuse Taxonomy workspace

## Status
Accepted

## Context
The user asked to build **Sticky Pitch Checker**, one of two fresh-candidate pairs surfaced
while reviewing the v7 Reuse Taxonomy's still-unreviewed source posts (`0056`'s Follow-up). This
is the **first family in the whole build that didn't come from spec §37's original 25-item
portfolio** — every prior family (Tier 1 through Negotiation Prep, rank 24) traces back to that
table. This one was found the way v7's own stated purpose describes: reading real, unreviewed
posts in `/admin/source-posts` and recognising a genuinely uncovered, well-sourced topic.

Two companion source posts, both confirmed present in the local `ABitGamey` export and read in
full before building anything: *Making Our Ideas Sticky* (`61188977`, Chip and Dan Heath's
SUCCESs framework: Simple, Unexpected, Concrete, Credible, Emotional, Story) and *Making Our
Ideas Contagious* (`65897672`, Jonah Berger's STEPPS framework: Social Currency, Triggers,
Emotion, Public, Practical Value, Stories).

## Decisions

**Merged into one ten-factor checklist, not two twelve-factor families or one twelve-factor
family.** Reading both posts in full (not just their title/summary, the same "read past the
shared material" discipline Customer Demand Test `0033` and Startup Launch Planner `0038` used)
surfaced that the two posts **explicitly cross-reference each other on two factors**: STEPPS's
"Emotion" section says "*Making Our Ideas Sticky* explores ways to establish a personal
connection," and its "Stories" section says "*Making Our Ideas Sticky* suggests various forms
stories can take." SUCCESs's own Emotional and Story factors are those same ideas. Treating
STEPPS's Emotion/Stories as separate questions would ask the visitor the same thing twice under
different names. The merged set is SUCCESs's six factors (Simple, Unexpected, Concrete, Credible,
Emotional, Story) plus STEPPS's four *remaining* unique ones (Social Currency, Triggers, Public,
Practical Value) — ten total, matching App Design Review's precedent for checklist size rather
than an unwieldy twelve.

**Tool mechanic — the fifth use of Story Builder's completeness-checklist mechanic (`0037`), same
polarity as App Design Review (`0041`): presence is good, ten required yes/no self-assessment
answers, not free text** — these are judgements about an existing pitch, the same reasoning App
Design Review used for judgements about an existing product. Tip for the first missing factor, in
the order the two source frameworks are taught (SUCCESs first, then STEPPS's remaining four).

**Result groups factors into "Makes it stick" / "Makes it spread," not one flat list** — the
first completeness-checklist Tool to do this, since (unlike App Design Review's ten Rams
principles, all one framework) these ten factors genuinely come from two distinct named
frameworks. `stickCount`/`spreadCount` (out of 6/4) are reported alongside the per-factor list;
`group` is a display concern only, both groups score identically (presence = good, no weighting).

**Journey stage: `design` (fourth occupant, alongside Product Naming System, Product Positioning
Builder, Story Builder). Category: `go-to-market`** (reused from the same three) — this is
communication/pitch craft, the same cluster those three already occupy.

**`next_step_framework_slug: "first-customers-planner"` — a fourth branch into that family**,
alongside Product Naming System, Story Builder and Startup Launch Planner. Once a pitch sticks
and spreads, putting it in front of first customers is the genuine next step, the same "many
families can point at one target" pattern used repeatedly since `0030`.

**`priority_score: 74`, `display_order: 26`** — no spec §37 rank exists for this family since it
wasn't in the original portfolio; `26` continues the display sequence past Negotiation Prep (`24`)
without colliding with rank 25's reserved slot (Personal Leverage Assessment, still unbuilt). The
score is set by comparison with peer Tier 3 families rather than derived from a table.

**`flagship: false`, `status: "published"` outright**, consistent with every Tier 2/3 family.

**Wired into the Next Step Finder**: a new `make_it_stick` outcome added to `outcomeSchema` and
mapped to `sticky-pitch-checker` in `OUTCOME_FRAMEWORK_SLUG`. No finder UI copy changed — the
outcome-question options are generated dynamically from framework data.

**Verified with a real screenshot against a local fixtures-backed dev server** (`.env.local`
moved aside per the established technique — see `env-local-points-at-live-supabase` memory):
completed the 10-step wizard, confirmed the grouped Stick/Spread result renders correctly with
counts, tip, closing note and "Same family" cards. Also seeded live (`supabase/seed.sql` applied
via `supabase db query --linked -f`, idempotent, confirmed 3 new `it_products` rows under the new
framework). `npm run typecheck`/`lint`/`test` (501 tests) and the new
`tests/e2e/sticky-pitch-checker-tool.spec.ts` (4 tests, fixtures-backed) all pass.

## Follow-up
**A pre-existing, cross-family bug surfaced during verification, not introduced by this
change**: the family page's "Next step" section doesn't render against the *live* Supabase
project for this family — but the identical assertion also fails live for AI Agent Designer
(`0043`, long-shipped, definitely-correct data), and both pass cleanly against fixtures. This
matches the exact gap `project_build_order` memory already flagged after `0055` ("14 older
families' 'Next step' heading assertions fail... against the live DB") — still unroot-caused,
still out of scope for this decision, worth its own investigation (likely `next_step_framework_slug`
resolution drift between live DB rows and `content/seed/catalogue.ts`, or the live query path
never having been exercised cleanly before).

Tier 3+ continues on explicit per-family request only. The other fresh candidate found alongside
this one — *The four step rapid learning framework* (Tim Ferriss's DSSS) — and *5 features of our
fantastic business* (Millionaire Fastlane's Need/Entry/Control/Scale/Time) remain unbuilt,
available whenever the user wants to pick one.
