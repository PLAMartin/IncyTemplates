-- Spec v4 14.7.1/41: draft content revisions are never public; published revisions are
-- readable only through a publicly-readable parent (product for
-- it_product_content_revisions, a published+public it_products row with matching tool_key
-- for it_tool_copy_revisions). Also exercises the three revision functions'
-- (20260812090010/20260812090015) behavioural invariants: one open draft per
-- product/tool_key, publishing moves it_products.current_content_revision_id, and rollback
-- creates a new already-published revision rather than mutating history.
--
-- NOTE ON EXECUTION: see supabase/tests/README.md -- this suite has not been run in this
-- environment (no Docker / no `supabase start`), only authored.

BEGIN;
SELECT plan(13);

-- ---------------------------------------------------------------------------------------
-- Fixtures.
-- ---------------------------------------------------------------------------------------

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000', 'c1111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated',
  'editor-revisions-test@example.com', crypt('password', gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}', '{}'
);
update public.it_profiles set role = 'editor' where id = 'c1111111-1111-1111-1111-111111111111';

insert into public.it_products (id, product_type, access_type, status, public_visibility, name, slug, short_description, tool_key) values
  ('d1111111-1111-1111-1111-111111111111', 'guide', 'free', 'published', 'public', 'Published Guide', 'published-guide-rev-test', 'desc', null),
  ('d2222222-2222-2222-2222-222222222222', 'guide', 'free', 'draft', 'public', 'Draft Guide', 'draft-guide-rev-test', 'desc', null),
  ('d3333333-3333-3333-3333-333333333333', 'tool', 'free', 'published', 'public', 'Published Tool', 'published-tool-rev-test', 'desc', 'rev-test-tool-key');

-- ---------------------------------------------------------------------------------------
-- it_upsert_content_draft: creates a draft, then a second call on the same product UPDATES
-- the same row rather than creating a second one (the "one open draft per product" rule --
-- 20260812090010's partial unique index + ON CONFLICT).
-- ---------------------------------------------------------------------------------------

select ok(
  (public.it_upsert_content_draft(
    'd1111111-1111-1111-1111-111111111111', '{"body_markdown":"v1","author":"Test"}'::jsonb,
    'c1111111-1111-1111-1111-111111111111', 'first save'
  )).revision_number = 1,
  'first draft save creates revision_number 1'
);

select is(
  (public.it_upsert_content_draft(
    'd1111111-1111-1111-1111-111111111111', '{"body_markdown":"v2","author":"Test"}'::jsonb,
    'c1111111-1111-1111-1111-111111111111', 'second save'
  )).revision_number,
  1,
  'second draft save on the same product updates the same revision_number 1 row, not a new one'
);

select is(
  (select count(*)::int from public.it_product_content_revisions where product_id = 'd1111111-1111-1111-1111-111111111111'),
  1,
  'exactly one revision row exists for the product after two draft saves'
);

-- ---------------------------------------------------------------------------------------
-- it_publish_content_revision: sets published_at and updates it_products.current_content_revision_id.
-- ---------------------------------------------------------------------------------------

select ok(
  (public.it_publish_content_revision(
    (select id from public.it_product_content_revisions where product_id = 'd1111111-1111-1111-1111-111111111111'),
    'c1111111-1111-1111-1111-111111111111'
  )).published_at is not null,
  'publishing sets published_at'
);

select is(
  (select current_content_revision_id from public.it_products where id = 'd1111111-1111-1111-1111-111111111111'),
  (select id from public.it_product_content_revisions where product_id = 'd1111111-1111-1111-1111-111111111111'),
  'publishing points it_products.current_content_revision_id at the published revision'
);

-- ---------------------------------------------------------------------------------------
-- it_rollback_content_revision: creates a NEW already-published revision, doesn't mutate history.
-- ---------------------------------------------------------------------------------------

select ok(
  (public.it_rollback_content_revision(
    'd1111111-1111-1111-1111-111111111111',
    (select id from public.it_product_content_revisions where product_id = 'd1111111-1111-1111-1111-111111111111'),
    'c1111111-1111-1111-1111-111111111111',
    'test rollback'
  )).revision_number = 2,
  'rollback creates a new revision (number 2), not a mutation of revision 1'
);

select is(
  (select count(*)::int from public.it_product_content_revisions where product_id = 'd1111111-1111-1111-1111-111111111111'),
  2,
  'two revision rows exist after rollback (original + rollback copy) -- history preserved'
);

-- ---------------------------------------------------------------------------------------
-- RLS: draft never public; published visible only through a publicly-readable product.
-- ---------------------------------------------------------------------------------------

-- Draft guide's revision (from d2222222...) is created directly for this check.
select public.it_upsert_content_draft(
  'd2222222-2222-2222-2222-222222222222', '{"body_markdown":"unpublished","author":"Test"}'::jsonb,
  'c1111111-1111-1111-1111-111111111111', null
);

set local role anon;

select is(
  (select count(*)::int from public.it_product_content_revisions where product_id = 'd1111111-1111-1111-1111-111111111111'),
  2,
  'anon sees both published revisions for the published guide (rev 1 + the rollback-created rev 2 -- RLS allows reading any published revision of a public product, not only the current one)'
);
select ok(
  not exists (
    select 1 from public.it_product_content_revisions
    where product_id = 'd2222222-2222-2222-2222-222222222222'
  ),
  'anon cannot read any revision belonging to a draft (unpublished) product, published or not'
);

reset role;

-- ---------------------------------------------------------------------------------------
-- it_tool_copy_revisions: same draft/publish shape, keyed by tool_key.
-- ---------------------------------------------------------------------------------------

select public.it_upsert_tool_copy_draft(
  'rev-test-tool-key', '{"intro_heading":"v1"}'::jsonb, 'c1111111-1111-1111-1111-111111111111', null
);
select public.it_publish_tool_copy_revision(
  (select id from public.it_tool_copy_revisions where tool_key = 'rev-test-tool-key'),
  'c1111111-1111-1111-1111-111111111111'
);

set local role anon;

select ok(
  exists (select 1 from public.it_tool_copy_revisions where tool_key = 'rev-test-tool-key'),
  'anon can read published tool copy for a tool_key backed by a published+public product'
);

reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', 'c1111111-1111-1111-1111-111111111111', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  (select count(*)::int from public.it_product_content_revisions where product_id in (
    'd1111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222'
  )),
  3,
  'staff sees every revision for both products (2 for the published guide + 1 draft for the draft guide)'
);
select ok(
  exists (
    select 1 from public.it_product_content_revisions
    where product_id = 'd2222222-2222-2222-2222-222222222222' and published_at is null
  ),
  'staff can read the draft revision of the unpublished product'
);
select is(
  (select count(*)::int from public.it_tool_copy_revisions where tool_key = 'rev-test-tool-key'),
  1,
  'staff sees the tool copy revision too'
);

reset role;

SELECT * FROM finish();
ROLLBACK;
