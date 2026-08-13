-- Incy Templates v6: saved Tool run status enum
-- Spec v6 section 14.12 (`it_tool_runs`).
--
-- Own migration file, separate from the table migration that uses this type, for the same
-- reason as it_visual_generation_job_status_enum.sql (20260813100000): a newly created enum
-- type can't be used in the same migration/transaction it's created in.

create type public.it_tool_run_status as enum (
  'started',
  'in_progress',
  'completed',
  'failed',
  'deleted'
);
