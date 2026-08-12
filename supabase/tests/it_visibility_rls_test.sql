-- Spec v4 14.7.2/41: public_visibility must be enforced at the RLS layer, not just app code.
-- `hidden` is unavailable to anon/authenticated regardless of `status`; `unlisted` is only
-- excluded from *discovery* surfaces (an app-layer concern — see supabase-source.ts's
-- `.eq/.in("public_visibility", ...)` filters), so at the RLS/base-table layer it must remain
-- readable just like `public`.
--
-- NOTE ON EXECUTION: see supabase/tests/README.md -- this suite has not been run in this
-- environment (no Docker / no `supabase start`), only authored.

BEGIN;
SELECT plan(14);

-- ---------------------------------------------------------------------------------------
-- Fixtures (superuser, bypasses RLS).
-- ---------------------------------------------------------------------------------------

insert into public.it_products (id, product_type, access_type, status, public_visibility, name, slug, short_description, price_minor) values
  ('a1111111-1111-1111-1111-111111111111', 'template', 'free', 'published', 'public', 'Public Published', 'public-published-vis-test', 'desc', 0),
  ('a2222222-2222-2222-2222-222222222222', 'template', 'free', 'published', 'unlisted', 'Unlisted Published', 'unlisted-published-vis-test', 'desc', 0),
  ('a3333333-3333-3333-3333-333333333333', 'template', 'free', 'published', 'hidden', 'Hidden Published', 'hidden-published-vis-test', 'desc', 0),
  ('a4444444-4444-4444-4444-444444444444', 'template', 'free', 'draft', 'public', 'Draft Public', 'draft-public-vis-test', 'desc', 0);

insert into public.it_frameworks (id, status, public_visibility, name, slug, short_description, outcome_statement, flagship) values
  ('f1111111-1111-1111-1111-111111111111', 'published', 'public', 'Public Framework', 'public-framework-vis-test', 'desc', 'outcome', false),
  ('f2222222-2222-2222-2222-222222222222', 'published', 'hidden', 'Hidden Framework', 'hidden-framework-vis-test', 'desc', 'outcome', false),
  ('f3333333-3333-3333-3333-333333333333', 'draft', 'unlisted', 'Unlisted Draft Flagship', 'unlisted-draft-flagship-vis-test', 'desc', 'outcome', true),
  ('f4444444-4444-4444-4444-444444444444', 'draft', 'public', 'Public Draft Flagship', 'public-draft-flagship-vis-test', 'desc', 'outcome', true);

-- Fake editor-role staff member, for the staff-sees-everything assertions below.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000', 'b1111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated',
  'editor-vis-test@example.com', crypt('password', gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}', '{}'
);
update public.it_profiles set role = 'editor' where id = 'b1111111-1111-1111-1111-111111111111';

-- ---------------------------------------------------------------------------------------
-- it_products: anon/base-table read.
-- ---------------------------------------------------------------------------------------

set local role anon;

select is(
  (select count(*)::int from public.it_products where slug like '%-vis-test'),
  2,
  'anon sees exactly two of the four fixture products (public-published, unlisted-published)'
);
select ok(
  exists (select 1 from public.it_products where slug = 'unlisted-published-vis-test'),
  'anon CAN read a published+unlisted product via the base table (unlisted only hides from app-layer discovery, not RLS)'
);
select ok(
  not exists (select 1 from public.it_products where slug = 'hidden-published-vis-test'),
  'anon cannot read a published+hidden product even though status=published'
);
select ok(
  not exists (select 1 from public.it_products where slug = 'draft-public-vis-test'),
  'anon cannot read a draft product regardless of visibility'
);

-- ---------------------------------------------------------------------------------------
-- it_frameworks: same shape.
-- ---------------------------------------------------------------------------------------

select ok(
  exists (select 1 from public.it_frameworks where slug = 'public-framework-vis-test'),
  'anon can read a published+public framework'
);
select ok(
  not exists (select 1 from public.it_frameworks where slug = 'hidden-framework-vis-test'),
  'anon cannot read a published+hidden framework'
);

-- ---------------------------------------------------------------------------------------
-- it_frameworks_teasers: public-only (20260812110000 tightened this from "not hidden" to
-- "= public" -- unlisted must be excluded from this discovery/"coming soon" surface too).
-- ---------------------------------------------------------------------------------------

select ok(
  exists (select 1 from public.it_frameworks_teasers where slug = 'public-draft-flagship-vis-test'),
  'anon can read a draft+flagship+public framework via the teaser view'
);
select ok(
  not exists (select 1 from public.it_frameworks_teasers where slug = 'unlisted-draft-flagship-vis-test'),
  'anon cannot read a draft+flagship+unlisted framework via the teaser view (discovery surface excludes unlisted)'
);
select ok(
  not exists (select 1 from public.it_frameworks_teasers where slug = 'hidden-framework-vis-test'),
  'anon cannot read a hidden framework via the teaser view'
);

reset role;

-- ---------------------------------------------------------------------------------------
-- Staff (editor role): sees everything regardless of status/visibility.
-- ---------------------------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claim.sub', 'b1111111-1111-1111-1111-111111111111', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  (select count(*)::int from public.it_products where slug like '%-vis-test'),
  4,
  'staff (editor) sees all four fixture products regardless of status/visibility'
);
select ok(
  exists (select 1 from public.it_products where slug = 'hidden-published-vis-test'),
  'staff can read a hidden product'
);
select ok(
  exists (select 1 from public.it_products where slug = 'draft-public-vis-test'),
  'staff can read a draft product'
);
select is(
  (select count(*)::int from public.it_frameworks where slug like '%-vis-test'),
  4,
  'staff sees all four fixture frameworks regardless of status/visibility'
);
select ok(
  exists (select 1 from public.it_frameworks where slug = 'hidden-framework-vis-test'),
  'staff can read a hidden framework via the base table'
);

reset role;

SELECT * FROM finish();
ROLLBACK;
