# 0060 — Rapid Learning Planner: the second family sourced from the Reuse Taxonomy workspace

## Status
Accepted

## Context
The user asked to build **Rapid Learning Planner**, the second of two fresh candidates surfaced
while reviewing the v7 Reuse Taxonomy's still-unreviewed source posts (`0057`'s Follow-up).
Source post: *The four step rapid learning framework* (`196881083`), confirmed present in the
local `ABitGamey` export and read in full before building anything — Tim Ferriss's DSSS
framework (Deconstruction, Selection, Sequencing, Stakes) for systematising rapid skill
acquisition, illustrated in the post by his own account of deconstructing Chinese kickboxing to
win a tournament with little prior experience.

## Decisions

**Tool mechanic — the sixth use of Story Builder's completeness-checklist mechanic (`0037`),
and the third built from optional free-text fields rather than yes/no self-assessment**
(alongside Story Builder and Negotiation Prep `0055`, unlike App Design Review `0041` and
Sticky Pitch Checker `0057`). DSSS's four steps are a plan being built for *one specific skill*
the visitor names themselves, not fixed properties of an existing artifact to judge — free text
fits the same way it did for Story Builder's spine elements and Negotiation Prep's tactics,
whereas Sticky Pitch Checker's ten factors were judgements about an existing pitch. Four
optional free-text fields (`deconstruction`, `selection`, `sequencing`, `stakes`), checked for
presence, with a tip for the first missing one drawn from the source post's own explanation of
that step, and a `planSummary` assembled from whatever's filled in — the same result shape as
Negotiation Prep's `prepSummary`, just with four fields instead of three.

**Journey stage: `improve` (reused). Category: `founder-management` (reused)** — the same
applied-skill cluster as Negotiation Prep, Writing Editor and AI Prompt Builder: a practice
revisited every time a new skill comes up, not a one-time build step.

**`next_step_framework_slug: null` — deliberately terminal**, the same reasoning as Negotiation
Prep, Writing Editor and AI Prompt Builder: learning a new skill fast is a recurring practice
applied to whatever's next, not a step with one particular causal follow-on family.

**`priority_score: 73`, `display_order: 27`** — no spec §37 rank exists for this family either
(the second, after Sticky Pitch Checker `0057`, built outside that original portfolio); the
score is set by comparison with peer Tier 3 families, `display_order` continues the sequence
past Sticky Pitch Checker's `26`.

**`flagship: false`, `status: "published"` outright**, consistent with every Tier 2/3 family.

**Wired into the Next Step Finder**: a new `learn_a_skill_fast` outcome added to
`outcomeSchema` and mapped to `rapid-learning-planner` in `OUTCOME_FRAMEWORK_SLUG`. No finder UI
copy changed — the outcome-question options are generated dynamically from framework data.

**The source post itself reviewed and linked** in the Reuse Taxonomy workspace (`primary_method`,
`{tool,template,guide}`) as part of the same pass, closing the loop the same way `0057`'s build
did for its own two source posts.

**Verified with a real screenshot against a local fixtures-backed dev server** (`.env.local`
moved aside, restored after): completed the 4-step wizard, confirmed the checklist result
renders correctly with tip, plan summary and "Same family" cards. One naming wrinkle caught by
the e2e test, not the app: "Rapid Learning Plan" (the Template's name) is a literal substring of
both "Rapid Learning Planner" (the Guide) and "Rapid Learning Plan Check" (the Tool) — the
family-page e2e assertion needed a negative-lookahead regex
(`/Rapid Learning Plan(?!ner| Check)/`) to target the Template's card specifically, since
`ProductCard` wraps a card's entire text content in one link with no way to match on title
alone. Seeded live (`supabase/seed.sql`, idempotent, confirmed 3 new `it_products` rows).
`npm run typecheck`/`lint`/`test` (514 tests, up from 501) and the new
`tests/e2e/rapid-learning-planner-tool.spec.ts` (4 tests) all pass, both against fixtures and
confirmed live.

## Follow-up
None outstanding for this family. Both fresh candidates identified in `0057`'s review pass are
now built — any further family needs a fresh round of source-post review (213 posts remain
unreviewed) or an explicit user pick, per the standing "Tier 3+ continues on explicit request
only" norm.
