-- Incy Templates v3: replace the 8 v2 journey stages with the spec's canonical 7
-- Spec v3: section 7 (IA), section 8 (navigation), section 14.6 (idea, validate, decide,
-- design, build, launch, improve).
--
-- The 8 old stage rows (find-a-problem, evaluate-an-idea, understand-customers,
-- define-the-product, test-demand, plan-the-mvp, prepare-to-launch, review-and-improve) are
-- soft-deactivated rather than deleted: it_product_stages.stage_id is `on delete restrict`
-- and every seed product still references one of these rows at migration time. A later,
-- separate cleanup migration can hard-delete them once the application-level remap
-- (content/seed/catalogue.ts, and any live Supabase product data) is confirmed complete --
-- not blocking for this milestone.

update public.it_stages
set is_active = false,
    display_order = display_order + 100
where slug in (
  'find-a-problem',
  'evaluate-an-idea',
  'understand-customers',
  'define-the-product',
  'test-demand',
  'plan-the-mvp',
  'prepare-to-launch',
  'review-and-improve'
);

insert into public.it_stages (name, slug, description, display_order, is_active) values
  ('Idea', 'idea', 'Find and frame a problem worth solving.', 1, true),
  ('Validate', 'validate', 'Gather evidence on the problem, the idea and your customers before committing.', 2, true),
  ('Decide', 'decide', 'Reach a documented decision on whether and how to proceed.', 3, true),
  ('Design', 'design', 'Turn a validated idea into a precise, buildable product definition.', 4, true),
  ('Build', 'build', 'Scope and build the smallest useful version worth testing.', 5, true),
  ('Launch', 'launch', 'Get the product, support and go-to-market ready, then release it.', 6, true),
  ('Improve', 'improve', 'Review progress on a regular cadence and decide what to do next.', 7, true);
