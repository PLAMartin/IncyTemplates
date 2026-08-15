-- Incy Templates v7: source-mapping RLS
--
-- Editorial decision-support data (spec v7 section 16-adjacent note: "Source-post
-- assessments, mapping reviews and protected analysis metadata are admin/editorial data.
-- Ordinary visitors must not receive them through public policies.") -- same strictest-
-- boundary posture as it_visual_generation_jobs (20260813100010): staff read only, no
-- anon/authenticated-customer policy at all. All writes go through the service-role client
-- from src/server/admin/source-posts.ts, matching every other admin mutation in this repo.

alter table public.it_source_posts enable row level security;
alter table public.it_source_post_use_assessments enable row level security;
alter table public.it_source_post_mapping_reviews enable row level security;
alter table public.it_framework_source_posts enable row level security;

create policy "staff can read all source posts"
  on public.it_source_posts for select
  to authenticated
  using ((select public.is_staff()));

create policy "staff can read all source post assessments"
  on public.it_source_post_use_assessments for select
  to authenticated
  using ((select public.is_staff()));

create policy "staff can read all source post mapping reviews"
  on public.it_source_post_mapping_reviews for select
  to authenticated
  using ((select public.is_staff()));

create policy "staff can read all framework source post links"
  on public.it_framework_source_posts for select
  to authenticated
  using ((select public.is_staff()));
