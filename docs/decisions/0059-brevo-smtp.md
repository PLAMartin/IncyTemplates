# 0059 — Brevo as the production SMTP provider for Supabase Auth email

## Status
Accepted

## Context
Since `2026-08-12`, this project ran on Supabase's default built-in email sender for magic-link
sign-in, which has a low rate limit intended for dev/testing, not production (`over_email_send_rate_limit`
hit that day; the user chose to wait out the window rather than set up real SMTP immediately —
see `project_build_order` memory). The user chose **Brevo** over the previously-placeholder'd
Resend (`RESEND_API_KEY` has sat unused in `.env.example`/`src/lib/env/server.ts` since Phase 1,
reserved for a future transactional-order-email feature that doesn't exist in code yet — this
decision doesn't touch that, it's a separate, still-unbuilt path). Domain (`incytemplates.com`)
and sender (`phil@incytemplates.com`) were both verified directly in Brevo's dashboard by the
user before this pass; this decision covers only the Supabase-side wiring.

**No app code sends email.** Grepped the whole `src/`/`scripts/` tree: `RESEND_API_KEY` is
referenced only in its own Zod schema field (`src/lib/env/server.ts`), nothing reads it. The
*only* email this project currently sends is Supabase Auth's own magic-link/OTP mail, via
GoTrue's internal SMTP client — so "set up Brevo" is entirely a `supabase/config.toml` change,
not an application-code change.

## Decisions

**`supabase/config.toml`'s `[auth.email.smtp]` block, previously fully commented out (a
SendGrid-flavoured example), filled in for Brevo**:

```toml
[auth.email.smtp]
enabled = true
host = "smtp-relay.brevo.com"
port = 587
user = "env(BREVO_SMTP_LOGIN)"
pass = "env(BREVO_SMTP_KEY)"
admin_email = "phil@incytemplates.com"
sender_name = "Incy Templates"
```

`BREVO_SMTP_LOGIN`/`BREVO_SMTP_KEY` come from Brevo's *SMTP & API* settings, **SMTP tab**
specifically — not the API Keys tab, whose key is for Brevo's REST API and can't be used by
GoTrue (SMTP-only). Documented in `.env.example` alongside the existing, still-unused Resend
placeholders.

**These two env vars are read only by the `supabase` CLI's `env()` substitution at `supabase
config push` time, on whichever machine runs that command — not by the deployed Next.js app.**
No Vercel env var addition is needed for this; Vercel's env vars are for the app runtime, and the
app never touches SMTP credentials.

**Pushed live via `supabase config push`, with the diff reviewed before treating it as
applied** — per the standing lesson from this repo's own history (`0044`'s Follow-up /
`env-local-points-at-live-supabase` memory: "before ever running `supabase config push` again in
this repo, diff `config.toml` section-by-section against current live Management API state
first"). This CLI version prints a per-section diff (`remote[auth]` vs `local[auth]`) but has
**no interactive confirmation gate** — piping `n` to a prompt that doesn't exist doesn't prevent
the push; each section's diff is logged and applied directly. Confirmed the diff touched only
`[email.smtp]` (`enabled`/`host`/`port`/`user`/`pass`/`admin_email`/`sender_name`), nothing else —
running the same command again immediately after showed `Remote Auth config is up to date`,
confirming both that the change applied and that nothing outside the intended section moved.

**Separate, pre-existing CLI error, not caused by this change and not fixed here**: the same
`supabase config push` run fails on the Storage section with
`LegacyConfigPushStorageReadNetworkError: failed to read Storage config: SchemaError(Missing key
at ["databasePoolMode"])` — a CLI/remote-schema mismatch unrelated to Auth/SMTP. Auth's own push
step completes and is confirmed applied *before* this error surfaces (API and DB config sections
reported "up to date" ahead of it in the same run), so it didn't block or roll back the SMTP
change, but it means `supabase config push` currently can't be used to sync *Storage* config
changes in this repo until root-caused separately.

## Follow-up
- **Real end-to-end delivery through Brevo is unverified** — the config is live but no real
  sign-in has been triggered through it yet. The user should try a real sign-in at `/sign-in`
  to confirm an email actually arrives from `phil@incytemplates.com` via Brevo.
- **`auth.rate_limit.email_sent = 2`** (2 emails/hour) is still Supabase Auth's own internal
  rate limit, independent of the SMTP provider behind it — worth revisiting now that a real
  provider is configured, since 2/hour is still very low for anything beyond solo testing. Not
  changed here since it's a policy call, not a mechanical part of the Brevo wiring.
- **The `LegacyConfigPushStorageReadNetworkError` CLI bug** blocks any future Storage-config
  push through this same command — worth its own investigation (likely a Supabase CLI version
  behind what the live project's Storage API now expects).
