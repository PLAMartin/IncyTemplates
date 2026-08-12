# 0048 — Admin Visuals workspace, a real UUID bug, and a usable authenticated test path

## Status
Accepted

## Context
`0045`/`0047` shipped the Visual Asset System's data layer and proved it end-to-end with one
hand-scripted visual; the admin UI itself — Brief editing, candidate generation/upload,
comparison, select/approve/publish, restore, and read-only Visual Recipe administration (spec
§10.12, §9.12) — was explicitly deferred as its own scoped pass, comparable in size to the whole
Phase 6 admin build. This is that pass.

Verifying it required an authenticated admin browser session, which surfaced two real,
pre-existing bugs unrelated to the new UI's own logic — both are covered below because they
would have blocked or half-broken this feature (and, in one case, most of the existing admin
panel) if left as discovered.

## Decisions

**Server/action/page layering matches `0044`'s established convention exactly**:
`src/server/admin/visuals.ts` (query/mutate, reads via session client, writes via service-role) →
`src/server/actions/admin-visuals.ts` (Zod-validate, `requireRole`, `revalidatePath`) →
`src/app/admin/visuals/**` + `src/components/admin/visual-*.tsx`. All of generate/upload/select/
reject/publish/restore sit at `requireRole("editor")`, matching spec §16.3's matrix; the separate
`/admin/visual-recipes` administration page sits at `requireRole("admin")` (Visual Recipe
activation is an Admin/Owner capability), though editors still see the active recipe's name/
version inline in the Brief form via the existing staff-read RLS policy on `it_visual_recipes` —
that's ordinary visibility, not administration.

**Three new security-definer RPC functions**
(`20260812150000_it_visual_asset_lifecycle_functions.sql`), same shape as the content-revision
functions: `it_select_visual_candidate`, `it_reject_visual_candidate`, `it_publish_visual_asset`.
The last one deliberately serves two spec-described actions with one function: "approve and
publish" (§9.12 point 9, target is a candidate/selected row) and "restore" (point 11, target is a
previously-published-then-archived row) — the mechanics are identical either way (archive
whatever else is currently published for that framework/product+asset_type slot, then publish the
target), so the codebase gets one tested function instead of two nearly-identical ones. `approved`
as an independently-persisted resting state (distinct from the same call that sets `published`) is
schema-valid but deliberately not produced by this build, since spec's own point 9 describes
"approves and publishes" as one editor action, not two.

**Signed URLs for staged (candidate) previews, public URLs for published/archived masters.**
`it-admin-staging` is a private bucket; a plain `getPublicUrl()` 404s unauthenticated. Caught
before shipping (not live): `getFrameworkVisualsForAdmin` now branches on which bucket a row is
in and calls `createSignedUrl()` (600s) for anything still staged.

**Publish promotes staging→public storage and (re)creates variants in one server-side call**,
rather than exposing "promote to public" and "regenerate derivatives" as separate admin actions.
Matches `0047`'s own simplification (variants share the master's bytes; no image-processing
dependency exists yet) and keeps the UI to one "Approve & publish" button rather than a
multi-step wizard for something spec treats as one explicit action anyway.

**Bug found and fixed: `z.uuid()` silently rejects most of this codebase's real framework/product
ids.** Clicking "Generate candidates" against a real, live framework failed with "Invalid UUID."
`z.uuid()` enforces RFC4122 version/variant nibbles; `scripts/lib/deterministic-uuid.ts` (used for
every framework/product ever seeded via `scripts/seed.ts` — i.e. this database's entire catalogue)
is raw SHA256 hex slicing with no attempt to force those nibbles, so each id only has roughly a
1-in-8 chance of passing `z.uuid()` by coincidence. This is not new to this feature —
`admin-frameworks.ts`, `admin-products.ts`, `admin-templates.ts` and `admin-guides.ts` all had the
identical latent bug on their `frameworkId`/`productId` fields, just never exercised with a real
authenticated click-through against real seeded content until now (the whole Phase 6 build was
verified via typecheck/lint/tests/build and a static sign-in-page screenshot, never an actual
content-edit click). Fixed everywhere at once: `src/lib/utils/id.ts` exports `zId`, a relaxed
"looks like a UUID" regex with no version/variant constraint, safe because it's a strict superset
of what `z.uuid()` accepts — genuine Postgres `gen_random_uuid()` ids (revision ids, asset ids)
still pass either check, so those fields deliberately keep `z.uuid()` unchanged; only the
deterministic-id fields (`frameworkId`, `productId`) were switched to `zId`.

**Bug found and fixed: the original `visual_alt_rule` constraint didn't match spec's actual
flow.** `it_select_visual_candidate`'s `candidate → selected` update was rejected by the CHECK
constraint from `0045`, which only exempted `candidate`/`failed` from requiring `alt_text`. But
spec §9.12 describes alt text as added *after* selection ("7. The editor reviews candidates...
8. The selected asset receives required alt text..."), not before. Fixed in
`20260812150005_it_visual_assets_alt_rule_allow_selected.sql` by widening the exemption to include
`selected` — `approved`/`published` still correctly require `alt_text` or `decorative = true`,
enforced at the DB layer regardless of what the admin UI does or doesn't check client-side.

**A real fix for the long-flagged "no way to mint an authenticated admin session in a test
context" gap** (`tests/e2e/admin-auth.spec.ts`'s own top comment, unresolved since `0044`).
`supabase.auth.admin.generateLink()` — the exact technique that comment named — can't produce a
`?code=` PKCE exchange, because PKCE requires a `code_challenge` registered by a real
`signInWithOtp()` call, which the admin API never makes; it can only respond with implicit-flow
`#access_token=`/`#refresh_token=` URL fragments. `/auth/callback/route.ts` (the real production
path — confirmed still correctly wired by observing the PKCE `code_verifier` cookie actually get
set after submitting the real sign-in form) only ever handles `?code=`, so following an
admin-generated link redirected straight to `/sign-in?error=link-invalid-or-expired`. A server
Route Handler structurally cannot read a URL fragment (browsers never send it in the HTTP
request), so the fix is a client page —
`src/app/auth/callback/implicit/page.tsx` — that reads `window.location.hash` and calls
`getSupabaseBrowserClient().auth.setSession()` (cookie-persisted, so subsequent server-rendered
requests see it too). Added to `additional_redirect_urls` via a targeted Management API PATCH
(same reasoning as the earlier `site_url` fix: avoid a full `supabase config push` re-touching
unrelated auth settings). This is genuinely how every screenshot/verification in this decision doc
and `0047` gets an authenticated session — not a theoretical unblocking, the actual mechanism
used.

## Follow-up
- **Visual Recipe creation/activation UI still isn't built** (`/admin/visual-recipes` is
  read-only) — only one recipe exists, so there's nothing to activate yet; still done via
  `scripts/seed-visual-recipe.ts` when it's needed.
- **Catalogue-card (`family_card`) rendering** is still only wired into the family page's hero
  slot (`0047`'s Follow-up), not `FrameworkCard`/listing surfaces.
- **True raster derivatives and the `next/image`-vs-SVG decision** — both still deferred, same as
  `0047`.
- **A permanent, repeatable authenticated e2e spec** using the new `/auth/callback/implicit` path
  doesn't exist yet — this pass used one-off scripts for verification, not a committed Playwright
  test. Worth adding given the mechanism now exists and works.
