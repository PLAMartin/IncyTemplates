# 0066 — v9 Phase 5: consent-gated analytics

## Status
Complete and live-verified; not yet committed. Covers spec v9 §40 Phase 5's analytics half —
§25's consent mechanism and Core Collection funnel event instrumentation. Deliberately scoped
down from Phase 5's full remit (performance/Lighthouse audits, security audits, legal/support
readiness review, operational review of Supabase/auth/commerce, §41/§42 checklist sign-off) — see
Follow-up.

## Context
Before this pass there was no consent mechanism at all, and the site's only analytics code was an
unconditional GA4 pageview script in `src/app/layout.tsx` that would have fired for every visitor
the moment a `NEXT_PUBLIC_GA_MEASUREMENT_ID` was ever configured — a direct violation of spec
§25.1 ("no optional tracking before consent where consent is required"). No GA4 property is
configured in `.env.local` yet, so this is genuinely new, previously-inert territory: the whole
analytics layer only activates once a real measurement ID is added.

## What was built

**Consent** (`src/lib/analytics/consent.ts`, `src/components/analytics/`): a `localStorage`-backed
tri-state (`granted`/`denied`/`undetermined`) under `it_analytics_consent_v1`. `CookieConsentBanner`
shows only while undetermined, with Accept/Reject as same-size buttons one tab-stop apart (spec
§25.1's "equally accessible accept/reject"). `CookiePreferencesLink` in the site footer resets
consent to undetermined so a visitor can revisit the choice at any time (the "settings" control).
`useAnalyticsConsent` is `useSyncExternalStore`-based, same pattern as Phase 4's
`useCollectionProgress` — needed for the banner/GA4-loader to react immediately to a same-tab
choice, not just a cross-tab `storage` event.

**GA4 loading** (`AnalyticsScripts`): the external `gtag/js` script tag is only ever added to the
DOM once consent is `"granted"` — `.env.local`'s `/legal/cookies` page was rewritten from its old
"pending, nothing built yet" placeholder to describe the real mechanism (necessary-vs-optional
cookie split, what's sent, what's never sent, how to change your mind).

**Event tracking** (`src/lib/analytics/track.ts`): `trackEvent(name, properties)` pushes directly
onto `window.dataLayer` (the same array `gtag()` itself pushes onto — `function
gtag(){dataLayer.push(arguments)}`) rather than calling `window.gtag(...)`, and checks consent
itself via a plain synchronous `localStorage` read rather than trusting a caller to have already
gated rendering. Wired into the existing Phase 1–4 mount points rather than duplicating them:
`RecordProgressVisit`/`RecordProgressCompletion` (`record-progress.tsx`) now also fire
`view_guide`/`view_template`/`view_tool` on visit and `complete_tool`/`view_tool_result`/
`complete_free_download`/`complete_core_step` on completion — the exact same real signals Phase 4
already identified, not new trigger points. New standalone mounts: `view_home` (homepage),
`view_collection` (collection page), `view_framework` (family page), `continue_journey_shown`/
`continue_journey_clicked` (`ContinueJourney`), `click_next_step` (family/tool page "Next step"
card), `click_guide_to_template`/`click_guide_to_tool` (guide page's same-family output cards),
`start_free_download` (`ViewForm`'s submit success), `start_tool` (the 5 core Tool Runners' intro
button). Event properties are limited to spec §25.3's allow-list (`framework_slug`, `product_slug`,
`product_type`, `collection_slug`) — never Tool/Template content, matching how `record-progress.tsx`
already never touched user content.

`TrackedClick` (`src/components/analytics/tracked-click.tsx`) exists because `FrameworkCard`/
`ProductCard` are rendered directly from Server Components (family/guide pages) — a Server
Component can't pass an `onClick` function prop across the client boundary into `next/link`'s
`Link`, but it *can* pass already-rendered server JSX as `children` into a Client Component
wrapper. `TrackedClick` listens for the click via DOM bubbling on a `display: contents` wrapper
instead, so the card markup/layout is untouched.

## A real architectural bug found and fixed during live verification
The first implementation had `AnalyticsScripts` call `window.gtag(...)` directly and had
`trackEvent` no-op unless `window.gtag` was already a function. **Every single custom event was
silently dropped on every page**, confirmed via a temporary `NEXT_PUBLIC_GA_MEASUREMENT_ID`
production build (`next build && next start` — GA4 only ever loads when `NODE_ENV === "production"`,
so this couldn't be seen against `next dev` at all) plus a script that read `window.dataLayer`
directly rather than trusting on-page state. Root cause, confirmed by instrumenting the effect:
`useAnalyticsConsent`'s `useSyncExternalStore` correctly renders `getServerSnapshot`
(`"undetermined"`) on the very first client pass to match SSR, then re-syncs to the real value in
a *second* render pass — and that second pass (where `AnalyticsScripts` would have called
`gtag`/created `dataLayer`) was measured running *after* other components' own mount effects had
already fired and found nothing there to call. This is a hydration-timing property of
`useSyncExternalStore` itself, not a bug in how it was used — doing the initialisation "in render,
not an effect" doesn't avoid it, because the *correct* render doesn't happen until that second pass
either.

**Fixed** by making `trackEvent` fully self-sufficient instead of depending on any other
component's timing: it checks consent via a plain synchronous `getStoredConsent()` (no
`useSyncExternalStore` two-pass delay — a plain function call in an effect just reads the current
value) and lazily creates+seeds `window.dataLayer` itself (via `ensureDataLayer`, using a GA4
property id registered by `AnalyticsScripts` as a side effect, independent of consent) if it's the
first thing to fire. `AnalyticsScripts` calls the same shared `ensureDataLayer` so whichever runs
first — a page's own tracking call, or `AnalyticsScripts` itself — creates the array complete with
the `js`/`config` entries, so `config` always precedes any `event` push regardless of component
tree position. Verified via a dedicated check (asserting `view_home` from a pre-consent page load
is never retroactively reported once consent flips granted mid-page — the *intended* behaviour, not
a bug: an event that happened before the visitor consented must never be reported after) and 16
other live checks against a real `next start` production build, all passing after the fix.

## Verification
`typecheck`/`lint`/`test` clean (549 tests, up from 539 — 10 new: `analytics-consent.test.ts`,
`analytics-track.test.ts`). Zero-credential `npm run build` clean (GA4 code paths compile fine with
no measurement ID configured, matching the current real `.env.local`). Full e2e suite re-run
against the live-backed dev server after all changes — all 11 `accessibility.spec.ts` axe scans,
all 28 `product-families.spec.ts`, `catalogue-browse.spec.ts`, `admin-collections.spec.ts`, and all
5 core Tools' specs (keyboard + mobile viewport) — 54 tests, no regressions, confirming the new
`TrackedClick`/`TrackView` wrappers don't affect layout or the accessibility tree.

Live-verified end to end against a real `next build && next start` production run (`.env.local`'s
live Supabase, `NEXT_PUBLIC_SITE_URL=http://localhost:3000` — the origin-check on
`/api/templates/view` needed the request's actual origin to match this, since it's a pre-existing
CSRF guard unrelated to this phase) with a throwaway `NEXT_PUBLIC_GA_MEASUREMENT_ID`:
- Banner shown pre-consent; equal-size Accept/Reject; no `dataLayer` at all pre-consent.
- Accept → banner gone, consent persisted, `dataLayer` seeded with `config`; a fresh page load
  (consent already granted) fires `view_home`; the pre-consent page's own `view_home` is correctly
  never retroactively reported.
- Footer "Cookie preferences" re-shows the banner and clears consent; re-accepting works.
- `view_framework` fires on the family page; clicking "Next step" fires `click_next_step`.
- `view_guide` fires on a core-family guide page.
- Completing the Product Idea Assessor Tool end to end fired, in order:
  `view_tool → start_tool → complete_tool → view_tool_result → complete_core_step`.
- Requesting and viewing a free Template fired `complete_free_download` + `complete_core_step` on
  the `/view` page (confirmed); `start_free_download` is fired synchronously in `ViewForm` before
  the redirect in the same non-async callback (verified by code inspection + the `trackEvent` unit
  tests, not directly captured live — the redirect that immediately follows it in the same tick
  makes it impractical to externally observe the intermediate `dataLayer` state without racing the
  navigation itself).

## Follow-up (Phase 5 scope, not done this pass)
- **Performance/Lighthouse audits** — not attempted.
- **Security audit** — not attempted (beyond noting the pre-existing origin-check pattern above).
- **Analytics dashboards** (spec §40: "for progression and return") — GA4-side configuration, not
  application code; needs a real measurement ID first.
- **Legal/support readiness review** — `/legal/cookies` was updated to describe what's actually
  built, but a full legal review of all `/legal/*` pages wasn't attempted.
- **Broken-link/visibility/sitemap verification, operational review of visual generation/Supabase/
  auth/commerce, §41/§42 checklist sign-off** — none attempted; these are audit passes over the
  whole site, not incremental feature work, and deserve their own dedicated pass per the same
  scoping discipline every prior phase used.
- **Remaining §25.2 events not wired**: `view_journey_stage`, `view_bundle`, `progress_tool`
  (per-question granularity), `save_run`/`reopen_tool_run`/`export_tool_result`, checkout/
  purchase events (checkout isn't live — Stripe keys still pending per project memory),
  `sign_in_requested`/`sign_in_completed`, `view_library`, `submit_contact_form`/`submit_feedback`,
  `start_finder`/`complete_finder`. This pass scoped to the Core Collection funnel specifically
  (§25.4); the remaining events belong to surfaces outside that funnel or aren't live yet.
- `start_next_family` was deliberately not built as a discrete event — a `view_framework` for a
  family reached via `click_next_step` is already distinguishable in GA4 by looking at the two
  events together; a redundant discrete event wasn't worth the added instrumentation.
