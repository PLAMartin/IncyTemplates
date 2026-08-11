# 0038 — Startup Launch Planner: the fourth Tier 3 family, and the first sequenced plan

## Status
Accepted

## Context
The user asked for **Startup Launch Planner** (rank 18, priority score 80) by name, the fourth
Tier 3 family explicitly requested rather than defaulted into. Spec §37's representative
sources — *How to launch apps* and *Seven steps to drive product demand* — overlap with First
Customers Planner's own source material (spec rank 7), the same kind of overlap `0031` and
`0033` already worked through for other families.

## Decisions

**Distinct territory from First Customers Planner, found by reading past the shared source
post.** *How to launch apps* (`76680478`) is about the **launch moment** specifically — a
one-time, escalating rollout across a handful of named surfaces — not the **ongoing channel
fit** First Customers Planner's Tool already scores (which channel to keep using to find
customers, on a recurring basis). *Seven steps to drive product demand*, First Customers
Planner's own primary source, is referenced only lightly in this family's guide, not used to
drive its Tool.

**Four launch options, condensed from the source post's six.** The post lists soft launch page,
friends and family, network contacts and strangers, social media, online communities, and
press, framed as a rough escalation from lowest to highest exposure. "Network contacts and
strangers" is folded into "friends and family" (both are close, low-stakes-relative-to-going-
fully-public audiences in the post's own framing), and "social media" and "online communities"
are combined into one "community or social" candidate (both are broader-audience, moderate-
stakes surfaces) — the same kind of legitimate condensing Lateral Thinking Toolkit (`0035`) used
to fold Po into Provocation, keeping the candidate set at the established four rather than an
unwieldy six.

**Tool mechanic — reuses the named-candidate scoring matrix, but returns the full ranked
plan.** Four dimensions (`hasSomethingToShow`, `feedbackStakes`, `existingAudience`,
`newsworthiness`) score all four candidates, same as every scoring Tool since `0028`. What's
new: the result reports the complete ranked order of all four options as a sequenced plan,
not just a winner and runner-up — matching spec's literal "plan generator" naming while
reusing the proven, already-tested scoring mechanism rather than inventing a seventh distinct
shape for its own sake. Each candidate's reachable top-of-plan case was verified by direct
calculation (`npx tsx -e ...`) before writing
`tests/unit/startup-launch-planner-scoring.test.ts`.

**Journey stage: `launch` (reused, third occupant alongside First Customers Planner and
Pricing Your Product) — the most literal fit yet. Category: `go-to-market`** (reused from
First Customers Planner, Product Positioning Builder and Story Builder).

**`next_step_framework_slug: "first-customers-planner"` — a third branch into that family**,
alongside Product Naming System and Story Builder. Once you've launched, finding customers is
the immediate next question — a genuine causal link, not manufactured for pattern's sake.

**`flagship: false`, `status: "published"` outright** — the same precedent carried from Tier 2
into Tier 3.

**Wired into the Next Step Finder**: a new `plan_launch` outcome added to `outcomeSchema` and
mapped to `startup-launch-planner` in `OUTCOME_FRAMEWORK_SLUG`. No finder UI copy changed — the
outcome-question options are generated dynamically from framework data.

## Follow-up
Tier 3 continues on explicit per-family request only. The next family should be named by the
user, not assumed from rank order (Meeting Reset is rank 19).
