-- Spec: 16.2 (customer policies: "Read their own orders and order items", "Read their
-- own entitlements"), 32.2 (integration tests must cover RLS policies), 32.5 (security
-- tests: RLS policy tests, IDOR checks).
--
-- NOTE ON EXECUTION: see supabase/tests/README.md -- this suite has not been run in this
-- environment (no Docker / no `supabase start`), only authored.
--
-- SIMPLIFICATION NOTE: this test fakes two authenticated sessions using the standard
-- Supabase pgTAP technique of `set local role authenticated;` plus
-- `set_config('request.jwt.claim.sub', <uuid>, true)`, since auth.uid() is implemented
-- (by the Supabase platform, not by our migrations) as reading the
-- `request.jwt.claim.sub` / `request.jwt.claims->>'sub'` session setting. This is the
-- pattern documented in Supabase's own RLS-testing guidance. It depends on the target
-- project's auth.users table shape (id, instance_id, aud, role, email,
-- encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data,
-- raw_user_meta_data), which is standard across current Supabase Auth versions but could
-- in principle drift; if `supabase test db` reports a NOT NULL violation on the
-- auth.users insert below, adjust the column list to match the linked project's actual
-- auth schema.

BEGIN;
SELECT plan(10);

-- ---------------------------------------------------------------------------------------
-- Fixtures: two fake authenticated users. Inserting into auth.users exercises (and
-- depends on) the on_auth_user_created trigger from
-- 20260728155522_functions_and_triggers.sql to auto-create the matching it_profiles row.
-- ---------------------------------------------------------------------------------------

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values
  ('00000000-0000-0000-0000-000000000000', 'c1111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated',
   'customer-a-rls-test@example.com', crypt('password', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}'),
  ('00000000-0000-0000-0000-000000000000', 'c2222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated',
   'customer-b-rls-test@example.com', crypt('password', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}');

select ok(
  exists (select 1 from public.it_profiles where id = 'c1111111-1111-1111-1111-111111111111'),
  'on_auth_user_created created a profile for fake customer A'
);

select ok(
  exists (select 1 from public.it_profiles where id = 'c2222222-2222-2222-2222-222222222222'),
  'on_auth_user_created created a profile for fake customer B'
);

insert into public.it_customers (id, profile_id, email, status) values
  ('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'customer-a-rls-test@example.com', 'active'),
  ('d2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'customer-b-rls-test@example.com', 'active');

insert into public.it_products (id, product_type, access_type, status, name, slug, short_description, price_minor) values
  ('e1111111-1111-1111-1111-111111111111', 'template', 'paid', 'published', 'Paid Template', 'paid-template-rls-test', 'A paid template', 1000);

insert into public.it_orders (id, customer_id, status, currency_code, subtotal_minor, discount_minor, tax_minor, total_minor, customer_email) values
  ('f1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'paid', 'GBP', 1000, 0, 0, 1000, 'customer-a-rls-test@example.com'),
  ('f2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'paid', 'GBP', 1000, 0, 0, 1000, 'customer-b-rls-test@example.com');

insert into public.it_entitlements (id, customer_id, profile_id, product_id) values
  ('11111111-2222-3333-4444-555555555555', 'd1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111'),
  ('22222222-3333-4444-5555-666666666666', 'd2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111');

-- ---------------------------------------------------------------------------------------
-- Simulate customer A's authenticated session.
-- ---------------------------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claim.sub', 'c1111111-1111-1111-1111-111111111111', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  (select count(*)::int from public.it_orders),
  1,
  'customer A sees exactly one order (their own)'
);

select ok(
  exists (select 1 from public.it_orders where id = 'f1111111-1111-1111-1111-111111111111'),
  'customer A can read their own order'
);

select ok(
  not exists (select 1 from public.it_orders where id = 'f2222222-2222-2222-2222-222222222222'),
  'customer A cannot read customer B''s order (IDOR check)'
);

select is(
  (select count(*)::int from public.it_entitlements),
  1,
  'customer A sees exactly one entitlement (their own)'
);

select ok(
  not exists (select 1 from public.it_entitlements where id = '22222222-3333-4444-5555-666666666666'),
  'customer A cannot read customer B''s entitlement (IDOR check)'
);

-- ---------------------------------------------------------------------------------------
-- Switch to customer B's session (same transaction, same trick used by Supabase's own
-- RLS-testing docs: request.jwt.claim.sub is a `local` session setting, so re-issuing
-- set_config swaps identity without a new connection).
-- ---------------------------------------------------------------------------------------

select set_config('request.jwt.claim.sub', 'c2222222-2222-2222-2222-222222222222', true);

select is(
  (select count(*)::int from public.it_orders),
  1,
  'customer B sees exactly one order (their own)'
);

select ok(
  exists (select 1 from public.it_orders where id = 'f2222222-2222-2222-2222-222222222222'),
  'customer B can read their own order'
);

select ok(
  not exists (select 1 from public.it_orders where id = 'f1111111-1111-1111-1111-111111111111'),
  'customer B cannot read customer A''s order (IDOR check)'
);

reset role;

SELECT * FROM finish();
ROLLBACK;
