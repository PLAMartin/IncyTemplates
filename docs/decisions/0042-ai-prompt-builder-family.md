# 0042 — AI Prompt Builder: the eighth Tier 3 family, and a third free-text assembler

## Status
Accepted

## Context
The user asked for **AI Prompt Builder** (rank 22, priority score 76) by name, the eighth Tier 3
family explicitly requested rather than defaulted into. Both of spec §37's cited posts for this
rank are present in the local `ABitGamey` export, neither used by any of the 21 shipped families
(checked by grepping every existing decision doc for both posts' ids):

- *Ten tips to write prompts that make chatbots shine* (`163900952`) — ten prompting tips built
  around the **CARE framework** (Context, Action, Result, Example) as the core reusable
  structure, plus advice on iterating, giving feedback, and reusable prompt templates.
- *Let the chatbot ask the questions* (`182812760`) — a single, distinct technique: explain the
  problem, then instruct the chatbot to "ask me one question at a time, waiting for my answer in
  between," flipping the interaction so the chatbot draws out the visitor's own thinking instead
  of just answering.

## Decisions

**The spec's two named artifacts map onto the Guide/Template/Tool triplet the same way Writing
Editor's did (`0040`)**: the Guide explains both the CARE framework and the question-flip
technique together; the **Prompt Template** Template is a printable CARE worksheet plus the
first post's own three ready-made template patterns; the **Prompt Builder** Tool is the
interactive assembler.

**Tool mechanic — third use of the free-text interpolation mechanic (Product Idea Generator
`0029`, Product Positioning Builder `0032`), no scoring.** CARE's own structure — Context, Action
and Result required, Example optional ("if possible" per the source) — assembles directly into a
single prompt string, reusing Positioning Builder's exact mixed step-wizard shape (`text` steps
plus one `select` step in a single `STEPS` array). Unlike Positioning Builder, the select isn't a
lookup into a *recommendation*: whether to append the "ask me one question at a time" flip
instruction is a direct either/or the visitor chooses for themselves, not a judgement the Tool
makes on their behalf, so the result has no separate "recommended X" field the way `0032`
recommends a cut-through tactic — just the assembled prompt, a craft tip (drawn from the first
post's own "refine iteratively" and "give feedback" advice), and a next step.

**Journey stage: `improve` (sixth occupant, alongside Product/Market Fit Tracker, User
Engagement Designer, Meeting Reset, Writing Editor, App Design Review)** — writing good prompts
is a skill applied and refined repeatedly, not a one-time build step.

**Category: `founder-management` (fifth occupant, alongside Product/Market Fit Tracker,
Decision Framework Picker, Meeting Reset, Writing Editor)** — a founder personal-skill tool, the
same cluster as the other communication/thinking-craft families.

**`next_step_framework_slug: null`** — the same precedent as Decision Framework Picker, Product
Prioritisation Tool, User Engagement Designer, Meeting Reset, Writing Editor and App Design
Review: prompting is a skill applied everywhere in the catalogue, not a one-time step that leads
causally into one particular family.

**`flagship: false`, `status: "published"` outright**, consistent with every Tier 2/3 family.

**Wired into the Next Step Finder**: a new `craft_a_prompt` outcome added to `outcomeSchema` and
mapped to `ai-prompt-builder` in `OUTCOME_FRAMEWORK_SLUG`. No finder UI copy changed — the
outcome-question options are generated dynamically from framework data.

## Follow-up
Tier 3 continues on explicit per-family request only. The next family should be named by the
user, not assumed from rank order (AI Agent Designer is rank 23).
