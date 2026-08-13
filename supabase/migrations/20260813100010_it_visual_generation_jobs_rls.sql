-- Incy Templates v6: visual-generation-job RLS
--
-- Pure internal generation provenance -- never read by public pages, unlike it_visual_assets
-- (which at least has a narrow it_visual_assets_public view for published metadata). So this
-- table gets no anon/authenticated policy at all beyond staff read, matching it_visual_assets'
-- strictest-boundary posture (20260812140015_it_visual_assets_rls.sql). All writes go through
-- the service-role client from src/server/admin/visual-generation-jobs.ts, exactly like every
-- other mutation in src/server/admin/visuals.ts already does -- no new access path.

alter table public.it_visual_generation_jobs enable row level security;

create policy "staff can read all visual generation jobs"
  on public.it_visual_generation_jobs for select
  to authenticated
  using ((select public.is_staff()));
