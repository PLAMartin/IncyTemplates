# 0043 — AI Agent Designer: the ninth Tier 3 family, and a real next step again

## Status
Accepted

## Context
The user asked for **AI Agent Designer** (rank 23, priority score 75) by name, the ninth Tier 3
family explicitly requested rather than defaulted into. Spec §37's primary citation for this
rank — *How to design effective AI Agents* — is a single, complete post in the local
`ABitGamey` export, not used by any of the 22 shipped families (checked by grepping every
existing decision doc for its id):

- **`156050973.how-to-design-effective-ai-agents.html`** — distinguishes AI Workflows (fixed,
  predictable paths) from AI Agents (autonomous, adaptive), leads with a simplicity principle
  ("start with the simplest solution that works, add complexity only when necessary" —
  Anthropic), then names five design patterns for when an agent genuinely is warranted:
  Augmented LLM, Prompt Chaining, Routing System, Orchestrator-Worker, Evaluator-Optimiser.

The spec's secondary citation ("MCP/AI posts") points at two further posts (`168461961`,
`174965954`, both "Phil tries to understand MCP") — set aside: they explain the Model Context
Protocol, a tool-integration standard, a different and more technical topic than "which
architecture pattern fits this problem." Pulling them in would dilute a checklist that already
has a complete, self-contained source.

## Decisions

**Tool mechanic — a gated decision tree, the third instance of that shape (MVP Scoper's
score+gate `0016`, Meeting Reset's pure form `0039`).** Six required yes/no questions, always
asked in fixed order — every answer is collected before gate priority is applied in
`scoring.ts`, the same convention Meeting Reset established, rather than a dynamically-branching
UI nothing in this codebase has built yet. Gate 1 mirrors the source post's own leading advice
("resist the urge to implement agents when a deterministic script can do it"): if the task is
predictable and follows a fixed path, the verdict is `workflow_not_agent` outright, regardless
of every other answer. Otherwise, five further gates check — in order from most specific/
demanding need to most general fallback — self-critique (`evaluator_optimiser`), subtask
decomposition (`orchestrator_worker`), different-request-type handling (`routing_system`),
sequential multi-step reasoning (`prompt_chaining`), and finally external/current data as the
simplest agentic fallback (`augmented_llm`). Six verdicts total — more than any prior
single-verdict Tool, but verdict count already varies freely (Product/Market Fit Tracker has 2,
MVP Scoper 3, Meeting Reset 4). Result shape mirrors `meeting-reset/schema.ts` exactly:
`{verdict, rationale, nextStep}`.

**Journey stage: `build` (third occupant, alongside MVP Scoper and Product Prioritisation
Tool)** — this is a "what should I actually build" architecture decision, not a review/refine
activity, so it sits with `build` rather than the `improve` cluster the last five families all
landed in.

**Category: `product-development` (fourth occupant, alongside MVP Scoper, Product
Prioritisation Tool, App Design Review)** — the same "how you build the thing" cluster.

**`next_step_framework_slug: "mvp-scoper"`** — the first family since Better Decision Maker
(`0022`'s original Tier 1 chain) to point forward into MVP Scoper: a second, independent branch,
the same "many-to-one, not exclusive" precedent used repeatedly elsewhere (Product Naming System
has 2 incoming links, First Customers Planner has 3). Once you know which architecture pattern
fits, scoping the actual MVP build is a genuine causal next step — not every Tier 3 family needs
to be terminal, and unlike the last six shipped families this one has a real forward link rather
than being a recurring practice revisited in place.

**`flagship: false`, `status: "published"` outright**, consistent with every Tier 2/3 family.

**Wired into the Next Step Finder**: a new `design_an_agent` outcome added to `outcomeSchema`
and mapped to `ai-agent-designer` in `OUTCOME_FRAMEWORK_SLUG`. No finder UI copy changed — the
outcome-question options are generated dynamically from framework data.

## Follow-up
Tier 3 continues on explicit per-family request only. The next family should be named by the
user, not assumed from rank order (Negotiation Prep is rank 24).
