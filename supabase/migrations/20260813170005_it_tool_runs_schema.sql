-- Incy Templates v6: saved Tool run records
-- Spec v6 section 14.12 (`it_tool_runs`), reproduced near-verbatim.
--
-- Lets a visitor save a completed Tool run and revisit it later from /account. Owned either by
-- a signed-in profile or, before sign-in, by an anonymous session id (the same it_anon_session
-- cookie pattern used for free downloads) -- run_has_owner enforces at least one is set.
-- customer_id is carried for schema parity with other owned records but is left unset by every
-- write path today (a Tool run has no purchase behind it); nothing currently populates it.

create table public.it_tool_runs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.it_products(id) on delete restrict,
  profile_id uuid references public.it_profiles(id) on delete set null,
  customer_id uuid references public.it_customers(id) on delete set null,
  anonymous_session_id uuid,
  status public.it_tool_run_status not null default 'started',
  tool_schema_version integer not null,
  input_data jsonb not null default '{}'::jsonb,
  result_data jsonb not null default '{}'::jsonb,
  ai_metadata jsonb not null default '{}'::jsonb,
  title text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  expires_at timestamptz,
  deleted_at timestamptz,
  constraint run_has_owner check (
    profile_id is not null or anonymous_session_id is not null
  )
);

comment on table public.it_tool_runs is
  'One saved Tool run per row (spec v6 §14.12). Owned by profile_id once claimed, or by anonymous_session_id before sign-in (see it_claim_anonymous_tool_runs). All writes go through the service-role client (src/server/tools/save-tool-run.ts) or the claim function -- no client-side INSERT/UPDATE policy exists.';

create index it_tool_runs_product_id_idx on public.it_tool_runs (product_id);
create index it_tool_runs_profile_id_idx on public.it_tool_runs (profile_id);
create index it_tool_runs_anonymous_session_id_idx on public.it_tool_runs (anonymous_session_id);
create index it_tool_runs_started_at_idx on public.it_tool_runs (started_at);
