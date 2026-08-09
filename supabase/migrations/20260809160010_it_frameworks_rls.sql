-- Incy Templates v3: it_frameworks RLS + public teaser view
-- Spec v3: section 16.1 ("Published frameworks" are public-readable), section 41 ("Draft
-- frameworks/products are inaccessible publicly").
--
-- Product-owner decision: the five non-flagship v3 seed families are seeded as
-- status = 'draft' but should still show as public "Coming soon" cards on listing pages
-- (homepage / /products / /journey/*), not be fully invisible. A plain RLS relaxation on
-- it_frameworks can't express this safely -- RLS restricts *rows*, not *columns*, so any
-- policy letting anon see draft rows at all would also expose problem_statement,
-- method_summary, priority_score/rationale for unpublished editorial content.
--
-- Solution: it_frameworks itself keeps a strict "published only" public policy (full detail,
-- every column). A separate `it_frameworks_teasers` VIEW, scoped to a narrow, explicit column
-- allowlist (name/slug/short_description/outcome_statement/status/journey stage only), is
-- granted to anon/authenticated and additionally includes draft rows flagged
-- `flagship = true`. This view is deliberately NOT `security_invoker` (Postgres's default for
-- views, i.e. it evaluates using the view owner's privileges against the base table, not the
-- querying role's RLS-restricted view) -- its own WHERE clause is the complete, sufficient
-- security boundary for what it exposes, and it never selects the editorial columns at all,
-- so there is nothing sensitive for the view definition to leak regardless of RLS on the
-- base table.

alter table public.it_frameworks enable row level security;

create policy "public can read published frameworks"
  on public.it_frameworks for select
  to anon, authenticated
  using (status = 'published');

create policy "staff can read all frameworks regardless of status"
  on public.it_frameworks for select
  to authenticated
  using ((select public.is_staff()));

grant select on public.it_frameworks to anon, authenticated;

create view public.it_frameworks_teasers as
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
where f.status = 'published' or (f.status = 'draft' and f.flagship = true);

comment on view public.it_frameworks_teasers is
  'Public-safe teaser projection: published frameworks (full teaser fields) plus '
  'draft-flagship frameworks (same narrow field set only -- no problem/method/priority '
  'columns are selected here at all). Used by listing surfaces that must show "Coming soon" '
  'cards for unpublished flagship families without exposing editorial detail. The full '
  'it_frameworks table remains published-only for anon/authenticated via RLS above.';

grant select on public.it_frameworks_teasers to anon, authenticated;
