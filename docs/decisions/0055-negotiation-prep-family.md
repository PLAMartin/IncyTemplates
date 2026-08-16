# 0055 — Negotiation Prep: the tenth Tier 3 family

## Status
Accepted

## Context
The user asked for **Negotiation Prep** (rank 24, priority score 71) by name, the tenth Tier 3
family explicitly requested rather than defaulted into. Spec §37's citation is *Three Effective
Negotiation Tactics*, a single, complete post in the local `ABitGamey` export, not used by any of
the 23 shipped families (checked by grepping every existing decision doc for its id):

- Names three tactics worth preparing before a negotiation starts, not alternatives to choose
  between but complementary prep steps: **BATNA** (Best Alternative to a Negotiated Agreement —
  your fallback if no deal gets done, the source of real leverage), **Anchoring** (the first
  number or position on the table sets the tone the rest of the negotiation adjusts from), and
  **MESOs** (Multiple Equivalent Simultaneous Offers — two or three alternative offers, each
  acceptable but trading off differently, presented together to reveal what the other side
  actually values without asking directly).

## Decisions

**Tool mechanic — a completeness checklist, the fourth use of the shape Story Builder introduced
(`0037`), same polarity as Story Builder and App Design Review (presence = good), unlike Writing
Editor's inversion.** Three free-text fields (BATNA/Anchor/MESOs), checked for presence not
scored or ranked — the source material's own framing (three things to prepare, not candidates to
compare) doesn't support a scoring matrix. Result surfaces a tip for the first missing tactic, in
the source post's own listed order, the same "fill gaps in taught order" precedent Story Builder
and Writing Editor both set. Result shape: `{tactics, prepSummary, nextTip, nextStep}`.

**Journey stage: `improve` (seventh occupant)** and **category: `founder-management` (sixth
occupant)** — negotiating well is a recurring skill applied to a new situation each time, not a
one-time step in a build sequence, the same framing Meeting Reset (`0039`) and Writing Editor
(`0040`) used for their own domains.

**`next_step_framework_slug: null`** — eighth deliberately-terminal family (after `0031`, `0034`,
`0036`, `0039`, `0040`, `0041`, `0042`), for the same reason: there's no single causal next family
once a negotiation is prepped, just another negotiation eventually.

**`flagship: false`, `status: "published"` outright**, consistent with every Tier 2/3 family.

**Wired into the Next Step Finder**: a new `prepare_to_negotiate` outcome added to
`outcomeSchema` and mapped to `negotiation-prep` in `OUTCOME_FRAMEWORK_SLUG`. No finder UI copy
changed — the outcome-question options are generated dynamically from framework data.

## Follow-up
Built and unit/e2e-tested in a prior session but left uncommitted and unseeded until this one —
no functional gap, just process: this doc, the commit, and `npm run seed` were the three
remaining steps. Tier 3 continues on explicit per-family request only; the next family (Personal
Leverage Assessment, rank 25) should be named by the user, not assumed from rank order.
