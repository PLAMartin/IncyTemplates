# 0015 — Journey stage remap: v2's 8 stages → v3's canonical 7

## Status
Accepted

## Context
The v2 build used 8 stages (find-a-problem, evaluate-an-idea,
understand-customers, define-the-product, test-demand, plan-the-mvp,
prepare-to-launch, review-and-improve). Spec v3 §7/§8/§14.6 specifies exactly
7: idea, validate, decide, design, build, launch, improve. Product-owner
direction: replace, don't keep both.

## Decision
`supabase/migrations/20260809160025_journey_stages_v3.sql` soft-deactivates
the 8 old rows (`is_active = false`) rather than deleting them —
`it_product_stages.stage_id` is `on delete restrict` and every seed product
still references one at migration time. A later cleanup migration can hard-
delete them once live data is confirmed remapped; not blocking this pass.

Every product's `stages` tag in `content/seed/catalogue.ts` was remapped by
straight slug mapping:

| Old | New |
|---|---|
| find-a-problem | idea |
| evaluate-an-idea | validate |
| understand-customers | validate |
| define-the-product | design |
| test-demand | validate (no seed products used this slug) |
| plan-the-mvp | build |
| prepare-to-launch | launch |
| review-and-improve | improve |

**One deliberate exception**: `proceed-revise-pause-decision` (in the Idea
Validation Pack bundle) keeps its own content in mind rather than following
the mechanical `evaluate-an-idea → validate` rule — its actual copy ("the
closing decision template: proceed, revise or pause, with reasoning
documented") is a decision output, not an evaluation input, so it moved to
`decide` instead. Commented inline at the point of the remap in
`content/seed/catalogue.ts`.

## Follow-up
If a live Supabase project's product data needs the same remap, the mapping
table above plus the same one exception should be applied there before the
old-stage cleanup migration runs.
