-- Incy Templates v3: it_frameworks
-- Spec v3: section 14.3. Represents the reusable method/problem/outcome above individual
-- Guide/Template/Tool outputs (a "framework/product family", e.g. "Product Idea Assessor").
--
-- DEVIATION FROM SPEC (scope, not schema error): spec v3 14.4 also defines
-- it_source_posts/it_framework_source_posts for structured A Bit Gamey provenance. Those are
-- intentionally NOT created in this migration -- there is no importer or any real source-post
-- data yet, so an unpopulated provenance schema would be dead weight rather than useful
-- plumbing. Instead a single free-text `source_note` column captures an attribution line
-- (e.g. "Developed from A Bit Gamey material on Proven/Better/New idea validation"), enough
-- to satisfy spec 38.1's "framework declares source provenance" quality bar without inventing
-- an empty table. Revisit once a real A Bit Gamey import is scoped.

create table public.it_frameworks (
  id uuid primary key default gen_random_uuid(),
  status public.it_framework_status not null default 'candidate',
  name text not null,
  slug text not null unique,
  short_description text not null,
  problem_statement text,
  outcome_statement text not null,
  target_audience text,
  when_to_use text,
  when_not_to_use text,
  method_summary text,
  journey_stage_id uuid references public.it_stages(id),
  priority_score numeric(5,2),
  priority_rationale text,
  source_strength text,
  source_note text,
  -- DEVIATION FROM SPEC: a single direct self-reference substitutes for the generic
  -- it_product_relationships "next_step" relationship type (spec 14.11) this pass -- there
  -- is exactly one framework-to-framework link to express this milestone (Product Idea
  -- Assessor -> Customer Discovery Kit), and the generic many-to-many table isn't
  -- proportionate for one link yet. `on delete set null` rather than `restrict`: retiring or
  -- renaming the next-step target shouldn't block deleting this row.
  next_step_framework_id uuid references public.it_frameworks(id) on delete set null,
  flagship boolean not null default false,
  display_order integer not null default 0,
  seo_title text,
  seo_description text,
  created_by uuid references public.it_profiles(id),
  updated_by uuid references public.it_profiles(id),
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint valid_priority_score check (
    priority_score is null or (priority_score >= 0 and priority_score <= 100)
  )
);

comment on column public.it_frameworks.source_note is
  'DEVIATION FROM SPEC: free-text provenance substitute for the it_source_posts/'
  'it_framework_source_posts tables (spec v3 14.4), which are not built this pass.';

create index it_frameworks_status_journey_stage_idx
  on public.it_frameworks (status, journey_stage_id, display_order);

create trigger set_updated_at before update on public.it_frameworks
  for each row execute function public.set_updated_at();
