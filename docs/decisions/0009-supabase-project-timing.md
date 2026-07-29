# 0009 — Real Supabase project created during this build, not deferred

## Status
Accepted

## Context
Neither Docker (for `supabase start`) nor a hosted Supabase project existed
when this build started, so migrations couldn't be applied or RLS-tested
anywhere. Two options existed: install Docker later and ship schema-only
for now, or create a real hosted project immediately. The product owner
chose the latter.

## Decision
A free-tier, non-production Supabase project is created during this build
(not deferred to a follow-up). `supabase link` + `supabase db push` apply
the migrations for real, and the committed pgTAP RLS tests run against it,
so Phase 1's "seed products can be browsed" / "draft correctly hidden"
exit criteria are verified against a live database, not just fixtures.

## Follow-up
Vercel project connection and production Stripe/Resend/GA wiring remain
deferred (Phase 5) — this ADR covers Supabase only.
