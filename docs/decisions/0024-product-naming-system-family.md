# 0024 — Product Naming System built entirely from new content

## Status
Accepted

## Context
Spec v3 §37.1 ranks Product Naming System fifth in the flagship launch order, right after
MVP Scoper. §37's portfolio table proposes "Guide + weighted Name Scorecard + name
comparison tool" as its outputs, drawn from source posts on naming apps/products, naming
criteria and process, and trademark considerations. Following
[[0023-mvp-scoper-family]]'s own follow-up note, the "is there existing v2-era content to
reuse" check was repeated first and came up empty — no existing guide or template covers
product naming.

## Decisions

**All three outputs are new content**, the same situation
[[0022-better-decision-maker-family]] was in: no existing guide, and no existing template
close enough to reassign (unlike [[0021-customer-discovery-kit-family]] and
[[0023-mvp-scoper-family]], where a reusable free template already existed). The new
**Name Scorecard** template (`content/seed/free-files/name-scorecard.md`) follows the same
placeholder-template convention every other product uses.

**The Name Comparator Tool compares two names, using a plain average rather than a weighted
formula, with availability as a hard disqualification gate rather than a soft cap.** Like
Better Decision Maker's Expected Value Comparator, this Tool takes two full sets of inputs
(`nameA*` / `nameB*`) and an 8-step wizard — but the scoring mechanic is deliberately
different at every level: the per-name score is `(memorability + clarity + distinctiveness) /
3` (a plain average, not Better Decision Maker's weighted-and-divided expected-value
formula or any earlier Tool's per-classification weights), and `availability` isn't folded
into that average at all — a name that's `taken_everywhere` is disqualified outright
(`nameAUsable`/`nameBUsable: false`), regardless of how well it scores on the other three
criteria. This is a *harder* gate than Better Decision Maker's reversibility tiebreak (which
only shapes guidance after a comparison) or Customer Discovery Kit's bias cap (which caps a
score but doesn't disqualify): here, an unusable name can never win the comparison, full
stop. `src/components/tools/product-naming-system/tool-result-summary.tsx` is consequently
its own component again, with a per-name "not usable" flag neither earlier two-subject
Tool's result shape has.

**`tests/e2e/product-families.spec.ts`'s draft-teaser example swapped from Product Naming
System to First Customers Planner** — the last remaining draft flagship family — for the
same reason each earlier ADR in this sequence made the same swap.

## Follow-up
First Customers Planner is the sixth and final flagship family in the Tier 1 launch order
(spec §37.1) — once it ships, all six families from spec §5.2's first-release scope are
complete, and the milestone moves on to Phase 1.1 enhancements or Phase 5 commerce work per
spec §5.3/§5.4. No existing v2-era guide or template obviously covers finding first
customers — worth checking again before assuming, but likely needs new content across the
board like Better Decision Maker and this family did.
