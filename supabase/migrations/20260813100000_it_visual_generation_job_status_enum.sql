-- Incy Templates v6: visual-generation-job status enum
-- Spec v6 section 14.13 (`it_visual_generation_jobs`).
--
-- Own migration file, separate from the table migration that uses this type, for the same
-- reason as it_visual_asset_enums.sql (20260812140000): a newly created enum type can't be
-- used in the same migration/transaction it's created in.

create type public.it_visual_generation_job_status as enum (
  'queued',
  'running',
  'completed',
  'partial',
  'failed',
  'cancelled'
);
