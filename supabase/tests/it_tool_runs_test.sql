-- Spec v6 §14.12 (`it_tool_runs`) + the account-linking-style claim function
-- (it_claim_anonymous_tool_runs, 20260813170015). Confirms: an owner can read their own saved
-- runs but not another owner's; anon has no visibility at all (no SELECT policy, and writes go
-- through the service-role client, not a client-side INSERT policy); staff can read every run;
-- claiming links a matching anonymous row to the caller and is idempotent; anon cannot call the
-- claim function.
--
-- NOTE ON EXECUTION: see supabase/tests/README.md -- this suite has not been run in this
-- environment (no Docker / no `supabase start`), only authored. Same auth.users fixture
-- technique as it_link_customer_to_profile_test.sql.

BEGIN;
SELECT plan(9);

-- ---------------------------------------------------------------------------------------
-- Fixtures (superuser, bypasses RLS): two signed-in owners, a staff editor, a published Tool
-- product, one run owned by each user, and one anonymous run that the first owner will claim.
-- ---------------------------------------------------------------------------------------

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values
  ('00000000-0000-0000-0000-000000000000', 'c5555555-5555-5555-5555-555555555555', 'authenticated', 'authenticated',
   'run-owner-test@example.com', crypt('password', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}'),
  ('00000000-0000-0000-0000-000000000000', 'c6666666-6666-6666-6666-666666666666', 'authenticated', 'authenticated',
   'run-other-test@example.com', crypt('password', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}'),
  ('00000000-0000-0000-0000-000000000000', 'c7777777-7777-7777-7777-777777777777', 'authenticated', 'authenticated',
   'run-staff-test@example.com', crypt('password', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}');

update public.it_profiles set role = 'editor' where id = 'c7777777-7777-7777-7777-777777777777';

insert into public.it_products (id, product_type, access_type, status, tool_key, name, slug, short_description) values
  ('e5555555-5555-5555-5555-555555555555', 'tool', 'free', 'published', 'run-test-tool', 'Run Test Tool', 'run-test-tool', 'A tool');

insert into public.it_tool_runs (id, product_id, profile_id, anonymous_session_id, status, tool_schema_version) values
  ('b5555555-5555-5555-5555-555555555555', 'e5555555-5555-5555-5555-555555555555', 'c5555555-5555-5555-5555-555555555555', null, 'completed', 1),
  ('b6666666-6666-6666-6666-666666666666', 'e5555555-5555-5555-5555-555555555555', 'c6666666-6666-6666-6666-666666666666', null, 'completed', 1),
  ('b7777777-7777-7777-7777-777777777777', 'e5555555-5555-5555-5555-555555555555', null, '77777777-aaaa-bbbb-cccc-777777777777', 'completed', 1);

-- ---------------------------------------------------------------------------------------
-- anon: no visibility at all, and cannot call the claim function either.
-- ---------------------------------------------------------------------------------------

set local role anon;

select is(
  (select count(*)::int from public.it_tool_runs),
  0,
  'anon cannot read the it_tool_runs table at all'
);

select throws_ok(
  'select public.it_claim_anonymous_tool_runs(''77777777-aaaa-bbbb-cccc-777777777777''::uuid)',
  '42501',
  null,
  'anon cannot call it_claim_anonymous_tool_runs (no execute grant)'
);

reset role;

-- ---------------------------------------------------------------------------------------
-- Owner: sees only their own run, not the other owner's or the still-anonymous one.
-- ---------------------------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claim.sub', 'c5555555-5555-5555-5555-555555555555', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  (select count(*)::int from public.it_tool_runs),
  1,
  'the owner sees exactly one run (their own)'
);

select is(
  (select id from public.it_tool_runs limit 1),
  'b5555555-5555-5555-5555-555555555555'::uuid,
  'the visible run is the owner''s own row, not another owner''s'
);

reset role;

-- ---------------------------------------------------------------------------------------
-- Staff: sees every run regardless of owner.
-- ---------------------------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claim.sub', 'c7777777-7777-7777-7777-777777777777', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  (select count(*)::int from public.it_tool_runs),
  3,
  'staff can read every tool run regardless of owner'
);

reset role;

-- ---------------------------------------------------------------------------------------
-- Claim: the first owner claims the anonymous run matching their session id.
-- ---------------------------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claim.sub', 'c5555555-5555-5555-5555-555555555555', true);

select lives_ok(
  'select public.it_claim_anonymous_tool_runs(''77777777-aaaa-bbbb-cccc-777777777777''::uuid)',
  'it_claim_anonymous_tool_runs() runs without error for a signed-in user with a matching anonymous run'
);

reset role;

select is(
  (select profile_id from public.it_tool_runs where id = 'b7777777-7777-7777-7777-777777777777'),
  'c5555555-5555-5555-5555-555555555555'::uuid,
  'the anonymous run got claimed by the caller'
);

select ok(
  (select anonymous_session_id from public.it_tool_runs where id = 'b7777777-7777-7777-7777-777777777777') is null,
  'anonymous_session_id was cleared once claimed'
);

-- ---------------------------------------------------------------------------------------
-- Idempotency: calling again with nothing left to claim is a safe no-op.
-- ---------------------------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claim.sub', 'c5555555-5555-5555-5555-555555555555', true);
select public.it_claim_anonymous_tool_runs('77777777-aaaa-bbbb-cccc-777777777777'::uuid);
reset role;

select is(
  (select profile_id from public.it_tool_runs where id = 'b7777777-7777-7777-7777-777777777777'),
  'c5555555-5555-5555-5555-555555555555'::uuid,
  'calling it_claim_anonymous_tool_runs() again does not change the already-claimed row'
);

SELECT * FROM finish();
ROLLBACK;
