# 0039 — Meeting Reset: the fifth Tier 3 family, and a return to the gated decision tree

## Status
Accepted

## Context
The user asked for **Meeting Reset** (rank 19, priority score 78) by name, the fifth Tier 3
family explicitly requested rather than defaulted into. Spec §37's representative source posts
for this rank are unique to it — no overlap with any already-shipped family's material, unlike
several prior Tier 3 picks.

## Decisions

**Tool mechanic — a gated decision tree, not a scoring matrix.** The source material's own
framing ("no clear purpose = no meeting," the star-vs-spaghetti interaction distinction) maps
directly onto priority-ordered gates rather than weighted dimensions: a vague purpose cancels
the meeting outright regardless of every other answer, a star interaction with no decision
needed becomes an async update, otherwise unnecessary attendees get cut, and only a meeting
that survives all three gates is kept as-is. This reuses MVP Scoper's original Tier-1 shape
(`0016`) rather than the named-candidate scoring matrix several recent families have used —
the sixth distinct Tool mechanic to reappear rather than the seventh distinct shape invented
for its own sake. Gate priority order was verified directly (`npx tsx -e ...`): a vague purpose
wins even when every other answer would otherwise favour keeping the meeting.

**Four verdicts, not a ranked list.** `cancel_it | replace_with_async_update |
cut_the_attendee_list | keep_as_meeting` — a single classification with rationale and next
step, matching the gated shape rather than a scored output. The result summary shows no
runner-up, consistent with the classification precedent set by MVP Scoper and Decision
Framework Picker.

**Journey stage: `improve` (reused, second occupant alongside Product/Market Fit Tracker).
Category: `founder-management`** (new reuse — first family other than a Tier 1 flagship to use
it since Tier 2 began).

**`next_step_framework_slug: null`** — a recurring practice with no one-time causal next step,
the same precedent as Decision Framework Picker, Product Prioritisation Tool, and User
Engagement Designer. Diagnosing whether a meeting is worth keeping is something to revisit for
every recurring meeting, not a step you take once and move past.

**`flagship: false`, `status: "published"` outright**, consistent with every Tier 2/3 family.

**Wired into the Next Step Finder**: a new `reset_meetings` outcome added to `outcomeSchema`
and mapped to `meeting-reset` in `OUTCOME_FRAMEWORK_SLUG`. No finder UI copy changed — the
outcome-question options are generated dynamically from framework data.

## Follow-up
Tier 3 continues on explicit per-family request only. The next family should be named by the
user, not assumed from rank order.
