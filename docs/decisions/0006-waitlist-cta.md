# 0006 — Waitlist CTA instead of a disabled buy/download button

## Status
Accepted

## Context
Product/bundle pages need a CTA even though Stripe checkout and free
downloads aren't built this phase (Phases 2-3). A disabled button with
helper text was the lower-scope option; the product owner chose the
higher-scope one.

## Decision
Product/bundle CTAs are a real, working waitlist email-capture form
("Notify me" / "Join the waitlist"), not a disabled button. This required
one small write path — the only place this phase's public pages write to
the database: a Server Action inserting into the new `it_waitlist_signups`
table (see [[0005-schema-deviations]]) via the Supabase anon client, guarded
by insert-only RLS. When Supabase isn't configured (fixtures-only
environments), the form says plainly that the waitlist isn't connected yet
rather than faking a success state.
