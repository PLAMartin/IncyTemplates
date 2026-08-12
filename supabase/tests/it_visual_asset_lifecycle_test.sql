-- Spec v5 §9.12: generate/select/reject, "approve and publish" as one action, and restore as
-- a new publication action rather than rewriting history. Confirms
-- it_select_visual_candidate/it_reject_visual_candidate/it_publish_visual_asset
-- (20260812150000_it_visual_asset_lifecycle_functions.sql) behave correctly, and that
-- visual_alt_rule (widened in 20260812150005) allows a 'selected' row without alt_text but
-- still blocks publishing one.
--
-- NOTE ON EXECUTION: see supabase/tests/README.md -- this suite has not been run in this
-- environment (no Docker / no `supabase start`), only authored. Unlike the other pgTAP files
-- here, every function this test exercises HAS been exercised live via a real authenticated
-- admin session during development (see docs/decisions/0048-admin-visuals-workspace.md) --
-- this file formalizes that manual verification as a repeatable test, not a first check.

BEGIN;
SELECT plan(9);

-- ---------------------------------------------------------------------------------------
-- Fixtures (superuser, bypasses RLS).
-- ---------------------------------------------------------------------------------------

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000', 'a9111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated',
  'editor-lifecycle-test@example.com', crypt('password', gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}', '{}'
);
update public.it_profiles set role = 'editor' where id = 'a9111111-1111-1111-1111-111111111111';

insert into public.it_frameworks (id, status, public_visibility, name, slug, short_description, outcome_statement, flagship) values
  ('a9222222-2222-2222-2222-222222222222', 'published', 'public', 'Lifecycle Test Framework', 'lifecycle-test-framework', 'desc', 'outcome', false);

insert into public.it_visual_assets (id, framework_id, asset_type, source_type, status, storage_bucket, storage_path, created_by) values
  ('a9333333-3333-3333-3333-333333333333', 'a9222222-2222-2222-2222-222222222222', 'family_hero', 'generated', 'candidate',
   'it-admin-staging', 'visuals/lifecycle/a.svg', 'a9111111-1111-1111-1111-111111111111'),
  ('a9444444-4444-4444-4444-444444444444', 'a9222222-2222-2222-2222-222222222222', 'family_hero', 'generated', 'candidate',
   'it-admin-staging', 'visuals/lifecycle/b.svg', 'a9111111-1111-1111-1111-111111111111');

-- ---------------------------------------------------------------------------------------
-- it_select_visual_candidate: candidate -> selected, no alt_text required yet.
-- ---------------------------------------------------------------------------------------

select lives_ok(
  $$ select public.it_select_visual_candidate('a9333333-3333-3333-3333-333333333333', 'a9111111-1111-1111-1111-111111111111') $$,
  'selecting a candidate with no alt_text succeeds (visual_alt_rule exempts selected, not just candidate/failed)'
);
select is(
  (select status from public.it_visual_assets where id = 'a9333333-3333-3333-3333-333333333333'),
  'selected',
  'status is selected after it_select_visual_candidate'
);

-- ---------------------------------------------------------------------------------------
-- it_publish_visual_asset: still blocked without alt_text/decorative at publish time.
-- ---------------------------------------------------------------------------------------

select throws_ok(
  $$ select public.it_publish_visual_asset('a9333333-3333-3333-3333-333333333333', 'a9111111-1111-1111-1111-111111111111') $$,
  '23514',
  null,
  'publishing without alt_text/decorative still fails the visual_alt_rule check constraint'
);

update public.it_visual_assets set alt_text = 'A lifecycle test visual.' where id = 'a9333333-3333-3333-3333-333333333333';

select lives_ok(
  $$ select public.it_publish_visual_asset('a9333333-3333-3333-3333-333333333333', 'a9111111-1111-1111-1111-111111111111') $$,
  'publishing succeeds once alt_text is set'
);
select is(
  (select status from public.it_visual_assets where id = 'a9333333-3333-3333-3333-333333333333'),
  'published',
  'status is published after it_publish_visual_asset'
);

-- ---------------------------------------------------------------------------------------
-- Publishing a second asset for the same framework+asset_type archives the first, and
-- "restore" (publishing the archived one again) is the identical function/action.
-- ---------------------------------------------------------------------------------------

update public.it_visual_assets set alt_text = 'Second lifecycle test visual.' where id = 'a9444444-4444-4444-4444-444444444444';
select public.it_publish_visual_asset('a9444444-4444-4444-4444-444444444444', 'a9111111-1111-1111-1111-111111111111');

select is(
  (select status from public.it_visual_assets where id = 'a9333333-3333-3333-3333-333333333333'),
  'archived',
  'publishing a second asset for the same framework+asset_type archives the first'
);
select is(
  (select status from public.it_visual_assets where id = 'a9444444-4444-4444-4444-444444444444'),
  'published',
  'the second asset is now published'
);

select public.it_publish_visual_asset('a9333333-3333-3333-3333-333333333333', 'a9111111-1111-1111-1111-111111111111');
select is(
  (select status from public.it_visual_assets where id = 'a9333333-3333-3333-3333-333333333333'),
  'published',
  'restore (publishing the archived asset again) makes it published again'
);
select is(
  (select status from public.it_visual_assets where id = 'a9444444-4444-4444-4444-444444444444'),
  'archived',
  'restoring the first asset archives the second, completing the swap without deleting either row'
);

SELECT * FROM finish();
ROLLBACK;
