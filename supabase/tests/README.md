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

## Known environment-dependence

`customer_order_entitlement_isolation_rls_test.sql` inserts directly into `auth.users` to
create two fake authenticated users (relying on the `on_auth_user_created` trigger to
create their `it_profiles` rows). The column list used there matches the standard
Supabase Auth `auth.users` shape, but auth schema internals can vary slightly between
platform versions -- if a NOT NULL violation appears when this is first run for real,
adjust that column list to match the linked project's actual schema.
