# Incy Templates

Incy Templates is a practical product-development platform: reusable
frameworks/product families (e.g. Product Idea Assessor), each with up to
three complementary outputs — a Guide to learn how, a Template to do it
yourself, and a Tool to do it interactively. It also carries a catalogue of
standalone templates and bundles from the platform's earlier iteration.

This repository is the source for [incytemplates.com](https://incytemplates.com),
operated by Incyworks Ltd.

## Current milestone

This build completes the **v3 spec's recommended first milestone**
(`docs/Incytemplates-website-spec-v3.md`, §45) and spec §5.2's full
first-release scope: the framework/product-family data model,
Guide/Template/Tool as distinct first-class output types, a Tool registry
pattern, and **all six flagship families** built fully end-to-end (Guide +
Template + an anonymous, deterministic interactive Tool each) — **Product
Idea Assessor**, **Customer Discovery Kit** (see
[`docs/decisions/0021`](docs/decisions/0021-customer-discovery-kit-family.md)),
**Better Decision Maker** (see
[`docs/decisions/0022`](docs/decisions/0022-better-decision-maker-family.md)),
**MVP Scoper** (see
[`docs/decisions/0023`](docs/decisions/0023-mvp-scoper-family.md)),
**Product Naming System** (see
[`docs/decisions/0024`](docs/decisions/0024-product-naming-system-family.md))
and **First Customers Planner** (see
[`docs/decisions/0025`](docs/decisions/0025-first-customers-planner-family.md))
— alongside journey-stage navigation (`/journey/*`) and a framework
catalogue (`/products/*`). No frameworks in the seed data are draft any
more; the "Coming soon" draft-flagship-teaser mechanism (see
[`docs/decisions/0014`](docs/decisions/0014-draft-flagship-family-public-teasers.md))
stays in the codebase for whenever a future framework needs it, but nothing
currently exercises it (see
[`docs/decisions/0025`](docs/decisions/0025-first-customers-planner-family.md)
for what that meant for e2e test coverage). The earlier, v2-era
template/bundle catalogue (`/templates`, `/bundles`) still exists
underneath and is unaffected.

With all six flagship families complete, work has started on spec §5.3's
**Phase 1.1 enhancements**. First up: the **Next Step Finder** (`/finder`,
spec §22) — a three-question, fully client-side, deterministic routing quiz
across the published families, with no LLM and no database-stored
rules table (see
[`docs/decisions/0026`](docs/decisions/0026-next-step-finder.md)).

A seventh family has since shipped: **Product/Market Fit Tracker** (see
[`docs/decisions/0027`](docs/decisions/0027-product-market-fit-tracker-family.md)),
the first family from spec §37.1's Tier 2 launch order and the first to occupy
the **Improve** journey stage, which none of the six Tier 1 flagships cover.
It chains directly on from First Customers Planner and is wired into the
Next Step Finder alongside the original six.

An eighth family has since shipped: **Pricing Your Product** (see
[`docs/decisions/0028`](docs/decisions/0028-pricing-your-product-family.md)),
the second Tier 2 family. Its Tool is the first to score four named candidate
pricing models against each other — one-time, flat subscription, usage-based
and tiered — rather than a single subject against fixed thresholds. It chains
directly on from Product/Market Fit Tracker as the new terminal family in the
founder journey, and is wired into the Next Step Finder alongside the other
seven.

A ninth family has since shipped: **Product Idea Generator** (see
[`docs/decisions/0029`](docs/decisions/0029-product-idea-generator-family.md)),
the third Tier 2 family and adopted under spec v4
(`docs/Incytemplates-website-spec-v4.md`), which retains v3's product model
for this purpose. It's the first family to occupy the **Idea** journey
stage, and the first whose `next_step_framework_slug` leads *into* the
existing chain (Product Idea Assessor) rather than extending its tail,
since Idea precedes Validate in the founder journey. Its Tool is the first
to mix optional free-text inputs with a select — a personalised idea
direction generator, not another scorer — wired into the Next Step Finder
alongside the other eight.

A tenth family has since shipped: **Business Model Chooser** (see
[`docs/decisions/0030`](docs/decisions/0030-business-model-chooser-family.md)),
the fourth Tier 2 family. Its Tool reuses Pricing Your Product's
named-candidate scoring mechanic (four business models — SaaS, Marketplace,
Transactional, Advertising — scored across four dimensions), without a
disqualification gate. It's the first family to point forward to an
existing family's next step (Pricing Your Product) as a second, independent
branch rather than either leading or extending the chain — Product/Market
Fit Tracker already points at the same target — and is wired into the Next
Step Finder alongside the other nine.

An eleventh family has since shipped: **Decision Framework Picker** (see
[`docs/decisions/0031`](docs/decisions/0031-decision-framework-picker-family.md)),
the fifth Tier 2 family. Its four candidate techniques — Six Thinking Hats,
First Principles Thinking, Razors and the Boundary Rule — were chosen
deliberately distinct from Better Decision Maker's own four (reversibility,
inversion, simple rules, expected value), even though spec §37's
representative source posts overlap with Better Decision Maker's. It has no
next-step family — picking a thinking technique doesn't causally lead
anywhere in particular, unlike Business Model Chooser's link forward to
Pricing Your Product — and is wired into the Next Step Finder alongside the
other ten.

A twelfth family has since shipped: **Product Positioning Builder** (see
[`docs/decisions/0032`](docs/decisions/0032-product-positioning-builder-family.md)),
the sixth Tier 2 family and the first whose Tool isn't a named-candidate
scoring matrix — its source material (an action/outcome/admiration brand
formula and five non-competing cut-through tactics) doesn't support one, so
its Tool assembles a positioning statement from free text instead, plus a
direct lookup for which cut-through tactic fits. It's a second, independent
branch into Product Naming System alongside MVP Scoper, and is wired into
the Next Step Finder alongside the other eleven.

A thirteenth family has since shipped: **Customer Demand Test** (see
[`docs/decisions/0033`](docs/decisions/0033-customer-demand-test-family.md)),
the seventh Tier 2 family. Its Tool reverts to the named-candidate scoring
matrix — unlike Product Positioning Builder, this family's source material
(four pretotyping techniques: Fake Door Test, Wizard of Oz, YouTube MVP,
The Infiltrator) names comparable candidates itself, so the mechanic fits
without inventing anything. It's a third branch-into-an-existing-target
family, pointing forward to Better Decision Maker alongside Customer
Discovery Kit, and is wired into the Next Step Finder alongside the other
twelve.

A fourteenth family has since shipped: **Product Prioritisation Tool** (see
[`docs/decisions/0034`](docs/decisions/0034-product-prioritisation-tool-family.md)),
the eighth and final Tier 2 family. Its Tool scores four named task-scheduling
strategies — Earliest Due Date, Moore's Algorithm, Shortest Processing Time,
Weighted Processing Time — and, like Decision Framework Picker, is
deliberately terminal (no next-step family), since prioritising a task list
is a recurring practice rather than a one-time step. **This completes spec
§37.1's Tier 2** (ranks 7–14, all eight families). Tier 3 (ranks 15–25) is
explicitly scoped as "broaden only after demand evidence" — continuing
family-by-family into it is not assumed to be the default next action the
way Tier 2 followed on from Tier 1.

A fifteenth family has since shipped: **Lateral Thinking Toolkit** (see
[`docs/decisions/0035`](docs/decisions/0035-lateral-thinking-toolkit-family.md)),
**the first Tier 3 family, started at the user's explicit direction** rather
than a default rank-order continuation. Its Tool is the first to depart
entirely from picking a "winner" — it generates five lateral-thinking
prompts from one free-text input and presents all five unranked, since
scoring one above the others would contradict the source material's own
lesson that creative volume has to come before judgement. It's a second
entry point into Product Idea Assessor alongside Product Idea Generator,
and is wired into the Next Step Finder alongside the other fourteen.

A sixteenth family has since shipped: **User Engagement Designer** (see
[`docs/decisions/0036`](docs/decisions/0036-user-engagement-designer-family.md)),
the second Tier 3 family, again started at the user's explicit request. Its
Tool inverts the usual named-candidate scoring matrix: rather than scoring
several options and picking the highest, it scores Nir Eyal's four Hook
Model stages (Trigger, Action, Reward, Investment) from four independent
questions and surfaces the *weakest* one — the stage genuinely worth fixing
first. Like Product Prioritisation Tool, it's deliberately terminal (no
next-step family), since diagnosing an engagement loop is something to
revisit repeatedly, not a one-time step. Wired into the Next Step Finder
alongside the other fifteen.

A seventeenth family has since shipped: **Story Builder** (see
[`docs/decisions/0037`](docs/decisions/0037-story-builder-family.md)), the
third Tier 3 family, again started at the user's explicit request. Its Tool
is the first pure completeness checker — five optional free-text fields,
one per story-spine element (Place, Action, Thought, Emotion, Dialogue),
checked for presence rather than scored or ranked, with a craft tip for
whichever element is missing first. A second branch into First Customers
Planner alongside Product Naming System, and wired into the Next Step
Finder alongside the other sixteen.

An eighteenth family has since shipped: **Startup Launch Planner** (see
[`docs/decisions/0038`](docs/decisions/0038-startup-launch-planner-family.md)),
the fourth Tier 3 family, again started at the user's explicit request. Its
Tool reuses the named-candidate scoring matrix but returns the *full ranked
plan* across four launch options (soft launch page, friends and family,
community or social, press), not just a winner and runner-up — a genuine
sequenced plan. A third branch into First Customers Planner, and wired into
the Next Step Finder alongside the other seventeen.

A nineteenth family has since shipped: **Meeting Reset** (see
[`docs/decisions/0039`](docs/decisions/0039-meeting-reset-family.md)), the
fifth Tier 3 family, again started at the user's explicit request. Its Tool
returns to the gated decision tree first used by MVP Scoper: a vague
purpose cancels the meeting outright regardless of every other answer, a
one-way interaction with no decision needed becomes an async update,
otherwise unnecessary attendees get cut, and only a meeting that survives
all three gates is kept as-is — a single verdict, not a ranked list. Like
Decision Framework Picker and User Engagement Designer, it's deliberately
terminal (no next-step family), since diagnosing a meeting is something to
revisit for every recurring meeting, not a one-time step. Wired into the
Next Step Finder alongside the other eighteen.

A twentieth family has since shipped: **Writing Editor** (see
[`docs/decisions/0040`](docs/decisions/0040-writing-editor-family.md)), the
sixth Tier 3 family, again started at the user's explicit request. Its Tool
is the second use of the completeness-checklist mechanic Story Builder
introduced, inverted: it checks a draft against five of George Orwell's
writing rules for presence of a *problem* rather than presence of a
*required part*, so an all-clean result is the best outcome rather than the
worst. The spec's "self-edit checklist" and "structured editing review" map
onto the Template and Tool respectively, rather than both living inside the
Tool. Like Decision Framework Picker, Product Prioritisation Tool, User
Engagement Designer and Meeting Reset, it's deliberately terminal (no
next-step family), since editing well is a practice to repeat on every
draft, not a one-time step. Wired into the Next Step Finder alongside the
other nineteen.

A twenty-first family has since shipped: **App Design Review** (see
[`docs/decisions/0041`](docs/decisions/0041-app-design-review-family.md)), the
seventh Tier 3 family, again started at the user's explicit request. Its
Tool is the third use of the completeness-checklist mechanic Story Builder
introduced, back to its original polarity: it checks a product against ten
of Dieter Rams' design principles for presence of the principle (good),
unlike Writing Editor's inverted checklist of problems. Like Decision
Framework Picker, Product Prioritisation Tool, User Engagement Designer,
Meeting Reset and Writing Editor, it's deliberately terminal (no next-step
family), since reviewing a design against fixed principles is revisited
every release, not a one-time step. Wired into the Next Step Finder
alongside the other twenty.

A twenty-second family has since shipped: **AI Prompt Builder** (see
[`docs/decisions/0042`](docs/decisions/0042-ai-prompt-builder-family.md)), the
eighth Tier 3 family, again started at the user's explicit request. Its Tool
is the third use of the free-text interpolation mechanic (Product Idea
Generator, Product Positioning Builder): the CARE framework's own structure
(Context, Action, Result required, Example optional) assembles directly
into a ready-to-paste prompt, with a select toggle for whether to append a
second technique — letting the chatbot ask the questions instead — rather
than a lookup-based recommendation. Like Decision Framework Picker, Product
Prioritisation Tool, User Engagement Designer, Meeting Reset, Writing
Editor and App Design Review, it's deliberately terminal (no next-step
family), since prompting is a skill applied everywhere, not a one-time
step. Wired into the Next Step Finder alongside the other twenty-one.

A twenty-third family has since shipped: **AI Agent Designer** (see
[`docs/decisions/0043`](docs/decisions/0043-ai-agent-designer-family.md)),
the ninth Tier 3 family, again started at the user's explicit request. Its
Tool is a gated decision tree, the third instance of that shape (MVP
Scoper's original score+gate, Meeting Reset's pure form): six
priority-ordered questions classify a specific AI feature into one of six
outcomes — "use a workflow, not an agent" outright if the task is
predictable, otherwise one of five named architecture patterns (Augmented
LLM, Prompt Chaining, Routing System, Orchestrator-Worker,
Evaluator-Optimiser), checked from most specific need to most general
fallback. Unlike the six families before it, this one isn't deliberately
terminal — it's the first family since Better Decision Maker to point
forward into MVP Scoper, a second, independent branch. Wired into the Next
Step Finder alongside the other twenty-two.

A twenty-fourth family has since shipped: **Negotiation Prep** (see
[`docs/decisions/0055`](docs/decisions/0055-negotiation-prep-family.md)),
the tenth Tier 3 family, again started at the user's explicit request. Its
Tool is a completeness checklist, the fourth use of that shape (Story
Builder's original, App Design Review's same polarity, Writing Editor's
inversion): three free-text fields — BATNA (fallback), Anchor, and MESOs
(multiple equivalent offers) — checked for presence, not scored, with a
tip for whichever tactic isn't prepared yet. Deliberately terminal, like
Meeting Reset and Writing Editor — negotiating well is a recurring skill,
not a one-time step. Wired into the Next Step Finder alongside the other
twenty-three.

A twenty-fifth family has since shipped: **Sticky Pitch Checker** (see
[`docs/decisions/0057`](docs/decisions/0057-sticky-pitch-checker-family.md)),
the first family sourced directly from the v7 Reuse Taxonomy admin
workspace rather than spec §37's original portfolio — found by reading two
companion source posts (Chip and Dan Heath's SUCCESs framework, Jonah
Berger's STEPPS framework) that turned out to share two factors, merged
into one ten-factor checklist rather than built as two overlapping
families. Its Tool is the fifth use of the completeness-checklist
mechanic, same polarity as App Design Review, with results grouped into
"makes it stick" and "makes it spread" — the first checklist Tool to
group its factors, since these ten come from two distinct named
frameworks rather than one. Points forward to First Customers Planner, a
fourth branch alongside Product Naming System, Story Builder and Startup
Launch Planner. Wired into the Next Step Finder alongside the other
twenty-four.

A twenty-sixth family has since shipped: **Rapid Learning Planner** (see
[`docs/decisions/0060`](docs/decisions/0060-rapid-learning-planner-family.md)),
the second family sourced directly from the v7 Reuse Taxonomy admin
workspace, built from Tim Ferriss's DSSS framework (Deconstruction,
Selection, Sequencing, Stakes). Its Tool is the sixth use of the
completeness-checklist mechanic, and the third built from optional
free-text fields rather than yes/no self-assessment (alongside Story
Builder and Negotiation Prep) — DSSS is a plan for one specific skill,
not properties of an existing artifact. Deliberately terminal, like
Negotiation Prep, Writing Editor and AI Prompt Builder. Wired into the
Next Step Finder alongside the other twenty-five.

See [`docs/decisions/`](docs/decisions/) for every deviation and judgment
call made along the way, particularly `0013`–`0020` for the v3 work
specifically, and `0044` onward for the admin/editorial, Visual Asset
System, commerce/accounts and Reuse Taxonomy work that has since shipped
on top of this milestone.

## Tech stack

- [Next.js 16](https://nextjs.org/docs/app) (App Router, TypeScript, `src/` dir)
- [Tailwind CSS v4](https://tailwindcss.com) (CSS-first config — see `src/app/globals.css`, no `tailwind.config.ts`)
- [Supabase](https://supabase.com) (Postgres, Auth, Storage — Auth/Storage not wired yet)
- [Zod](https://zod.dev) v4 for env and input validation
- [Vitest](https://vitest.dev) + Testing Library for unit/component tests
- [Playwright](https://playwright.dev) + axe for e2e/accessibility smoke tests
- MDX (via `gray-matter` + `next-mdx-remote`) for editorial guide content

## Getting started

```bash
npm install
npm run dev
```

The app builds and runs with **zero cloud credentials** — with no Supabase
env vars set, it automatically falls back to a local fixtures data source
(`content/seed/catalogue.ts`) so the catalogue is fully browsable offline. A
banner appears whenever fixtures are active so it's never mistaken for live
data. See [`docs/decisions/0003-fixtures-data-source-abstraction.md`](docs/decisions/0003-fixtures-data-source-abstraction.md).

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you have. Every
cloud-service variable is optional at this build phase — see
`src/lib/env/server.ts` and `src/lib/env/client.ts` for the validated
schema. Never commit `.env.local`.

To use a real Supabase project instead of fixtures, set
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Database & migrations

Schema lives in `supabase/migrations/` (the full data model from spec §14,
including tables not yet used by any UI — see
[`docs/decisions/0005-schema-deviations.md`](docs/decisions/0005-schema-deviations.md)
for the handful of deviations from the spec's literal SQL). RLS policy
tests live in `supabase/tests/`.

```bash
supabase link --project-ref <your-project-ref>
supabase db push
npm run seed   # regenerates supabase/seed.sql from content/seed/catalogue.ts
```

## Testing

```bash
npm run typecheck
npm run lint
npm run test       # unit/component tests (Vitest)
npm run e2e         # e2e + accessibility smoke tests (Playwright, needs a running build)
```

Most of `npm run e2e` runs against the local fixtures data source, no credentials needed. Two
specs — `admin-template-editor.spec.ts`, `admin-tool-editor.spec.ts` — cover the admin
Template/Tool editorial-content editors (spec v8 §10.11) and need a real staff session, since
`/admin` has no fixtures path. They self-skip unless `NEXT_PUBLIC_SUPABASE_URL` /
`SUPABASE_SERVICE_ROLE_KEY` / `E2E_STAFF_EMAIL` are exported in the shell first (this repo's
tsx/Playwright runs never auto-load `.env.local` — export it yourself, e.g. `set -a; source
.env.local; export E2E_STAFF_EMAIL=you@example.com; set +a`). They only ever click "Save draft",
never "Publish", so they're safe to run against a live project — see
`tests/e2e/helpers/admin-auth.ts`.

## Branch / PR workflow

- `main` is production; work happens on short-lived `feature/*` branches.
- Pull requests are required before merging to `main`; CI
  (`.github/workflows/ci.yml`) must pass — install, lint, typecheck, unit
  tests, production build (fixtures-backed, no secrets required), a static
  migration-file check, an accessibility/keyboard-nav e2e smoke test, and a
  secret scan.
- Never force-push `main`; never commit `.env*` files or generated build
  output.

## Deployment status

Not yet connected to Vercel. See
[`docs/decisions/0009-supabase-project-timing.md`](docs/decisions/0009-supabase-project-timing.md)
for what's connected so far and what's still a manual follow-up step.

## Support

`phil@incytemplates.com`
