# 0035 — Lateral Thinking Toolkit: the first Tier 3 family, and the first Tool with no ranking

## Status
Accepted

## Context
Spec v4 §37.1's Tier 2 (ranks 7–14) completed with Product Prioritisation Tool (`0034`). Tier 3
(ranks 15–25) is explicitly scoped in the spec as "broaden only after demand evidence," not an
automatic continuation the way Tier 2 followed on from Tier 1 — so `0034`'s own Follow-up
flagged that starting Tier 3 needed the user's explicit direction rather than a default "what's
next" continuation. The user asked for **Lateral Thinking Toolkit** (rank 15, priority score 83)
by name, satisfying that check. Spec §37's representative source posts are *Five lateral
thinking techniques*, *Three ways to unlock creativity* and *Show me your bad ideas*, all
confirmed present in the local `ABitGamey` export and untouched by any prior family.

## Decisions

**Tool mechanic — no ranking, no recommended winner, the first Tool to depart from that shape
entirely.** Every prior Tool (14/14) rewards picking one option: a scored/classified verdict, an
assembled statement, or a direct-lookup recommendation. Doing that here — ranking a handful of
lateral-thinking prompts against each other and presenting one as "best" — would directly
contradict the source material's own explicit lesson (*Show me your bad ideas*: the pottery
class that made thirty pots beat the class that spent the month perfecting one; quantity has to
come before judgement). The Lateral Thinking Prompt Generator (`src/lib/tools/lateral-thinking-toolkit/`)
takes one free-text input and always returns all five prompts together, unranked, in the source
post's own listed order, with a closing encouragement not to judge them yet. `generateLateralThinkingPrompts`
(the file is still named `scoring.ts` for consistency with every other Tool's module layout,
even though nothing is actually scored) is a pure interpolation function — five fixed templates,
one per technique, with the visitor's own words dropped in — the same "no AI, deterministic
template" approach as Product Idea Generator (`0029`) and Product Positioning Builder (`0032`),
just without the richness comparison or lookup those Tools used to pick a "winner."

**Five techniques, combining both source posts, deliberately excluding "Thinking Hats."**
*Five lateral thinking techniques* lists Perceptual change, Random input, Provocation, Po
(Potential Opening) and Thinking hats. Thinking hats is excluded outright — Six Thinking Hats is
already the core mechanic of Decision Framework Picker (`0031`), and reusing it here would be
the exact redundancy that decision's own reasoning warned against. Po is folded into
Provocation rather than kept separate — both are explicitly "what if / why not" assumption
challenges in the source post's own framing, and keeping them distinct would be a difference of
labelling, not substance. Specificity and Scale come from *Three ways to unlock creativity*;
its third technique, Surprise, is left out to keep the deck at a clean five rather than seven,
matching every other Tool's typical 4–5 question/output count.

**A single required free-text input, not a multi-step wizard.** Every prior multi-step Tool
asks 3–5 questions to narrow down a recommendation; this Tool only needs to know what problem
the visitor is stuck on before it can apply all five techniques to it, so the UI is a single
text field followed directly by the result — no `Back`/`Continue` navigation, matching spec's
own "minimum useful complexity" principle rather than padding out steps to match precedent for
its own sake.

**`next_step_framework_slug: "product-idea-assessor"` — a second entry point alongside Product
Idea Generator**, since both families exist to help a founder land on a direction worth
pursuing before assessing it; the "many families can point at one target" pattern is now used a
fourth time (`0030`, `0032`, `0033`).

**Journey stage: `idea` (reused, second occupant alongside Product Idea Generator). Category:
`product-strategy`** (reused, matching Product Idea Generator's own pairing).

**`flagship: false`, `status: "published"` outright** — the same precedent every Tier 2 family
used, carried into Tier 3 unchanged.

**Wired into the Next Step Finder**: a new `unblock_thinking` outcome added to `outcomeSchema`
and mapped to `lateral-thinking-toolkit` in `OUTCOME_FRAMEWORK_SLUG`. No finder UI copy
changed — the outcome-question options are generated dynamically from framework data.

## Follow-up
This is the first Tier 3 family. Spec §37.1 still frames the rest of Tier 3 (ranks 16–25) as
"broaden only after demand evidence" — the next family should be named by the user again rather
than assumed from rank order, the same check `0034` raised before this one shipped.
