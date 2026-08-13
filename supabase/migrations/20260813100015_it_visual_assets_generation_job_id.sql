-- Incy Templates v6: link visual-asset candidates back to their generation job
-- Spec v6 section 14.13: "For OpenAI-generated candidates, generation_job_id links every
-- candidate back to the single OpenAI request/job."
--
-- Added as its own migration after it_visual_generation_jobs exists, per the spec's own note
-- on avoiding circular creation order (the same reasoning already used for
-- it_frameworks.current_visual_asset_id / it_products.current_visual_asset_id).

alter table public.it_visual_assets
  add column generation_job_id uuid references public.it_visual_generation_jobs(id) on delete set null;

create index it_visual_assets_generation_job_id_idx on public.it_visual_assets (generation_job_id);
