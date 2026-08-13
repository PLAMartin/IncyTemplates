-- Spec v6 §14.13/§16: it_visual_generation_jobs is pure internal generation provenance, never
-- read by public pages -- unlike it_visual_assets (which at least has a narrow
-- it_visual_assets_public view). Confirms there is no anon/authenticated policy at all beyond
-- staff read, mirroring it_visual_assets_rls_test.sql's structure/fixtures.
--
-- NOTE ON EXECUTION: see supabase/tests/README.md -- this suite has not been run in this
-- environment (no Docker / no `supabase start`), only authored.

BEGIN;
SELECT plan(4);

-- ---------------------------------------------------------------------------------------
-- Fixtures (superuser, bypasses RLS).
-- ---------------------------------------------------------------------------------------

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000', 'c2222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated',
  'editor-visual-jobs-test@example.com', crypt('password', gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}', '{}'
);
update public.it_profiles set role = 'editor' where id = 'c2222222-2222-2222-2222-222222222222';

insert into public.it_frameworks (id, status, public_visibility, name, slug, short_description, outcome_statement, flagship) values
  ('d3333333-3333-3333-3333-333333333333', 'published', 'public', 'Jobs Test Framework', 'jobs-test-framework', 'desc', 'outcome', false);

insert into public.it_visual_recipes (id, recipe_key, version, name, status, created_by, approved_by, approved_at) values
  ('f1111111-1111-1111-1111-111111111111', 'incytemplates-jobs-test', 1, 'Jobs Test Recipe', 'approved',
   'c2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', now());

insert into public.it_visual_generation_jobs (
  id, framework_id, asset_type, provider_key, provider_model, visual_recipe_id,
  requested_candidates, status, created_by
) values
  ('a1111111-1111-1111-1111-111111111111', 'd3333333-3333-3333-3333-333333333333', 'family_card', 'openai', 'gpt-image-2',
   'f1111111-1111-1111-1111-111111111111', 2, 'completed', 'c2222222-2222-2222-2222-222222222222');

-- ---------------------------------------------------------------------------------------
-- anon: no visibility at all.
-- ---------------------------------------------------------------------------------------

set local role anon;

select is(
  (select count(*)::int from public.it_visual_generation_jobs),
  0,
  'anon cannot read the it_visual_generation_jobs table at all'
);

reset role;

-- ---------------------------------------------------------------------------------------
-- authenticated, non-staff: no visibility either (RLS gate is is_staff(), not just "logged in").
-- ---------------------------------------------------------------------------------------

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000', 'c4444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated',
  'customer-visual-jobs-test@example.com', crypt('password', gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}', '{}'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', 'c4444444-4444-4444-4444-444444444444', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  (select count(*)::int from public.it_visual_generation_jobs),
  0,
  'a signed-in customer (non-staff role) cannot read it_visual_generation_jobs'
);

reset role;

-- ---------------------------------------------------------------------------------------
-- Staff (editor role): sees the job via the base table.
-- ---------------------------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claim.sub', 'c2222222-2222-2222-2222-222222222222', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  (select count(*)::int from public.it_visual_generation_jobs where id = 'a1111111-1111-1111-1111-111111111111'),
  1,
  'staff (editor) can read the job via the base table'
);
select ok(
  exists (
    select 1 from public.it_visual_generation_jobs
    where id = 'a1111111-1111-1111-1111-111111111111' and provider_key = 'openai'
  ),
  'staff can read provider provenance columns'
);

reset role;

SELECT * FROM finish();
ROLLBACK;
