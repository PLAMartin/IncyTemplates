# 0054 — Tool run expiry

## Status
Accepted

## Context

`0053` shipped `it_tool_runs` with `expires_at timestamptz` on the table (spec v6 §14.12, reproduced verbatim) but left the column unused, flagged explicitly in its own Follow-up: "Anonymous runs should expire automatically unless there is a justified reason to retain them" — nothing set or swept it yet.

## Decisions

**Only anonymous-owned runs get a TTL; signed-in saves stay permanent.** The spec's wording scopes expiry to *anonymous* runs specifically — a signed-in save is itself the "justified reason to retain" the spec allows for. `saveToolRun` (`src/server/tools/save-tool-run.ts`) now sets `expires_at = now() + 30 days` only when `owner` is `{ anonymousSessionId }`; `{ profileId }` saves get `expires_at: null`.

**The TTL reuses `ANONYMOUS_SESSION_MAX_AGE_SECONDS` (30 days) rather than introducing a second constant.** That value already governs the `it_anon_session` cookie's own lifetime (`src/server/session/anonymous-session.ts`) — once the cookie that keys an anonymous run expires, the run is unreachable to its owner anyway, so a second, independent TTL would only ever be redundant or (if shorter) prematurely destructive.

**Claiming clears `expires_at` back to `null`.** `it_claim_anonymous_tool_runs()` (`20260814120000_it_claim_anonymous_tool_runs_clears_expiry.sql`, `CREATE OR REPLACE` in place — same signature as `20260813170015`, no overload risk per the lesson from `0044`'s audit-log incident) now sets `expires_at = null` alongside its existing `profile_id`/`anonymous_session_id` update. Signing in and claiming a run is exactly the "justified reason to retain" the spec means.

**Sweep via `pg_cron`, not a Vercel Cron route.** `20260814120005_it_expire_anonymous_tool_runs.sql` enables the `pg_cron` extension (confirmed available on the live project via the Management API's `database/query` endpoint, not previously enabled — first use of `pg_cron` in this repo) and schedules `it_expire_anonymous_tool_runs()`, a `security definer` SQL function, daily at 03:00 UTC. Chosen over an API-route-plus-secret approach because the whole mechanism — schedule, auth boundary, and the delete itself — stays inside the database layer, consistent with every other scheduled/derived-state operation in this schema (all `security definer` functions, no app-server cron infra exists yet for anything else).

**Hard delete, not soft delete via the existing `deleted_at` column.** `deleted_at` isn't used as a soft-delete convention anywhere else in this schema — it's carried from the spec's literal table definition, most plausibly reserved for a future user- or staff-initiated "delete my saved run" action, not automatic expiry. Spec's own note that "sensitive free-text inputs require explicit privacy review" argues for actually removing expired anonymous data rather than leaving it sitting flagged-but-present indefinitely.

## Verification

Live-verified directly against the real linked Supabase project via the Management API's `database/query` SQL endpoint (no auth.uid() context needed for this piece — the sweep function's logic doesn't depend on the caller's session, unlike the claim function already proven live in `0053`):

1. Inserted one anonymous `it_tool_runs` row with `expires_at` in the past and one with `expires_at` 29 days out, both referencing a real `it_products` row. Called `it_expire_anonymous_tool_runs()` directly — the expired row was deleted, the not-yet-expired row was untouched.
2. Confirmed the scheduled job exists, is `active`, and has the expected `0 3 * * *` schedule via `cron.job`.
3. Confirmed `it_claim_anonymous_tool_runs()`'s live function source (`pg_proc.prosrc`) includes the new `expires_at = null` assignment.
4. Test rows cleaned up after.

`npm run typecheck`/`lint`/`test` (457 tests, `save-tool-run.test.ts` extended to assert the anonymous path's `expires_at` lands within a 30-day window and the signed-in path's is `null`) and `npm run build` all pass. Both migrations pushed to the live `Incytemplates` project (`supabase db push --linked`).

## Follow-up

- **No delete/manage UI on `/account/work` still.** Unchanged from `0053` — this slice only handles automatic anonymous expiry, not user-initiated deletion (which is what `deleted_at` is most plausibly reserved for).
- **Real production sweep behavior (a genuine 30-day-old anonymous row actually getting deleted by the 03:00 UTC schedule, not just a manually-invoked function call) is unverified** — proving that requires either waiting 30 days or backdating a real save's `started_at`/`expires_at`, neither done here. The function and schedule are proven correct in isolation (Verification, items 1–2).
