-- Spec: 16.1 (public read policies), 32.2/32.5 (RLS policy tests).
--
-- NOTE ON EXECUTION: see supabase/tests/README.md -- this suite has not been run in this
-- environment (no Docker / no `supabase start`), only authored. It targets `supabase test db`
-- against a local Supabase stack with the full migration set applied.
--
-- Verifies that anonymous (and by extension authenticated, since the public-read
-- policies grant to `anon, authenticated` alike) visitors can only read published
-- products and active categories/stages -- never draft, archived, or scheduled-future
-- products, and never inactive categories/stages.

BEGIN;
SELECT plan(9);

-- ---------------------------------------------------------------------------------------
-- Fixtures. Inserted as the connecting role (postgres/superuser in `supabase test db`),
-- which owns these tables and therefore bypasses RLS for setup writes.
-- ---------------------------------------------------------------------------------------

insert into public.it_categories (id, name, slug, is_active) values
  ('11111111-1111-1111-1111-111111111111', 'Active Category', 'active-category-rls-test', true),
  ('22222222-2222-2222-2222-222222222222', 'Inactive Category', 'inactive-category-rls-test', false);

insert into public.it_stages (id, name, slug, is_active) values
  ('33333333-3333-3333-3333-333333333333', 'Active Stage', 'active-stage-rls-test', true),
  ('44444444-4444-4444-4444-444444444444', 'Inactive Stage', 'inactive-stage-rls-test', false);

insert into public.it_products (id, product_type, access_type, status, name, slug, short_description, price_minor, scheduled_for) values
  ('a1111111-1111-1111-1111-111111111111', 'template', 'free', 'published', 'Published Template', 'published-template-rls-test', 'A published template', 0, null),
  ('a2222222-2222-2222-2222-222222222222', 'template', 'free', 'draft', 'Draft Template', 'draft-template-rls-test', 'A draft template', 0, null),
  ('a3333333-3333-3333-3333-333333333333', 'template', 'free', 'archived', 'Archived Template', 'archived-template-rls-test', 'An archived template', 0, null),
  ('a4444444-4444-4444-4444-444444444444', 'template', 'free', 'scheduled', 'Scheduled Template', 'scheduled-template-rls-test', 'A template scheduled for the future', 0, now() + interval '7 days');

-- ---------------------------------------------------------------------------------------
-- Switch to the anon role for the actual assertions.
-- ---------------------------------------------------------------------------------------

set local role anon;

select is(
  (select count(*)::int from public.it_categories),
  1,
  'anon sees exactly one category (the active one)'
);

select is(
  (select count(*)::int from public.it_stages),
  1,
  'anon sees exactly one stage (the active one)'
);

select is(
  (select count(*)::int from public.it_products),
  1,
  'anon sees exactly one product (the published one)'
);

select ok(
  exists (select 1 from public.it_products where slug = 'published-template-rls-test'),
  'anon can read the published product'
);

select ok(
  not exists (select 1 from public.it_products where slug = 'draft-template-rls-test'),
  'anon cannot read the draft product'
);

select ok(
  not exists (select 1 from public.it_products where slug = 'archived-template-rls-test'),
  'anon cannot read the archived product'
);

select ok(
  not exists (select 1 from public.it_products where slug = 'scheduled-template-rls-test'),
  'anon cannot read the scheduled (not-yet-live) product'
);

select ok(
  not exists (select 1 from public.it_categories where slug = 'inactive-category-rls-test'),
  'anon cannot read the inactive category'
);

select ok(
  not exists (select 1 from public.it_stages where slug = 'inactive-stage-rls-test'),
  'anon cannot read the inactive stage'
);

reset role;

SELECT * FROM finish();
ROLLBACK;
