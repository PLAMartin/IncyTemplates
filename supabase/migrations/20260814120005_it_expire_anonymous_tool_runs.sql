-- Incy Templates v6: scheduled hard-delete of expired anonymous Tool runs
-- Spec v6 section 14.12 -- "Anonymous runs should expire automatically unless there is a
-- justified reason to retain them." expires_at is set on insert for anonymous-owned runs
-- (src/server/tools/save-tool-run.ts, 30-day TTL matching ANONYMOUS_SESSION_MAX_AGE_SECONDS,
-- the same window that governs the it_anon_session cookie itself) and cleared on claim
-- (20260814120000) -- so any row still past its expires_at here is, by construction, still
-- anonymous and unclaimed. Hard delete, not soft delete via the existing deleted_at column:
-- deleted_at isn't used as a soft-delete convention anywhere else in this schema (it's carried
-- from the spec's literal table definition for a possible future user/staff-initiated delete),
-- and spec's own privacy note about sensitive free-text Tool inputs argues for actually
-- removing expired anonymous data rather than leaving it sitting flagged-but-present.

create extension if not exists pg_cron with schema extensions;

create or replace function public.it_expire_anonymous_tool_runs()
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  delete from public.it_tool_runs
  where expires_at is not null
    and expires_at < now();
$$;

comment on function public.it_expire_anonymous_tool_runs() is
  'Hard-deletes it_tool_runs rows past their expires_at (spec v6 §14.12). Only ever matches still-anonymous, unclaimed rows -- claiming clears expires_at (see 20260814120000). Scheduled daily via pg_cron, see the cron.schedule call below.';

revoke execute on function public.it_expire_anonymous_tool_runs() from public;

select
  cron.schedule(
    'it-expire-anonymous-tool-runs',
    '0 3 * * *',
    $$select public.it_expire_anonymous_tool_runs();$$
  )
where not exists (
  select 1 from cron.job where jobname = 'it-expire-anonymous-tool-runs'
);
