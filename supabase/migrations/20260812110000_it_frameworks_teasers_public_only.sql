-- Incy Templates v4: tighten it_frameworks_teasers to public-only visibility
-- Spec v4 §14.7.2: "unlisted: ... exclude from catalogue/search/recommendations/sitemap".
-- The teaser view (introduced 20260809160010_it_frameworks_rls.sql, updated for hidden in
-- 20260812090005_it_products_frameworks_visibility.sql) is a discovery/"coming soon" surface
-- exactly like catalogue listings, so it must exclude unlisted the same way — not just
-- hidden. The base it_frameworks table itself keeps allowing direct reads of unlisted rows
-- (see getFrameworkBySlug/getFrameworkById in supabase-source.ts), only this teaser listing
-- narrows further.

create or replace view public.it_frameworks_teasers as
select
  f.id,
  f.name,
  f.slug,
  f.short_description,
  f.outcome_statement,
  f.status,
  f.flagship,
  f.display_order,
  s.slug as journey_stage_slug,
  s.name as journey_stage_name
from public.it_frameworks f
left join public.it_stages s on s.id = f.journey_stage_id
where f.public_visibility = 'public'
  and (f.status = 'published' or (f.status = 'draft' and f.flagship = true));
