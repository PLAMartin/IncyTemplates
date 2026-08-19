# 0063 — v9 Phase 2: Core Collection content coherence pass (in progress)

## Status
In progress — content/rendering work and quality/accessibility verification both complete and
live-verified; not yet committed. Covers spec v9 §40 Phase 2's coherence requirements for the
five Core Collection families' Guides, Templates and Tool pages, plus two public-rendering gaps
this pass found and fixed (Template editorial content had no rendering path at all; no Tool page
showed a next-step CTA anywhere). Visual/preview coherence and analytics are genuinely later-phase
scope — see Follow-up.

## Context
Phase 1 (`0062`) made the five Core Collection families (Product Idea Assessor, Customer
Discovery Kit, Customer Demand Test, MVP Scoper, First Customers Planner) the only public
content on the site. Phase 2 is the coherence pass spec §38.6 requires before that curation is
trustworthy: consistent terminology across each family's Guide/Template/Tool, no dead ends, a
real worked example, no placeholder language.

A research pass across all 15 pieces of content (5 families × Guide/Template/Tool) before any
edit surfaced four real problems, none caused by this session:

1. **Four of five Guides had stale "next step" prose** naming the pre-v9 flagship chain target
   (Better Decision Maker / Product Naming System) instead of the real v9 Core Collection order
   set in `0062`. Product Idea Assessor's Guide didn't name a next step at all.
2. **No worked example existed anywhere consistently** — every Template's "Completed example"
   file (where one existed at all) was a different one-off fictional scenario, and two core
   Templates had no example at all.
3. **Template "Editorial content" (instructions/required-inputs/what's-included/example/
   interpretation/CTA — the v8 §10.11.4 admin fields) was never actually authored for any of the
   6 core Templates.** `it_products.current_content_revision_id` was null for all 6.
4. **A deeper gap found only by checking, not assumed**: even if that content had been authored,
   the public Template page had no code path to read or render it at all — `Product` (the
   query-layer type) had no field for it, and `getProductBySlug` never selected
   `it_product_content_revisions`. The entire v8 Template editorial content feature was wired
   into the admin editor but never connected to what a visitor actually sees.

## What was built

**Worked example: "Shift Swap".** User chose a fictional case over a real Incyworks one (after
briefly considering IncyTemplates itself and an undocumented "Daily View" product — both dropped
for lack of real detail to write from honestly). Shift Swap is a shared, notified shift-cover
board for retail/hospitality teams, replacing informal group-text swap requests. One consistent
narrative — a founder (Priya) assessing it as an Improve idea, running real discovery
interviews, a Fake Door Test, an honestly-scoped MVP, and a warm-lead-first customer plan — runs
through all 5 Guides, all 6 Templates' completed examples, and the 5 core Tools' new "Worked
example" page sections.

**Guides** (`content/guides/*.mdx`): all 5 core guides fixed to reference the real v9 next-step
chain (`product-idea-assessor → customer-discovery-kit → customer-demand-test → mvp-scoper →
first-customers-planner → [terminal]`), each gaining a "Worked example: Shift Swap" section and
an explicit "Next step" closing section. First Customers Planner's closing section frames the
5-step arc as complete and mentions Product/Market Fit Tracker as optional further reading
without presenting it as the mandatory next Core Collection step (it's now non-core/unlisted).

**Template editorial content** (`scripts/v9-phase2-template-content.ts`, run live): authored and
published real instructions/required-inputs/what's-included/completed-example/interpretation/CTA
copy for all 6 core Templates via the existing `it_upsert_content_draft`/
`it_publish_content_revision` RPCs — the same mechanism `src/server/admin/editorial-content.ts`
uses, inlined for the same `import "server-only"`-in-a-plain-script reason
`v9-launch-visibility-review.ts` already documents. Not a one-off throwaway — kept as a real
script since re-running it (e.g. after a further copy revision) is a legitimate future action,
matching this repo's `scripts/seed-*.ts` convention.

**Public Template rendering** (the gap found in point 4 above, fixed so the authored content is
actually visible):
- `types/catalogue.ts`: new `TemplateContent` type, `Product.templateContent?: TemplateContent |
  null` — optional so no fixture literal needed updating (fixtures don't model this content at
  all, same "not modelled, only one real source" reasoning already used for
  `public_visibility` in `FixtureCatalogueSource`'s header comment).
- `supabase-source.ts`: `PRODUCT_SELECT` now embeds
  `content_revision:it_product_content_revisions!current_content_revision_id ( content_data )`
  (same embed shape `GUIDE_SELECT` already uses and has proven live); `mapProduct` extracts
  `content_data.template` into `TemplateContent` for `product_type: "template"` rows only.
- `templates/[slug]/page.tsx`: new Instructions / What you'll need / Interpreting your result /
  CTA-note sections, and the existing What's-included/Completed-example sections now prefer the
  real published content over the old "a file called X is included" placeholder note (falling
  back to the old note when no `templateContent` exists, so non-core templates are unaffected).
  Markdown fields render via `next-mdx-remote/rsc`'s `MDXRemote`, reusing the Guide page's
  `guide-prose` CSS class rather than inventing a new one.
- `tools/[toolKey]/page.tsx`: a static, non-admin-editable `TOOL_WORKED_EXAMPLES` map adds the
  "Worked example" section spec §10.6 requires for a Tool page, for the 5 core tool_keys only.
  Deliberately not part of any Tool's `copySchema` — this is the fixed cross-family
  illustration, not routine per-tool editorial copy.

**A second rendering gap found the same way (checking, not assuming) and fixed**: no Tool page
anywhere had any link to a next family. `ToolResultSummary` (the shared client result component,
used by only 2 of 26 Tools — the other 24, including 4 of the 5 core Tools, have their own inline
result rendering with no shared next-step slot) has no next-step concept, and neither did the
server page around it. Fixed at the page level rather than per-Tool-runner: `tools/[toolKey]/
page.tsx` now fetches the framework's `next_step_framework_slug` (same `getFrameworkById` +
`getFrameworkTeasers` pattern the family page already uses) and renders the same `FrameworkCard`
"Next step" section, unconditionally (not gated on Tool completion, matching how Guide/Template
pages already show their next-step section statically rather than only after some interaction).
Chosen over threading a `nextStep` prop through every Tool Runner component — `TOOL_RUNNERS` is
typed as `Record<string, ComponentType<{ copy?: Record<string, string> }>>` shared across all 26
Tools with materially different internal structures; broadening that shared prop type risked
fragile assignability issues for marginal benefit, whereas the page already had every piece of
data needed and the same page-level pattern already used for Worked example. First Customers
Planner correctly shows no Next step section (terminal, `next_step_framework_slug: null` since
`0062`'s re-chain).

## Verification
`typecheck`/`lint`/`test` (530 tests, unchanged — this pass added content and a query-layer
field, no new logic needing unit coverage) all clean. Zero-credential `npm run build` with
`.env.local` moved aside still clean — the new `templateContent`/`MDXRemote` code paths handle
`undefined` (the fixture-source case) without crashing static generation.

Live-verified via a dev server pointed at the live project: all 6 Template pages render
Instructions/What-you'll-need/Completed-example/Interpreting-your-result with "Shift Swap" named
consistently (confirmed via `curl` grep across all 6, then a full-page screenshot of one); all 5
core Tool pages render both the Worked example section and a real "Next step" `FrameworkCard`
(screenshot-verified for Product Idea Assessor → Customer Discovery Kit); First Customers
Planner correctly shows no Next step section; a non-core Tool (`better-decision-maker`)
correctly renders no Worked example section — confirming both conditionals don't leak into
non-core pages. Re-ran the full `product-families.spec.ts` (28 tests), `catalogue-browse.spec.ts`
(2 tests), and all 5 core Tools' e2e specs (15 tests, including their existing keyboard-only and
mobile-viewport coverage) against the live-backed dev server after these changes — all pass
(one `catalogue-browse.spec.ts` failure was the same known cold-Turbopack-compile flake already
documented for `0062`, reran clean). `typecheck`/`lint`/`test` (530 unit tests) and a
zero-credential `npm run build` all stayed clean throughout. One cosmetic Next.js dev-overlay
"1 issue" badge investigated and confirmed unrelated — a known, environment-specific
`eval()`-blocked-by-CSP React dev-mode console message, present on every page in this sandboxed
dev environment, not caused by or specific to this change.

## Tool result-screen interpretation quality (checked, not changed)
Read all 5 core Tools' `scoring.ts` in full against §38.4's "useful interpretation, not generic
filler" bar. All five hold up well — genuinely deterministic, non-generic logic in every case:
Product Idea Assessor and First Customers Planner both use per-classification/per-channel-type
weighted dimension scoring with a named strongest/weakest factor, a specific uncertainty
sentence and a specific next action tied to the weakest factor; Customer Discovery Kit adds a
bias-risk cap that overrides the weighted score entirely when questions were leading (not just
one more averaged input); Customer Demand Test and MVP Scoper use named-candidate/gated logic
with real per-outcome rationale and next-step text, not templated filler. Spot-checked that the
UI actually surfaces this text prominently for both the shared `ToolResultSummary` component
(Product Idea Assessor) and a Tool with its own dedicated result component (MVP Scoper) — same
accessible pattern (focus management, `aria-label` progress bar, dt/dd result breakdown) either
way. No changes were needed here; this item is done, not deferred.

## Accessibility verification (checked, not changed)
Re-ran the existing `tests/e2e/accessibility.spec.ts` axe suite (11 tests: homepage, catalogue,
a product page, a guide page, the product family page, and the Tool's start/in-progress/result
states) against the live-backed dev server after this pass's Template/Tool page changes — all
pass with no serious/critical violations, including the product page (now rendering the new
MDXRemote instructions/example content) and the Tool result state. Combined with the 15 core
Tool e2e tests' existing keyboard-only and mobile-viewport coverage (also re-verified this pass),
this closes the accessibility/mobile portion of §38.6's "Editorial finish" checklist for the 5
core families. A full manual screen-reader pass was not done (out of scope for this environment).

## Follow-up (Phase 2 scope, not done this pass)
- Analytics event coverage for the 5 families (spec §38.6's "Editorial finish" checklist item) —
  genuinely Phase 5 ("progression/return analytics") scope per spec §40's own phase split; not
  attempted here.
- Visual/preview coherence across the 5 families as one set (spec §43.6) — only Product Idea
  Assessor has a published visual (per prior-session history); building/reviewing visuals for the
  other 4 is a distinct creative-design workflow (governed Visual Brief → generate/upload →
  approve, with real budget/provider implications per §12.7/§39.4) that needs explicit direction
  before starting, not a natural extension of a copy-coherence pass.
- The other 21 non-core families' Guides likely have the same stale-next-step-prose pattern where
  they pointed at now-unlisted targets — out of scope (non-core content coherence is explicitly
  Phase 2/3-for-core-only per `0062`), not audited or fixed.
