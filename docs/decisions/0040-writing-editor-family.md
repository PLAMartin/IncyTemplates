# 0040 — Writing Editor: the sixth Tier 3 family, and the checklist mechanic inverted

## Status
Accepted

## Context
The user asked for **Writing Editor** (rank 20, priority score 78) by name, the sixth Tier 3
family explicitly requested rather than defaulted into. Spec §37's representative source for
this rank is "Writing-rules, storytelling and presenting posts" — broader than any prior rank's
citation, so the local `ABitGamey` export needed checking directly rather than assuming a single
obvious post.

Two published posts fit the spec's own mechanic description ("Guide + self-edit checklist +
structured editing review") cleanly and without overlap with any prior family's source material
(checked by grepping every existing decision doc for both posts' ids):

- *Six writing rules George Orwell taught* (`165691393`) — five checkable, concrete rules about
  the prose itself (clichéd figures of speech, inflated vocabulary, unnecessary words, passive
  voice, jargon), each with the post's own before/after example, plus a sixth meta-rule ("break
  any of these sooner than say anything outright barbarous") that isn't a checkable property of
  a draft.
- *Three self editing tips* (`156673527`) — Austin Kleon's three-step process for how to review
  your own work (give it time, print it out, read aloud), not what to check for.

Rejected: *Eight writing tips* (`140628359`, David Ogilvy) — a good checklist, but its "sleep on
it, read the next morning aloud" tip duplicates Kleon's almost exactly, which would put
redundant advice inside one family. *Ten tips to present powerfully* (`148827919`) — about live
spoken delivery (voice, body language), not written self-editing; too tangential to the named
mechanic. *Five step storytelling framework* (`175061952`) is already Story Builder's (`0037`)
sole source — reusing it here risks the exact redundancy `0031`/`0033`/`0038` each explicitly
steered around.

## Decisions

**The spec's two named artifacts map onto the Guide/Template/Tool triplet literally, rather than
both living inside the Tool.** The Guide explains both Kleon's process and Orwell's rules
together. The Template (`self-edit-checklist`, free download) *is* the spec's "self-edit
checklist" — a printable pre-publish checklist combining Kleon's three steps and Orwell's five
rules. The Tool is the spec's "structured editing review": Orwell's five rules only, checked
interactively.

**Tool mechanic — the second use of the completeness-checklist mechanic (Story Builder, `0037`),
inverted.** Story Builder checks presence of five *required* parts against the visitor's own
free text; this Tool checks presence of five *undesired* problems against five required yes/no
answers ("does your draft currently do this?"). Flagged = still needs fixing; clean = already
good — the inverse of Story Builder's presence-is-good shape, so an all-clean result is the best
outcome here rather than the worst. The result reports every rule's state, a fix tip with the
post's own before/after example for the *first* flagged rule (in Orwell's own listed order,
mirroring Story Builder's "gaps filled in the order the framework itself is taught"), and a
closing note surfacing Orwell's sixth, non-checkable rule (don't be dogmatic about the other
five). No score or verdict banding — consistent with Story Builder's precedent of reporting
state rather than ranking it. A gated decision tree (Meeting Reset's shape, `0039`) doesn't fit:
none of Orwell's rules override or cancel another, so there's no priority order to encode.

**Journey stage: `improve` (fourth occupant, alongside Product/Market Fit Tracker, User
Engagement Designer, Meeting Reset).** Editing is inherently a revision activity applied to an
existing draft, not a from-scratch design activity — closer to Meeting Reset's "recurring
practice to revisit" framing than to Story Builder's `design`-stage "how you present yourself"
cluster.

**Category: `founder-management` (fourth occupant, alongside Product/Market Fit Tracker,
Decision Framework Picker, Meeting Reset)** — a founder personal-craft/communication-skill tool,
the same cluster as meeting management and decision-making frameworks.

**`next_step_framework_slug: null`** — the same precedent as Decision Framework Picker, Product
Prioritisation Tool, User Engagement Designer, and Meeting Reset: writing well is useful
everywhere else in the catalogue, but there's no single causal next family it leads into. It's a
recurring practice to revisit for every piece of writing, not a one-time step.

**`flagship: false`, `status: "published"` outright**, consistent with every Tier 2/3 family.

**Wired into the Next Step Finder**: a new `sharpen_writing` outcome added to `outcomeSchema` and
mapped to `writing-editor` in `OUTCOME_FRAMEWORK_SLUG`. No finder UI copy changed — the
outcome-question options are generated dynamically from framework data.

## Follow-up
Tier 3 continues on explicit per-family request only. The next family should be named by the
user, not assumed from rank order (App Design Review is rank 21).
