# 0050 — OpenAI as a second Visual Asset System provider (spec v6 adopted)

## Status
Accepted

## Context
Spec moved from v4 to v5 on 2026-08-11 (`d8795ff`) and v5 has now been fully built out through the
admin Visuals workspace (`0045`–`0049`). `docs/Incytemplates-website-spec-v6.md` sat untracked in
the working tree; adopted as the new spec of record in `ed76d12`, at the user's explicit request
("start building spec v6"). v6 retains v5's product model and Visual Asset System completely
unchanged — its only functional delta is adding **OpenAI as a first-class optional
image-generation provider** behind the existing provider-neutral `VisualGenerationProvider`
boundary (§12.7 `OpenAiVisualGenerationProvider`, §14.13 `it_visual_generation_jobs`, §34 new env
vars, §35.2 a provider-status surface, §36.7 validation). This decision covers that slice.

No live `OPENAI_API_KEY` exists yet. The adapter is built fully per spec — real `openai` SDK
calls, error mapping, prompt assembly — but the system defaults to the existing placeholder
provider so nothing regresses and nothing here required a real OpenAI network call to verify.

## Decisions

**`it_visual_generation_jobs` matches spec §14.13's DDL almost verbatim** (four new migrations,
`20260813100000`–`20260813100015`): its own status enum, the jobs table with the exact column
set, RLS, then a follow-up migration adding `it_visual_assets.generation_job_id` after the jobs
table exists (avoiding the circular-creation-order problem the spec itself flags). One deviation:
`requested_candidates between 1 and 4` is a hard DB ceiling — `VISUAL_GENERATION_MAX_CANDIDATES`
can only lower the effective cap below 4, never raise it, since a CHECK constraint can't see an
application env var. RLS posture matches `it_visual_assets`' strictest boundary (`0045`): no
anon/authenticated policy at all, since this table is pure internal generation provenance, never
read by a public page — unlike `it_visual_assets`, there isn't even a narrow public view.

**The provider interface was extended, not replaced.** v5's `VisualGenerationProvider` was a
single `generate(request)` method; v6 wants `key`, `capabilities()`, and
`generate(request, options)` (options carrying provider choice, candidate count, quality/output
profile). `candidateCount` moved off `VisualGenerationRequest` onto the new
`VisualGenerationOptions` — the request is "what to draw," options is "how many, how, and with
which provider." This is a mechanical, low-risk migration: the one production call site
(`src/server/admin/visuals.ts`) and the mock provider both needed updating either way, and no e2e
spec exercised the generate button yet (only a unit test on the mock provider did), so there was
no hidden blast radius.

**`mock` → `test`, per spec's own file tree (`providers/test-provider.ts`).** The renamed
`TestVisualGenerationProvider`'s `provider` tag written to `it_visual_assets`/audit rows changes
from `"mock"` to `"test"`. Safe: it's a free-text column, admin-only (no public exposure per the
RLS posture above), and no code branched on the literal string `"mock"`.

**`VISUAL_GENERATION_PROVIDER` defaults to `"test"` in this repo's `.env`, not spec's literal
`"openai"` example default.** No live key exists yet; defaulting to `openai` would make every
fresh checkout dead-on-arrival for this feature. `.env.example` documents both values.

**`OPENAI_API_KEY`'s "required only when provider=openai" rule is enforced in the provider
registry (`src/lib/visuals/providers/index.ts`), not as a Zod cross-field refine in
`serverEnvSchema`.** `serverEnv` is parsed once at module load and imported broadly, well beyond
anything visuals-related (e.g. `service-role-client.ts`) — a bad visuals-only config must not
crash the entire app boot for an admin-only feature. The registry is also the natural, testable
seam: `resolveVisualGenerationProvider("openai")` throws a clear config error rather than
silently falling back to `"test"` when unconfigured — an Editor who explicitly picks OpenAI
should see a config error, not placeholder SVGs masquerading as real output.

**Budget/rate guard (`src/server/admin/visual-generation-jobs.ts`) is skipped entirely for the
`"test"` provider.** Free/placeholder generation must keep working even once a real monthly
budget is configured; rate-limiting exists to protect a paid external API, not this repo's own
database. `estimated_cost_minor` is `null` for test jobs and a documented placeholder constant
(`OPENAI_ESTIMATED_COST_PER_CANDIDATE_MINOR = 8`) for OpenAI jobs — no live account/pricing data
exists to base a real figure on; the constant is named and commented specifically so it's easy to
find and replace later, matching spec's own "treat displayed cost as an estimate" instruction.

**`OPENAI_IMAGE_MODEL`'s allow-list (`gpt-image-2` default, `gpt-image-1` fallback) was checked
against the installed `openai` npm package's own TypeScript types** (`node_modules/openai/resources/images.d.ts`),
not against a live account — the installed SDK version's `ImageModel` union already includes
`gpt-image-2` as a real literal, which meaningfully de-risks this slice even without a key to test
against. The `images.generate()` call shape in `providers/openai.ts` (accepted `quality`/`size`
values, always-base64 response for GPT image models, no `response_format` param for that family)
was verified the same way. Re-verify against current OpenAI documentation before the first real
production generation, per spec §12.7.1 — the adapter's own header comment says so.

**Error mapping (`providers/openai-errors.ts`) branches on the SDK's typed error classes**
(`RateLimitError`, `BadRequestError`, `AuthenticationError`, `APIConnectionTimeoutError`, etc.),
not raw status codes, and a keyword heuristic on `code`/`type`/`message` distinguishes
`safety_blocked` from a plain `invalid_request` 400 (OpenAI doesn't expose a single typed
"content moderation" error class for the Images API). The mapped message is always a generic,
category-based string — the raw provider error is attached only as `cause` for local diagnostics,
never persisted to `error_message_safe` or shown to an Editor, since it can echo back prompt
fragments.

**Fixed a real, pre-existing test-suite gap while writing `visual-provider-registry.test.ts`:**
`import "server-only"` breaks Vitest module resolution outright (`Failed to resolve import
"server-only"`) — the package isn't an installed dependency, it only resolves inside Next.js's
own bundler. Every file under `src/server/` (and a few under `src/lib/`) has started with that
import since Phase 6, so nothing in that tree has ever been reachable from a unit test, only from
e2e/build. Fixed with the standard Vitest alias-to-stub pattern: `vitest.config.ts` now aliases
the bare `server-only` specifier to `tests/stubs/server-only.ts` (an empty module). This unblocks
unit-testing server-side code generally, not just this slice.

**Manually verified against the real admin UI and the live linked Supabase project**, same
technique as `0047`/`0048`: minted an authenticated staff session via
`supabase.auth.admin.generateLink()` + `/auth/callback/implicit`, drove a real Playwright browser
through generate → select → alt text → approve & publish against `better-decision-maker` (chosen
because it has no real visual to disturb — confirmed empty before and after), using the default
`"test"` provider through the now-refactored registry + job-lifecycle path. All four steps
succeeded in sequence; cleanup removed the inserted candidate row, its storage object and its
generation-job row, confirmed empty afterward. This proves the refactor (provider registry,
options-based interface, job creation/completion wrapping the existing upload/insert loop) didn't
regress the working v5 flow.

## Follow-up
- **Real OpenAI end-to-end verification is deliberately deferred pending a live
  `OPENAI_API_KEY`.** The SDK call shape, the true current model id, and real error-category
  coverage (safety-block wording, actual rate-limit behaviour) are all checked against installed
  SDK types and spec text only, not a live account. Re-verify before the first real production
  generation.
- **Reference-image/edit support is not implemented** (`capabilities()` reports
  `imageEdit: false, referenceImages: false`) — spec §12.7 gates it behind "only where the
  workflow genuinely benefits," and there's no account to validate that flow against yet.
- **No permanent Playwright spec covers the generate→publish flow** — this decision's
  verification, like `0047`/`0048`'s, used a one-off script, not a committed e2e test. Worth
  adding now that `server-only` is unblocked for at least unit-level coverage, though e2e
  authenticated Playwright coverage remains the still-missing permanent piece flagged since
  `0048`.
- **`OPENAI_ESTIMATED_COST_PER_CANDIDATE_MINOR` is a placeholder, not real pricing** — replace
  once an account with real billing data exists.
