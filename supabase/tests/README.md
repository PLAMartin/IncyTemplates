# Database tests (pgTAP)

These are standard Supabase pgTAP tests, written using `supabase test new -t pgtap` so
their `BEGIN; SELECT plan(n); ... SELECT * FROM finish(); ROLLBACK;` structure matches
what `supabase test db` expects.

**Execution status: not yet run.** This environment has no Docker daemon installed (both
`supabase test db` and `supabase test db --linked` shell out to Docker regardless of link
state), so these tests could only be authored, not executed, even against the linked
`Incytemplates` project. Run them once Docker is available:

```sh
supabase start
supabase test db
```

or against a linked project with `supabase test db --linked`.

## Files

- `public_catalogue_rls_test.sql` -- anon can read published products / active
  categories / active stages, and cannot read draft, archived, or scheduled-future
  products, or inactive categories/stages.
- `waitlist_signups_rls_test.sql` -- anon can INSERT into `it_waitlist_signups` but
  cannot SELECT from it at all; an authenticated non-admin also sees zero rows.
- `customer_order_entitlement_isolation_rls_test.sql` -- an authenticated customer can
  read their own `it_orders`/`it_entitlements` rows but not another customer's, using two
  faked `auth.uid()` sessions in the same transaction (the `set_config('request.jwt.claim.sub', ...)`
  technique documented by Supabase for testing RLS).
- `it_frameworks_rls_test.sql` -- anon can read published frameworks (full detail) via
  `it_frameworks` but not draft/candidate ones; anon can additionally read published and
  draft-*flagship* frameworks (narrow field set only) via the `it_frameworks_teasers` view,
  but not draft-non-flagship or candidate frameworks even through the view.
- `it_visibility_rls_test.sql` (v4/Phase 6) -- `public_visibility` enforcement on
  `it_products`/`it_frameworks`: `hidden` is unreadable by anon even when `status='published'`;
  `unlisted` remains readable at the RLS/base-table layer (only excluded from discovery by
  app-layer query filters, not RLS); `it_frameworks_teasers` requires `public_visibility =
  'public'` specifically (unlisted is excluded from that discovery surface too, unlike the
  base table); staff (tested via a faked `editor`-role profile) sees every row regardless of
  status/visibility.
- `it_content_revisions_test.sql` (v4/Phase 6) -- `it_upsert_content_draft`'s "one open draft
  per product" behaviour (a second call updates the same row rather than inserting a new
  one), `it_publish_content_revision` setting `it_products.current_content_revision_id`,
  `it_rollback_content_revision` creating a new already-published revision rather than
  mutating history, and RLS on both `it_product_content_revisions` and
  `it_tool_copy_revisions`: draft revisions are never anon-readable, published revisions are
  anon-readable only when their parent product/tool is itself published and not hidden, and
  staff can read every revision (draft or published) regardless.
- `it_visual_assets_rls_test.sql` (v5) -- `it_visual_assets` has no anon/authenticated policy
  on the base table at all (unlike content revisions, no status makes every column public-safe,
  since prompt_snapshot/provider_*/generation_metadata are always present); anon reads go
  exclusively through `it_visual_assets_public`, which excludes non-published assets and
  assets whose parent framework/product isn't itself publicly visible (no leak through a
  published asset on a hidden framework); `it_visual_asset_variants` mirrors the same
  published-only boundary; staff sees every asset and variant, any status, via the base table.
- `it_visual_asset_lifecycle_test.sql` (v5) -- `it_select_visual_candidate` allows a
  `selected` row with no `alt_text` yet (spec §9.12: alt text is added *after* selection, not
  before); `it_publish_visual_asset` still refuses to publish without `alt_text`/`decorative`
  (`visual_alt_rule`), publishing a second asset for the same framework+asset_type archives
  whichever one was previously published, and "restore" is confirmed to be the exact same
  function/action applied to a historical (archived) asset id -- publishing it again re-archives
  the one that had taken its place, without deleting or rewriting either row's history.
- `it_visual_generation_jobs_rls_test.sql` (v6) -- pure internal generation provenance, never
  read by public pages (unlike `it_visual_assets`, there is no narrow public view here at all):
  anon has zero visibility, an authenticated non-staff customer also has zero visibility (the
  RLS gate is `is_staff()`, not just "logged in"), and staff can read the base table including
  provider provenance columns (`provider_key`, etc.).
- `it_link_customer_to_profile_test.sql` -- account-linking function (spec §18.2): an
  authenticated user's unlinked `it_customers`/`it_entitlements` rows matching their own email
  get linked to their profile, a different-email customer row is left untouched, one audit log
  entry is recorded, a second call is a safe no-op (no duplicate audit row), and `anon` cannot
  call the function at all (no execute grant).

## Known environment-dependence

`customer_order_entitlement_isolation_rls_test.sql` inserts directly into `auth.users` to
create two fake authenticated users (relying on the `on_auth_user_created` trigger to
create their `it_profiles` rows). The column list used there matches the standard
Supabase Auth `auth.users` shape, but auth schema internals can vary slightly between
platform versions -- if a NOT NULL violation appears when this is first run for real,
adjust that column list to match the linked project's actual schema.
