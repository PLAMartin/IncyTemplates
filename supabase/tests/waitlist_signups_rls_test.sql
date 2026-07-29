-- Spec: task-added it_waitlist_signups table (not in the technical spec; see
-- supabase/migrations/20260728155520_waitlist_signups.sql), tested per 32.2/32.5's
-- general requirement to cover RLS policies with tests.
--
-- NOTE ON EXECUTION: see supabase/tests/README.md -- this suite has not been run in this
-- environment (no Docker / no `supabase start`), only authored.
--
-- Verifies: anon can INSERT a waitlist signup, but cannot SELECT from the table at all
-- (it has no SELECT grant/policy for anon); an ordinary authenticated (non-admin) user
-- has the table-level SELECT grant needed for admin staff to read the table, but RLS
-- filters every row away because they are not an admin.

BEGIN;
SELECT plan(4);

insert into public.it_products (id, product_type, access_type, status, name, slug, short_description, price_minor) values
  ('b1111111-1111-1111-1111-111111111111', 'template', 'free', 'published', 'Waitlist Product', 'waitlist-product-rls-test', 'A product with a waitlist CTA', 0);

set local role anon;

select lives_ok(
  $$ insert into public.it_waitlist_signups (product_id, email, source)
     values ('b1111111-1111-1111-1111-111111111111', 'visitor@example.com', 'product_page') $$,
  'anon can insert a waitlist signup'
);

-- it_waitlist_signups has no SELECT grant at all for anon (see the grants section of
-- 20260728155524_row_level_security.sql), so a SELECT does not just return zero rows --
-- it fails outright with a permission error, one layer below RLS.
select throws_ok(
  $$ select * from public.it_waitlist_signups $$,
  'anon cannot select from it_waitlist_signups at all (no SELECT privilege granted to anon)'
);

reset role;

-- Confirm, from a role that bypasses RLS, that the anon insert really did persist a row
-- rather than being silently dropped.
select is(
  (select count(*)::int from public.it_waitlist_signups),
  1,
  'the anon insert actually persisted a row'
);

-- An ordinary authenticated (non-admin, no matching it_profiles row at all here) user
-- does have the table-level SELECT grant (needed so the admin policy below has something
-- to narrow), but the "admin staff can read waitlist signups" policy requires
-- public.is_admin() to be true, so a non-admin sees nothing.
set local role authenticated;
select set_config('request.jwt.claim.sub', 'c9999999-9999-9999-9999-999999999999', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  (select count(*)::int from public.it_waitlist_signups),
  0,
  'an authenticated non-admin user sees zero waitlist signups'
);

reset role;

SELECT * FROM finish();
ROLLBACK;
