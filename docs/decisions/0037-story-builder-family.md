# 0037 — Story Builder: the third Tier 3 family, and the first completeness checker

## Status
Accepted

## Context
The user asked for **Story Builder** (rank 17, priority score 81) by name, the third Tier 3
family explicitly requested rather than defaulted into. Spec §37's representative source is
*Five step storytelling framework* (`175061952`), confirmed present in the local `ABitGamey`
export and untouched by any prior family.

## Decisions

**Tool mechanic — a completeness checker, the first Tool that neither scores, ranks,
diagnoses-the-weakest, nor assembles a single statement.** The source post's own five-part
"story spine" — Place, Action, Thought, Emotion (shown), Dialogue — isn't a set of alternatives
(the named-candidate matrix, `0028`), a fixed set of stages with one weak link worth finding
(`0036`), or a formula to interpolate free text into (`0029`, `0032`). It's a checklist every
scene needs all five parts of. The Story Structure Checker
(`src/lib/tools/story-builder/`) takes five optional free-text fields — one per spine element —
and reports which are present and which are missing, assembles a preview spine from whatever is
present, and gives a craft tip drawn from the source post's own per-element guidance for the
*first* missing element, filling gaps in the order the framework itself is taught. At least one
field is still required overall (the same object-level `.refine()` shape Product Idea Generator,
`0029`, uses), since checking an entirely blank submission has nothing to report.

**Journey stage: `design` (reused, third occupant alongside Product Naming System and Product
Positioning Builder)** — naming, positioning and now storytelling form a coherent "how you
present yourself" cluster at this stage. **Category: `go-to-market`** (reused from Product
Positioning Builder), the closest fit for communication/pitch craft.

**`next_step_framework_slug: "first-customers-planner"` — a second branch into an existing
target, alongside Product Naming System** (which already points there from the original Tier 1
chain). A working story is what you actually use to go find customers, so the causal link is
genuine, not manufactured — the same "many-to-one, not exclusive" pattern used four times before
(`0030`, `0032`, `0033`, `0035`).

**`flagship: false`, `status: "published"` outright** — the same precedent carried from Tier 2
into Tier 3.

**Wired into the Next Step Finder**: a new `build_story` outcome added to `outcomeSchema` and
mapped to `story-builder` in `OUTCOME_FRAMEWORK_SLUG`. No finder UI copy changed — the
outcome-question options are generated dynamically from framework data.

## Follow-up
Tier 3 continues on explicit per-family request only. The next family should be named by the
user, not assumed from rank order (Startup Launch Planner is rank 18).
