# 0022 — Better Decision Maker built entirely from new content

## Status
Accepted

## Context
Spec v3 §37.1 ranks Better Decision Maker third in the flagship launch order, right after
Customer Discovery Kit. §37's portfolio table proposes "Guide + Decision Worksheet +
expected-value tool" as its outputs, drawn from source posts on decision-making under
uncertainty (reversibility, inversion, simple rules, expected value). Following
[[0021-customer-discovery-kit-family]]'s own follow-up note, the same "is there existing
v2-era content to reuse" check was repeated before writing anything new.

## Decisions

**No existing content was reusable, unlike Customer Discovery Kit.** The repo's only
decision-shaped existing template, `proceed-revise-pause-decision`, is tightly coupled to
the Idea Validation Pack's own evidence trail (it pulls together the Copy/Improve/
Differentiate verdict, the assumption log and the evidence synthesis from *that specific
pack*) — reassigning it here would mismatch a general decision-making guide against a
template that only makes sense after finishing a different bundle, and it's `access_type:
"paid"` / `status: "unlisted"` (bundle-only), not a free standalone output like this
family's other Templates. So all three outputs — guide, Template and Tool — are new content
for this milestone, following the same placeholder conventions as every other product
(`is_placeholder: true`, the standard AI-agent-ready template section structure in
`content/seed/free-files/decision-worksheet.md`).

**The Expected Value Comparator Tool compares two options, not one subject.** Both earlier
Tools (Product Idea Assessor, Customer Discovery Kit) score a single subject against fixed
dimensions. This family's guide technique is explicitly comparative — "estimate expected
value for each option, then let reversibility break a close call" — so the Tool takes two
full sets of inputs (`optionA*` / `optionB*`, four questions each) rather than one, an
8-step wizard instead of 5. Expected value is `(likelihood x impact) / effort` per option,
computed independently of reversibility; reversibility only decides the *guidance* once both
numbers are in (see `src/lib/tools/better-decision-maker/scoring.ts`'s `nextStepFor`) — a
genuinely different mechanic from both earlier Tools' weighted-sum/capped-sum approaches,
not a reskin of either. `src/components/tools/better-decision-maker/tool-result-summary.tsx`
is consequently its own component again (two expected-value bars side by side, not one bar
plus named areas), following the same "each Tool's result shape gets its own summary
component" precedent [[0021-customer-discovery-kit-family]] established.

**`tests/e2e/product-families.spec.ts`'s draft-teaser example swapped from Better Decision
Maker to MVP Scoper**, the next remaining draft flagship family in `display_order`, for the
same reason [[0021-customer-discovery-kit-family]] swapped it from Customer Discovery Kit to
Better Decision Maker: the family the test names is no longer draft.

## Follow-up
MVP Scoper is next in the launch order (spec §37.1). Repeat the "existing content to reuse"
check again before writing anything new — this family's placeholder template
(`mvp-scope-in-one-page`) already exists and is worth checking for fit first.
