# 0016 — Product Idea Assessor Tool is fully deterministic, no AI layer

## Status
Accepted — deferred, not declined

## Context
Spec v3 §39.2 defines three Tool tiers (deterministic, AI-assisted, AI-led)
and prefers deterministic/AI-assisted designs. §39.3's Product Idea Assessor
example allows an optional AI layer to "summarise evidence and phrase
suggested experiments," clearly marked and never overriding the deterministic
score.

## Decision
This milestone builds the deterministic tier only
(`src/lib/tools/product-idea-assessor/scoring.ts`) — no AI service call, no
`ai_metadata` handling, no `TOOL_AI_SERVICE_UNAVAILABLE` error path. Every
number in the result comes from a fixed lookup table or a weighted sum,
runs synchronously client-side (the Tool runner
`src/components/tools/product-idea-assessor/tool-runner.tsx` calls
`getToolDefinition().run()` directly in the browser — the scoring module has
no secrets or DB access, safe to ship client-side), and is fully
unit-tested (`tests/unit/product-idea-assessor-scoring.test.ts`).

This also means **no Tool-run persistence exists** — nothing is sent to a
server at all, consistent with [[0013-v3-framework-product-family-model]]'s
decision not to build `it_tool_runs` this pass.

## Follow-up
An AI-assisted layer (evidence summarisation, suggested experiments) is
explicitly optional future work per spec §39.3, not required for MVP
acceptance. Should get its own privacy/data-handling review before being
added, per spec §39.2's requirements for any Tool that calls an external
model provider.
