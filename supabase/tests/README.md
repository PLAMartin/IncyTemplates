# Database tests (pgTAP)

These are standard Supabase pgTAP tests, written using `supabase test new -t pgtap` so
their `BEGIN; SELECT plan(n); ... SELECT * FROM finish(); ROLLBACK;` structure matches
what `supabase test db` expects.

**Execution status: not yet run.** This environment has no Docker daemon and no linked
Supabase project (`supabase status` fails with "Cannot connect to the Docker daemon"), so
these tests could only be authored, not executed. Run them once a local stack is
available:

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

## Known environment-dependence

`customer_order_entitlement_isolation_rls_test.sql` inserts directly into `auth.users` to
create two fake authenticated users (relying on the `on_auth_user_created` trigger to
create their `it_profiles` rows). The column list used there matches the standard
Supabase Auth `auth.users` shape, but auth schema internals can vary slightly between
platform versions -- if a NOT NULL violation appears when this is first run for real,
adjust that column list to match the linked project's actual schema.
