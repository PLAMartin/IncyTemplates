-- Spec v3: 16.1 (public read: published frameworks), 41 (draft is inaccessible publicly),
-- and the product-owner exception recorded in
-- 20260809160010_it_frameworks_rls.sql (draft-flagship families still show as public
-- "Coming soon" teasers with a narrow field allowlist, via it_frameworks_teasers).
--
-- NOTE ON EXECUTION: see supabase/tests/README.md -- this suite has not been run in this
-- environment (no Docker / no `supabase start`), only authored.

BEGIN;
SELECT plan(8);

-- ---------------------------------------------------------------------------------------
-- Fixtures. Inserted as the connecting role (postgres/superuser), which bypasses RLS.
-- ---------------------------------------------------------------------------------------

insert into public.it_frameworks (id, status, name, slug, short_description, outcome_statement, flagship) values
  ('f1111111-1111-1111-1111-111111111111', 'published', 'Published Flagship', 'published-flagship-rls-test', 'Short desc', 'Outcome', true),
  ('f2222222-2222-2222-2222-222222222222', 'draft', 'Draft Flagship', 'draft-flagship-rls-test', 'Short desc', 'Outcome', true),
  ('f3333333-3333-3333-3333-333333333333', 'draft', 'Draft Non-Flagship', 'draft-nonflagship-rls-test', 'Short desc', 'Outcome', false),
  ('f4444444-4444-4444-4444-444444444444', 'candidate', 'Candidate Framework', 'candidate-rls-test', 'Short desc', 'Outcome', false);

-- ---------------------------------------------------------------------------------------
-- Full it_frameworks table: published-only for anon, full editorial detail.
-- ---------------------------------------------------------------------------------------

set local role anon;

select is(
  (select count(*)::int from public.it_frameworks),
  1,
  'anon sees exactly one framework via the base table (the published one)'
);

select ok(
  exists (select 1 from public.it_frameworks where slug = 'published-flagship-rls-test'),
  'anon can read the published framework via the base table'
);

select ok(
  not exists (select 1 from public.it_frameworks where slug = 'draft-flagship-rls-test'),
  'anon cannot read the draft-flagship framework via the base table (no editorial detail leak)'
);

select ok(
  not exists (select 1 from public.it_frameworks where slug = 'candidate-rls-test'),
  'anon cannot read a candidate-status framework via the base table'
);

-- ---------------------------------------------------------------------------------------
-- it_frameworks_teasers view: published + draft-flagship only, narrow column set.
-- ---------------------------------------------------------------------------------------

select is(
  (select count(*)::int from public.it_frameworks_teasers),
  2,
  'anon sees exactly two teaser rows (published + draft-flagship)'
);

select ok(
  exists (select 1 from public.it_frameworks_teasers where slug = 'draft-flagship-rls-test'),
  'anon can read the draft-flagship framework via the teaser view'
);

select ok(
  not exists (select 1 from public.it_frameworks_teasers where slug = 'draft-nonflagship-rls-test'),
  'anon cannot read a non-flagship draft framework via the teaser view'
);

select ok(
  not exists (select 1 from public.it_frameworks_teasers where slug = 'candidate-rls-test'),
  'anon cannot read a candidate-status framework via the teaser view'
);

reset role;

SELECT * FROM finish();
ROLLBACK;
