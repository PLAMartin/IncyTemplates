-- Spec v5 §16.1: "Published/current Visual Asset metadata and public variants required by
-- the requested page; never candidate/selected/admin-only prompt metadata." Confirms
-- it_visual_assets has no anon/authenticated policy at all (public reads go exclusively
-- through it_visual_assets_public), that the public view excludes non-published assets and
-- assets whose parent framework/product isn't itself publicly visible, and that
-- it_visual_asset_variants mirrors the same published-only boundary.
--
-- NOTE ON EXECUTION: see supabase/tests/README.md -- this suite has not been run in this
-- environment (no Docker / no `supabase start`), only authored.

BEGIN;
SELECT plan(10);

-- ---------------------------------------------------------------------------------------
-- Fixtures (superuser, bypasses RLS).
-- ---------------------------------------------------------------------------------------

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000', 'c1111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated',
  'editor-visual-test@example.com', crypt('password', gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}', '{}'
);
update public.it_profiles set role = 'editor' where id = 'c1111111-1111-1111-1111-111111111111';

insert into public.it_frameworks (id, status, public_visibility, name, slug, short_description, outcome_statement, flagship) values
  ('d1111111-1111-1111-1111-111111111111', 'published', 'public', 'Public Framework', 'public-framework-visual-test', 'desc', 'outcome', false),
  ('d2222222-2222-2222-2222-222222222222', 'published', 'hidden', 'Hidden Framework', 'hidden-framework-visual-test', 'desc', 'outcome', false);

insert into public.it_visual_assets (
  id, framework_id, asset_type, source_type, status, alt_text, decorative,
  storage_bucket, storage_path, created_by
) values
  ('e1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'family_card', 'rendered', 'published',
   'A converging-notes diagram for Product Idea Assessor', false,
   'it-public-assets', 'visuals/d1111111-1111-1111-1111-111111111111/e1111111-1111-1111-1111-111111111111/master/card.svg',
   'c1111111-1111-1111-1111-111111111111'),
  ('e2222222-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111', 'family_card', 'generated', 'candidate',
   null, false, null, null,
   'c1111111-1111-1111-1111-111111111111'),
  ('e3333333-3333-3333-3333-333333333333', 'd2222222-2222-2222-2222-222222222222', 'family_card', 'rendered', 'published',
   'A visual for a hidden framework', false,
   'it-public-assets', 'visuals/d2222222-2222-2222-2222-222222222222/e3333333-3333-3333-3333-333333333333/master/card.svg',
   'c1111111-1111-1111-1111-111111111111');

insert into public.it_visual_asset_variants (visual_asset_id, variant_key, storage_bucket, storage_path, width, height, format) values
  ('e1111111-1111-1111-1111-111111111111', 'card_md', 'it-public-assets', 'visuals/.../card_md.webp', 480, 320, 'webp'),
  ('e2222222-2222-2222-2222-222222222222', 'card_md', 'it-admin-staging', 'visuals/.../candidate_card_md.webp', 480, 320, 'webp');

-- ---------------------------------------------------------------------------------------
-- anon: base it_visual_assets table is never readable, regardless of status.
-- ---------------------------------------------------------------------------------------

set local role anon;

select is(
  (select count(*)::int from public.it_visual_assets where id::text like 'e%-1111-1111-1111-%'),
  0,
  'anon cannot read the it_visual_assets base table at all, even a published row'
);

-- ---------------------------------------------------------------------------------------
-- anon: it_visual_assets_public exposes only the published, publicly-visible-parent asset.
-- ---------------------------------------------------------------------------------------

select is(
  (select count(*)::int from public.it_visual_assets_public where id in (
    'e1111111-1111-1111-1111-111111111111',
    'e2222222-2222-2222-2222-222222222222',
    'e3333333-3333-3333-3333-333333333333'
  )),
  1,
  'anon sees exactly one of the three fixture assets via the public view'
);
select ok(
  exists (select 1 from public.it_visual_assets_public where id = 'e1111111-1111-1111-1111-111111111111'),
  'anon can read the published asset on a published framework via the public view'
);
select ok(
  not exists (select 1 from public.it_visual_assets_public where id = 'e2222222-2222-2222-2222-222222222222'),
  'anon cannot read a candidate (unpublished) asset via the public view'
);
select ok(
  not exists (select 1 from public.it_visual_assets_public where id = 'e3333333-3333-3333-3333-333333333333'),
  'anon cannot read a published asset whose parent framework is hidden (no leak through the public view)'
);

-- ---------------------------------------------------------------------------------------
-- anon: it_visual_asset_variants mirrors the same published-only boundary.
-- ---------------------------------------------------------------------------------------

select ok(
  exists (select 1 from public.it_visual_asset_variants where visual_asset_id = 'e1111111-1111-1111-1111-111111111111'),
  'anon can read variants of the published, publicly-visible asset'
);
select ok(
  not exists (select 1 from public.it_visual_asset_variants where visual_asset_id = 'e2222222-2222-2222-2222-222222222222'),
  'anon cannot read variants of a candidate asset'
);

reset role;

-- ---------------------------------------------------------------------------------------
-- Staff (editor role): sees every asset, every status, via the base table.
-- ---------------------------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claim.sub', 'c1111111-1111-1111-1111-111111111111', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  (select count(*)::int from public.it_visual_assets where id in (
    'e1111111-1111-1111-1111-111111111111',
    'e2222222-2222-2222-2222-222222222222',
    'e3333333-3333-3333-3333-333333333333'
  )),
  3,
  'staff (editor) sees all three fixture assets via the base table regardless of status/parent visibility'
);
select ok(
  exists (select 1 from public.it_visual_assets where id = 'e2222222-2222-2222-2222-222222222222'),
  'staff can read a candidate asset, including its admin-only columns'
);
select ok(
  exists (select 1 from public.it_visual_asset_variants where visual_asset_id = 'e2222222-2222-2222-2222-222222222222'),
  'staff can read variants of a candidate asset'
);

reset role;

SELECT * FROM finish();
ROLLBACK;
