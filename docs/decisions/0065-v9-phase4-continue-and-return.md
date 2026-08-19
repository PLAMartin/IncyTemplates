# 0065 — v9 Phase 4: continue and return

## Status
Complete and live-verified; not yet committed. Covers spec v9 §40 Phase 4's two headline
deliverables — anonymous local progress state and the "Continue your product journey" module —
and their exit criteria ("returning visitor can resume from real prior activity", "no sensitive
Tool content is stored in lightweight progress"). Authenticated progress integration, a feedback
prompt, and return analytics are scoped out — see Follow-up.

## Context
Phases 1–3 made the five-step Core Collection the site's primary structure, but a returning
visitor got no acknowledgement of what they'd already done — every visit to the homepage looked
identical to a first-time visitor's. Spec §9.3/§12.3.2 define exactly what's wanted: a
privacy-safe, anonymous, browser-local record of navigation/completion (never Tool content), and
a homepage/collection-page module that says "you did X, next is Y" — derived from real activity,
never fabricated.

## What was built

**`src/lib/progress/collection-progress.ts`** — the exact shape spec §9.3 gives, nothing more:
`collection_slug`, `last_framework_slug`, `last_output_type`, `completed_framework_slugs[]`,
`last_visited_at`, in `localStorage` under `it_collection_progress_v1`. `recordVisit` updates
"where you are"; `recordCompletion` additionally adds to `completed_framework_slugs`. Switching
`collection_slug` resets completion (this tracks one active journey, matching spec's singular —
not per-collection-keyed — example shape). Every read/write is wrapped in try/catch and no-ops
when storage is unavailable (private browsing, quota, disabled) — recording progress must never
break the page it's called from.

**Wired into the 5 core families' pages only** (never non-core — this progress state is
meaningfully scoped to "your product journey", not general site browsing):
- **Visit** recorded on Guide (`guides/[slug]/page.tsx`), Template (`templates/[slug]/page.tsx`)
  and Tool (`tools/[toolKey]/page.tsx`) pages, gated on the framework actually being a member of
  the active core collection (checked against `getActiveCoreCollection()`, same pattern Phase 3's
  `CollectionStepBadge` established).
- **Completion** recorded at two concrete, real signals — never inferred: a Tool reaching its
  result screen (added to all 5 core Tool Runners' `phase === "result"` branch — each hardcodes
  its own known `frameworkSlug`, not threaded through the shared `TOOL_RUNNERS` prop type, for the
  same reason Phase 2's Tool worked-example map stayed a static per-tool-key lookup rather than
  broadening a type shared by all 26 differently-shaped Runners), and a free Template's view page
  actually rendering (`templates/[slug]/view/page.tsx`, reached only after a valid signed view
  grant — a real access event, not just an intent to view).

**`ContinueJourney` component** (`src/components/collections/continue-journey.tsx`), mounted on
the homepage and the Collection page: reads progress via `useCollectionProgress` and renders one
of three states, in order of precedence — all five steps completed (congratulatory, no dead-end
CTA); a step completed with a next step available ("You completed X. Next: Y." + a CTA to the
next family's page); or, with no completions yet, "Continue where you left off" pointing back to
the last-visited family. Renders nothing when there's no matching local progress, or when the
stored `collection_slug` doesn't match the collection being viewed. Always links to the **family
page** (`/products/[slug]`), never a guessed exact Guide/Template/Tool URL — a Template's slug
doesn't match its framework's slug, so the family page is the only link this component can
construct correctly in every case.

## Two real bugs found and fixed

**1. `react-hooks/set-state-in-effect` (a genuine, non-optional lint error in this repo's
config, not a style suggestion).** The obvious first implementation — `useEffect` calling
`setProgress(readProgress())` once on mount — is exactly the anti-pattern this rule flags,
including with only one setState call (not just "multiple calls cause cascading renders" as the
literal error text suggests). **Fixed properly, not suppressed**: rewrote
`collection-progress.ts` around `useSyncExternalStore` — the React-recommended primitive for
"read a browser-only API into render without a hydration mismatch" — with a `getServerSnapshot`
that always returns `null` (matching SSR, where `localStorage` doesn't exist) and a cached
`getSnapshot` (`readProgress` itself, now caching against the raw stored string so repeated calls
return a referentially-stable object when nothing changed — required, or `useSyncExternalStore`
either infinite-loops or logs React's "getSnapshot should be cached" warning). General lesson for
this codebase: **any future "read localStorage/sessionStorage/a browser-only global into
component state" need should reach for `useSyncExternalStore` directly, not `useEffect` +
`useState`** — the lint config will reject the naive version anyway.

**2. `window.localStorage` was `undefined` in every unit test in this environment**, discovered
while writing this phase's own test coverage. Root cause traced with a standalone Node/jsdom
repro (not guessed): jsdom 27+ delegates `localStorage`/`sessionStorage` to Node's own
experimental `node:internal/webstorage` (added Node 22+), which silently doesn't work without a
`--localstorage-file <path>` CLI flag — explaining the `"ExperimentalWarning: localStorage is not
available"` line every test run already printed, previously unremarked on since nothing had
touched `localStorage` before this phase. Confirmed a real URL (non-opaque origin) alone does
**not** fix it under vitest's jsdom environment specifically, even though it does for a raw
standalone `jsdom` instantiation — ruled out before landing on the actual fix. **Fixed** by
installing a minimal in-memory `Storage`-compatible polyfill in `vitest.setup.ts` whenever the
real implementation is missing or throws, following the same "stub the environment gap centrally"
precedent `tests/stubs/server-only.ts` already set in this repo. Real browsers always have a
working `localStorage`, so this only ever activates in tests, never in the deployed app.

## Verification
New unit coverage (`tests/unit/collection-progress.test.ts`, 9 tests): visit vs. completion
semantics, accumulation without duplication, never removing a completed family, the
collection-slug-switch reset, malformed/wrong-shaped stored JSON handled without throwing, and an
explicit assertion that the stored object never contains any field beyond the 5 spec-defined ones
(the "no Tool content leakage" guarantee, checked structurally, not just by convention).
`typecheck`/`lint`/`test` (539 tests, up from 530) all clean; zero-credential `npm run build`
clean. Live-verified end to end against the real project: completing the Product Idea Assessor
Tool → homepage correctly shows "You completed Assess the idea. Next: Understand customers." with
a working CTA (confirmed via direct `localStorage` inspection, not just a screenshot); visiting a
Guide with no completions yet → homepage correctly shows "Continue where you left off — Scope the
MVP — Guide"; a synthetic all-five-complete state → the congratulatory no-dead-end state (all
three branches screenshot-confirmed, one only after tracing down a screenshot-clipping red
herring — the module renders correctly *after* the five-step grid, not between the hero and the
grid as first assumed, so an early too-short screenshot clip looked like a missing feature until
a full-page capture and a direct bounding-box check settled it). Re-ran 54 e2e tests against the
live-backed dev server after all changes — full `accessibility.spec.ts` (11 scans, including the
Tool result state now wrapping `RecordProgressCompletion`), all 5 core Tools' specs (keyboard +
mobile-viewport coverage), all 28 `product-families.spec.ts`, `catalogue-browse.spec.ts` — all
pass, no regressions.

## Follow-up (Phase 4 scope, not done this pass)
- **Feedback prompt at completion/result points** (spec §5.4/§40) — deliberately not built. This
  needs a real schema/write-path decision (a new table, RLS, spam/abuse handling for an anonymous
  write endpoint) that shouldn't be improvised as a side effect of a progress-tracking pass — the
  admin sitemap (§7.6) already lists `/admin/feedback` as a future surface, suggesting this was
  always meant to be its own slice.
- **Optional authenticated progress integration** (spec §9.3: "Authenticated users may later
  persist equivalent progress server-side") — not built; no concrete justification (cross-device
  resume, richer saved-work linkage) has been raised yet, and spec is explicit this should only
  be added "when justified", not by default.
- **Return analytics / 7-day and 30-day return measurement** — genuinely Phase 5 scope per §40's
  own phase split; not attempted here. This phase only builds the *state* a future analytics pass
  would measure against.
- Cross-family **context handoff** ("only with explicit user control", §5.4) — not built; the
  lightweight progress state never carries Tool content by design, so there is nothing to hand off
  yet regardless.
