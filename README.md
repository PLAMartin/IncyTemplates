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

**No Stripe checkout, no customer accounts/library, no saved Tool runs, and
no admin CRUD UI yet** — those remain out of scope for this milestone per
the spec's own phasing. Product/bundle pages still use a waitlist
email-capture CTA. See [`docs/decisions/`](docs/decisions/) for every
deviation and judgment call made along the way, particularly `0013`–`0020`
for the v3 work specifically.

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
