-- Incy Templates v6: visual-generation-job records
-- Spec v6 section 14.13 (`it_visual_generation_jobs`), reproduced near-verbatim.
--
-- One admin generation request, tracked independently of the it_visual_assets candidates it
-- produces -- important for an external provider such as OpenAI, since one request can fail,
-- be retried, or return several candidates from a single provider call.
--
-- Deviation from the spec's literal DDL: `requested_candidates between 1 and 4` is a hard
-- ceiling enforced here at the database level. The application also reads a configurable
-- VISUAL_GENERATION_MAX_CANDIDATES env var, but that can only lower the effective cap below 4
-- -- a DB check constraint has no way to see an application env var, so 4 remains the absolute
-- upper bound regardless of configuration (see docs/decisions/0050-openai-visual-provider.md).

create table public.it_visual_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid references public.it_frameworks(id) on delete cascade,
  product_id uuid references public.it_products(id) on delete cascade,
  asset_type public.it_visual_asset_type not null,
  provider_key text not null,
  provider_model text,
  provider_model_snapshot text,
  visual_recipe_id uuid not null references public.it_visual_recipes(id),
  visual_brief jsonb not null default '{}'::jsonb,
  prompt_snapshot text,
  request_config jsonb not null default '{}'::jsonb,
  requested_candidates integer not null,
  produced_candidates integer not null default 0,
  status public.it_visual_generation_job_status not null default 'queued',
  provider_request_id text,
  safe_usage_metadata jsonb not null default '{}'::jsonb,
  estimated_cost_minor integer,
  billing_currency char(3),
  error_category text,
  error_code text,
  error_message_safe text,
  attempt_count integer not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid not null references public.it_profiles(id),
  constraint visual_generation_job_has_owner check (
    framework_id is not null or product_id is not null
  ),
  constraint visual_generation_candidate_count check (
    requested_candidates between 1 and 4
  )
);

comment on table public.it_visual_generation_jobs is
  'One admin generation request per row (spec v6 §14.13), independent of the it_visual_assets candidate rows it produces. provider_key identifies the adapter used ("openai", "test") -- never the model name. request_config/safe_usage_metadata hold non-secret settings/usage only; prompt_snapshot/error_message_safe must never contain provider API keys or unsanitised provider error text. Failed/retried jobs remain auditable but never affect currently published visuals.';

create index it_visual_generation_jobs_framework_id_idx on public.it_visual_generation_jobs (framework_id);
create index it_visual_generation_jobs_product_id_idx on public.it_visual_generation_jobs (product_id);
create index it_visual_generation_jobs_provider_key_idx on public.it_visual_generation_jobs (provider_key);
create index it_visual_generation_jobs_status_idx on public.it_visual_generation_jobs (status);
create index it_visual_generation_jobs_created_by_idx on public.it_visual_generation_jobs (created_by);
create index it_visual_generation_jobs_created_at_idx on public.it_visual_generation_jobs (created_at);
