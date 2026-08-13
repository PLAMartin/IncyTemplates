# 0053 — Saved Tool runs

## Status
Accepted

## Context

Fourth commerce/accounts piece, following Stripe checkout (`0051`) and customer auth + account shell (`0052`). Spec §14.12 defines `it_tool_runs` for letting a visitor save a completed Tool run and revisit it later; until now all 23 Tools were explicitly client-side-only ("Nothing is saved or sent anywhere" in their own UI copy), and `it_tool_runs` did not exist anywhere, not even schema-only — genuinely greenfield, as flagged when `0052` landed.

`product-idea-assessor` was chosen as the pilot Tool, the same role `idea-intake` played for checkout (`0051`) and Product Idea Assessor's own family played for the Visual Asset System (`0047`) — simplest, already-published, low-risk place to prove a new mechanic end-to-end before wiring the other 22.

## Decisions

**Ownership follows the same deferred-linking shape as free downloads and the customer/profile link (`0052`), not a new pattern.** A `run_has_owner` check constraint requires either `profile_id` or `anonymous_session_id`; anonymous visitors save via the existing `it_anon_session` cookie (`src/server/session/anonymous-session.ts`, already built for free downloads), and `it_claim_anonymous_tool_runs()` — a `security definer` function reading `auth.uid()` internally, mirroring `it_link_customer_to_profile()`'s safety shape exactly — claims any matching anonymous rows on sign-in. Wired into `src/app/auth/callback/route.ts` (the real PKCE production path) as a second best-effort, non-blocking RPC call alongside the existing customer-linking one.

**All writes go through the service-role client; there is no client-side INSERT/UPDATE policy at all.** `POST /api/tools/[toolKey]/runs` re-validates the Tool's own `inputSchema`/`resultSchema` (via the existing `findToolDefinition` registry) before writing — a client could otherwise post an arbitrary payload against `tool_schema_version`. This mirrors `saveToolRun`'s sibling money/entitlement-adjacent routes (`createCheckoutSession`, `resolvePaidOrderFile`) in going through a dedicated `src/server/<feature>/` function rather than `CatalogueSource`.

**RLS is SELECT-only for the owning profile plus staff, same posture as `it_entitlements`.** No anon SELECT at all (unlike `it_free_download_requests`, which allows a direct anon INSERT since there's no session to key off) — an anonymous save still needs a server-assigned `anonymous_session_id`, so it goes through the service-role client exactly like a signed-in save does.

**`/account/work` (nav label "Work") reads via the ordinary session-bound client, not service-role**, joining directly to `it_products` for the display name. This deviates from `/account/library`'s pattern of joining through `it_order_items` to avoid a since-unpublished product vanishing — accepted here because Tools, unlike Templates, are core site features not expected to be unpublished, documented in the page's own comment rather than silently diverging.

**`SaveRunButton` never forces sign-in first.** Anonymous visitors can save immediately; the button's post-save copy ("Sign in any time to find this under Work in your account") is the only prompt. Same `fetch`-then-`startTransition` shape as `BuyButton`/`DownloadOrderButton`, reused rather than inventing a new async-button pattern.

## Verification

Live verification against the real linked Supabase project (throwaway fixtures, cleaned up after), same technique as `0051`/`0052`:

1. **`it_claim_anonymous_tool_runs()` and the full save→claim→read path**, via a genuine authenticated session (`admin.generateLink()` + following the redirect's fragment tokens directly in Node, then `setSession()` on a fresh anon-key client). Inserted an anonymous run (mimicking `saveToolRun`'s exact insert shape), claimed it as a real signed-in user, confirmed `profile_id` was set and `anonymous_session_id` cleared, confirmed the owner can read it back via `/account/work`'s exact query shape, confirmed a second claim call is a no-op (idempotent), and confirmed the anon key sees zero rows (RLS default-deny). All passed.
2. **The real browser save flow**, via Playwright against a local dev server: visited `/tools/product-idea-assessor` as an anonymous visitor, answered all five questions, clicked "Save this result," confirmed the button flips to its saved state and the `it_anon_session` cookie is set. Confirmed separately (as expected, not a bug — see below) that following `/auth/callback/implicit` does *not* trigger the claim, consistent with `0052`'s finding that the implicit path deliberately skips its linking RPC too.

`npm run typecheck`/`lint`/`test` (457 tests) and `npm run build` all pass. An authored-only pgTAP test (`supabase/tests/it_tool_runs_test.sql`, per this repo's established "not run in this environment, no Docker" convention) covers the same owner/staff/anon visibility and claim/idempotency behavior at the SQL level.

## Follow-up

- **`expires_at` is unused.** Spec §14.12 says "Anonymous runs should expire automatically unless there is a justified reason to retain them" — the column exists on the table but nothing sets or sweeps it yet. Real remaining scope, not silently dropped: needs either a default TTL on insert plus a scheduled cleanup, or a deliberate decision to retain anonymous runs indefinitely until claimed.
- **`customer_id` is carried for schema parity but never populated.** Documented in the schema migration's own comment — a Tool run has no purchase behind it, so nothing currently has a reason to set it.
- **`ai_metadata` is unused.** No Tool in this codebase calls an AI provider (all 23 are deterministic, no-LLM by design per the build order), so there's nothing to populate it with yet.
- **Only `product-idea-assessor` has `SaveRunButton` wired in.** The other 22 Tools' runners don't render it yet — same one-pilot-first shape as `0047`'s single visual and `0051`'s single paid product, not an oversight.
- **Real end-to-end verification of the actual production PKCE claim path** (a genuine `signInWithOtp()` browser call, receiving a real email, clicking through) wasn't performed, for the same reason as `0052`: no custom SMTP wired yet. The claim RPC itself is proven live and correct (Verification, item 1); only the exact email-click journey through `/auth/callback` (not `/auth/callback/implicit`) remains unverified end-to-end, though the code path is a two-line, type-checked addition to an already-working route.
- **No delete/manage UI on `/account/work`.** It's read-only — no way for a signed-in user to remove a saved run themselves yet.
