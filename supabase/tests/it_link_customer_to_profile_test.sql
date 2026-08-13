-- Spec §18.2 (account linking: "find matching unlinked customer record", "link
-- it_customers.profile_id", "populate it_entitlements.profile_id", "record an audit event").
-- Confirms it_link_customer_to_profile() only ever links records matching the caller's own
-- verified email, is idempotent, and cannot be called by anon at all.
--
-- NOTE ON EXECUTION: see supabase/tests/README.md -- this suite has not been run in this
-- environment (no Docker / no `supabase start`), only authored. Same auth.users fixture
-- technique as customer_order_entitlement_isolation_rls_test.sql.

BEGIN;
SELECT plan(8);

-- ---------------------------------------------------------------------------------------
-- Fixtures: one auth user ("linkme@..."), plus two unlinked it_customers rows -- one with
-- the matching email (should get linked), one with a different email (should not).
-- ---------------------------------------------------------------------------------------

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000', 'c3333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated',
  'linkme-test@example.com', crypt('password', gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}', '{}'
);

insert into public.it_customers (id, profile_id, email, status) values
  ('d3333333-3333-3333-3333-333333333333', null, 'linkme-test@example.com', 'active'),
  ('d4444444-4444-4444-4444-444444444444', null, 'someone-else-test@example.com', 'active');

insert into public.it_products (id, product_type, access_type, status, name, slug, short_description, price_minor) values
  ('e3333333-3333-3333-3333-333333333333', 'template', 'paid', 'published', 'Paid Template', 'paid-template-link-test', 'A paid template', 900);

insert into public.it_entitlements (id, customer_id, profile_id, product_id) values
  ('a3333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', null, 'e3333333-3333-3333-3333-333333333333'),
  ('a4444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', null, 'e3333333-3333-3333-3333-333333333333');

-- ---------------------------------------------------------------------------------------
-- anon cannot call the function at all (no execute grant) -- checked before the real call
-- so it doesn't consume the fixture state the later assertions depend on.
-- ---------------------------------------------------------------------------------------

set local role anon;
select throws_ok(
  'select public.it_link_customer_to_profile()',
  '42501',
  null,
  'anon cannot call it_link_customer_to_profile (no execute grant)'
);
reset role;

-- ---------------------------------------------------------------------------------------
-- Simulate the matching auth user's session and call the function.
-- ---------------------------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claim.sub', 'c3333333-3333-3333-3333-333333333333', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  'select public.it_link_customer_to_profile()',
  'it_link_customer_to_profile() runs without error for a signed-in user with a matching unlinked customer row'
);

reset role;

-- ---------------------------------------------------------------------------------------
-- Assertions (superuser, bypasses RLS -- checking the actual data, not what a session can see).
-- ---------------------------------------------------------------------------------------

select is(
  (select profile_id from public.it_customers where id = 'd3333333-3333-3333-3333-333333333333'),
  'c3333333-3333-3333-3333-333333333333'::uuid,
  'the matching-email customer row got linked to the caller''s profile'
);

select is(
  (select profile_id from public.it_entitlements where id = 'a3333333-3333-3333-3333-333333333333'),
  'c3333333-3333-3333-3333-333333333333'::uuid,
  'the matching customer''s entitlement got linked too'
);

select ok(
  (select profile_id from public.it_customers where id = 'd4444444-4444-4444-4444-444444444444') is null,
  'the different-email customer row was not touched'
);

select ok(
  (select profile_id from public.it_entitlements where id = 'a4444444-4444-4444-4444-444444444444') is null,
  'the different-email customer''s entitlement was not touched'
);

select is(
  (select count(*)::int from public.it_audit_log where action = 'customer_linked_to_profile' and entity_id = 'd3333333-3333-3333-3333-333333333333'),
  1,
  'exactly one audit log entry was recorded for the link'
);

-- ---------------------------------------------------------------------------------------
-- Idempotency: calling again with nothing left to link is a safe no-op, no duplicate audit row.
-- ---------------------------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claim.sub', 'c3333333-3333-3333-3333-333333333333', true);
select public.it_link_customer_to_profile();
reset role;

select is(
  (select count(*)::int from public.it_audit_log where action = 'customer_linked_to_profile' and entity_id = 'd3333333-3333-3333-3333-333333333333'),
  1,
  'calling it_link_customer_to_profile() again does not duplicate the audit log entry'
);

SELECT * FROM finish();
ROLLBACK;
