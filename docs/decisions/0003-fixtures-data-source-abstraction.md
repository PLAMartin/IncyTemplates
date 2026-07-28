# 0003 — Fixtures/Supabase data-source abstraction

## Status
Accepted, time-boxed

## Context
No Supabase project exists yet (no Docker locally either, so `supabase start`
isn't available), but Phase 0's exit criteria require a "production-like
preview deploy" and CI to run without any cloud credentials.

## Decision
`src/server/queries/` defines a `CatalogueSource` interface (see `types.ts`)
with two implementations: `SupabaseCatalogueSource` (real, RLS-respecting
anon client) and `FixtureCatalogueSource` (reads `content/seed/catalogue.ts`).
`index.ts` selects Supabase automatically when
`NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` are set, otherwise
falls back to fixtures. A dev-only banner renders when fixtures are active so
nobody mistakes placeholder output for live data.

## Consequences
Every public page reads through this interface, never a data source
directly, so nothing else changes when a real Supabase project is connected.

## Follow-up
Once a live Supabase project is the norm, decide whether to keep the
fixtures path permanently for local dev/tests or retire it — don't let it
silently rot as a second, drifting content path.
