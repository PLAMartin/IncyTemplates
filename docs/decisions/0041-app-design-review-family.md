# 0041 — App Design Review: the seventh Tier 3 family, and the checklist mechanic reused straight

## Status
Accepted

## Context
The user asked for **App Design Review** (rank 21, priority score 77) by name, the seventh
Tier 3 family explicitly requested rather than defaulted into. Spec §37's citation for this rank
— *Ten principles of good design*, plus a broader "game-design/app-design/psychology posts"
cluster — has an exact single-post match in the local `ABitGamey` export:

- **`166386351.ten-principles-of-good-design.html`** — Dieter Rams' ten design principles
  (Innovative, Useful, Aesthetic, Understandable, Unobtrusive, Honest, Long-lasting, Thorough,
  Environmentally friendly, As little design as possible), each with the post's own one-line
  definition, plus a worked example applying all ten to a real product. Not used by any of the
  20 shipped families (checked by grepping every existing decision doc for this post's id).

Unlike Meeting Reset (`0039`) and Writing Editor (`0040`), no second post was needed — Rams' own
material already supplies both a checklist and a worked self-assessment example in one place, a
complete fit for "Guide + design checklist + self-assessment" on its own. Other posts in the
spec's broader "game-design/app-design/psychology" cluster (*Five design laws informed by
psychology*, *Five more design principles informed by psychology*, *Four psychological decision
drivers*) were checked and set aside: the spec's own citation names the Rams post specifically,
and folding in a second post would dilute a checklist mechanic that already has a clean, single,
well-known source.

## Decisions

**Tool mechanic — third use of the completeness-checklist mechanic (Story Builder `0037`,
Writing Editor `0040`), non-inverted.** Reverts to Story Builder's original polarity: presence
of one of Rams' ten principles in the visitor's own product is good, the same direction as
Story Builder (unlike Writing Editor, which checked for absence of five problems). Ten required
yes/no answers, not optional free text — these are self-assessment judgements about an existing
product, not text the visitor is asked to type out, so the input shape borrows from Writing
Editor's forced-choice pattern rather than Story Builder's free-text one. The result reports
every principle's state, a tip for the *first* principle not yet met (in Rams' own listed order,
the same "gaps filled in the order the framework itself is taught" precedent as `0037`/`0040`),
and a closing note carrying Rams' own line on what design is fundamentally for ("indifference
towards people and the reality in which they live is the one and only cardinal sin in design"),
distinct from any single principle's own tip.

**UI — the same step-wizard as Meeting Reset (`0039`) and Writing Editor (`0040`), ten steps
instead of four or five.** A single-page, all-at-once checklist layout was considered (closer to
the literal word "checklist") but rejected: no existing Tool uses that layout, and reusing the
proven step-wizard shape — one question at a time, "Question X of 10," Back/Continue, the same
reducer pattern — is lower-risk and keeps the e2e test pattern consistent with every prior Tool.
The "before you start" copy sets expectations (ten quick yes/no questions, about 3–4 minutes) so
the length isn't a surprise partway through.

**Journey stage: `improve` (fifth occupant, alongside Product/Market Fit Tracker, User
Engagement Designer, Meeting Reset, Writing Editor).** Reviewing an existing design against
fixed principles is a revisit-on-every-release practice, not a from-scratch design activity —
closer to Writing Editor's framing than to Story Builder's/Product Positioning Builder's
`design`-stage "how you present yourself" cluster.

**Category: `product-development` (third occupant, alongside MVP Scoper and Product
Prioritisation Tool)** — this is about the quality of what's being built, not a founder
soft-skill (`founder-management`) or an external-communication concern (`go-to-market`).

**`next_step_framework_slug: null`** — the sixth deliberately-terminal family (after `0031`,
`0034`, `0036`, `0039`, `0040`): reviewing a design against fixed principles is revisited every
release, not a one-time step that leads causally into another family.

**`flagship: false`, `status: "published"` outright**, consistent with every Tier 2/3 family.

**Wired into the Next Step Finder**: a new `review_design` outcome added to `outcomeSchema` and
mapped to `app-design-review` in `OUTCOME_FRAMEWORK_SLUG`. No finder UI copy changed — the
outcome-question options are generated dynamically from framework data.

## Follow-up
Tier 3 continues on explicit per-family request only. The next family should be named by the
user, not assumed from rank order (AI Prompt Builder is rank 22).
