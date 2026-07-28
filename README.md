# Incy Templates

Incy Templates creates practical, thoughtfully designed templates that help
people work more clearly, quickly and effectively. From business planning
and product development to personal organisation, every template is made to
be easy to use, simple to adapt and useful.

This repository is the source for [incytemplates.com](https://incytemplates.com),
operated by Incyworks Ltd.

## Current milestone

This build targets **Phase 0 (Foundation) + Phase 1 (Public catalogue)**
only, per the full technical spec at
[`docs/Incytemplates-website-spec-v2.md`](docs/Incytemplates-website-spec-v2.md)
(see its §40/§45). That means: a deployable, read-only, SEO-complete
marketing site and template catalogue backed by a real Supabase schema —
homepage, categories, journey stages, product/bundle/guide pages, search.
**No Stripe checkout, no customer accounts/library, and no admin CRUD UI
yet** — those are Phases 2-4, listed but not built. Product/bundle pages use
a waitlist email-capture CTA in the meantime. See
[`docs/decisions/`](docs/decisions/) for every deviation and judgment call
made along the way.

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
