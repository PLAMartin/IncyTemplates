# 0011 — Free-download abuse protection: scope for this step

## Status
Accepted

## Context
Spec §20.2 lists six layered abuse-protection measures for
`POST /api/downloads/free`: per-IP rate limiting, per-session rate
limiting, bot protection, maximum URL-generation frequency, nonce/CSRF
protection, and bandwidth monitoring. Building all six means new external
services (a bot-protection provider like Turnstile) and monitoring infra
(Sentry isn't wired up yet — `SENTRY_DSN` is unset) that don't exist in
this repo yet and weren't part of this step's scope.

## Decision
This step implements four of the six, using only infrastructure already
in place:
- **Per-IP rate limiting** — HMAC-hashed IP (`DOWNLOAD_HASH_SECRET`),
  counted against `it_download_events.ip_hash` over a 10-minute window
  (`src/server/downloads/rate-limit.ts`). Skipped (logged, not fatal) if
  `DOWNLOAD_HASH_SECRET` is unset.
- **Per-session rate limiting** — an anonymous session cookie
  (`src/server/downloads/session.ts`), counted against
  `it_download_events.anonymous_session_id` over a 60-minute window.
- **Maximum URL-generation frequency** — a side effect of the two rate
  limits above; no separate mechanism.
- **CSRF, partially** — a same-origin check on the `Origin` header
  (`src/app/api/downloads/free/route.ts`), not a nonce/token system. Judged
  proportionate for a non-authenticated, non-destructive endpoint.

Deferred, not built this step:
- **Bot protection** — needs a provider decision (e.g. Cloudflare
  Turnstile) and a new site-key/secret pair; out of scope until that
  decision is made.
- **Bandwidth monitoring** — needs monitoring infra that isn't connected
  yet (`SENTRY_DSN` unset).

`RATE_LIMIT_SECRET` (declared in `src/lib/env/server.ts`) is left unused.
Nothing in the spec pins down a distinct purpose for it beyond appearing
in the same env-var grouping comment as `DOWNLOAD_HASH_SECRET`, which
already covers this step's hashing needs. Reserved for a future
rate-limiting mechanism rather than assigned an invented use now.
