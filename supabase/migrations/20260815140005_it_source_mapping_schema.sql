-- Incy Templates v7: source-mapping schema
-- Spec v7 section 14 (DDL ~lines 1939-2057), 12.8, 23.2. Builds the it_source_posts /
-- it_source_post_use_assessments / it_source_post_mapping_reviews / it_framework_source_posts
-- tables deferred by 20260809160005_it_frameworks.sql's header comment ("intentionally NOT
-- created in this migration -- there is no importer or any real source-post data yet"). That
-- blocker is gone: scripts/import-abitgamey-assessments.ts imports the real 258-post A Bit
-- Gamey corpus. it_frameworks.source_note stays as-is (existing published frameworks keep
-- their free-text provenance); new framework/source links go through
-- it_framework_source_posts from here on.

create table public.it_source_posts (
  id text primary key,
  source_type text not null default 'abitgamey',
  title text not null,
  subtitle text,
  published_at timestamptz,
  source_repository text not null,
  source_ref text,
  source_path text not null,
  source_url text,
  source_category text,
  content_hash text,
  imported_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.it_source_posts
  for each row execute function public.set_updated_at();

-- Immutable/versioned suggested assessment -- deliberately separate from it_source_posts so
-- imported metadata is never confused with inferred editorial analysis (spec v7 line 1963).
-- No update trigger: rows are inserted once per analysis run and never modified.
create table public.it_source_post_use_assessments (
  id uuid primary key default gen_random_uuid(),
  source_post_id text not null references public.it_source_posts(id) on delete cascade,
  taxonomy_version text not null default 'reuse-v1',
  analysis_version text not null,
  analysis_method text not null, -- seeded | rules | ai_assisted | manual
  source_content_hash text,
  extracted_principle text,
  problem_statement text,
  source_stage text,
  user_task text,
  method_tags text[] not null default '{}',
  frequency text,
  judgement_level text,
  score_problem smallint not null,
  score_actionability smallint not null,
  score_repeatability smallint not null,
  score_structure smallint not null,
  score_automation smallint not null,
  reuse_score smallint generated always as (
    score_problem + score_actionability + score_repeatability + score_structure + score_automation
  ) stored,
  suggested_uses public.it_source_use_type[] not null default '{}'::public.it_source_use_type[],
  suggested_frameworks jsonb not null default '[]'::jsonb,
  suggested_public_stage_key text,
  confidence numeric(4,3),
  rationale text,
  protected_analysis_metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.it_profiles(id),
  created_at timestamptz not null default now(),
  constraint source_stage_valid check (
    source_stage is null or source_stage in ('discover','assess','decide','plan','execute','review','improve')
  ),
  constraint frequency_valid check (
    frequency is null or frequency in ('one_off','occasional','recurring')
  ),
  constraint judgement_level_valid check (
    judgement_level is null or judgement_level in ('low','medium','high')
  ),
  constraint score_problem_valid check (score_problem between 0 and 2),
  constraint score_actionability_valid check (score_actionability between 0 and 2),
  constraint score_repeatability_valid check (score_repeatability between 0 and 2),
  constraint score_structure_valid check (score_structure between 0 and 2),
  constraint score_automation_valid check (score_automation between 0 and 2),
  constraint confidence_valid check (confidence is null or (confidence >= 0 and confidence <= 1))
);

comment on column public.it_source_post_use_assessments.suggested_frameworks is
  'Ordered array of structured suggestions: existing framework_id where known, candidate '
  'name/slug where not yet created, suggested contribution_type, output uses, confidence and '
  'rationale. Validated by application schema (src/lib/source-mapping/schema.ts), never '
  'treated as executable configuration.';

-- Human editorial decision, stored separately from the suggestion it reviewed (spec v7 line
-- 2018). One row per post; framework-specific accepted/adjusted mappings live in
-- it_framework_source_posts below, so one post can map to multiple frameworks.
create table public.it_source_post_mapping_reviews (
  source_post_id text primary key references public.it_source_posts(id) on delete cascade,
  assessment_id uuid references public.it_source_post_use_assessments(id) on delete set null,
  status public.it_source_mapping_status not null default 'unreviewed',
  editorial_uses public.it_source_use_type[] not null default '{}'::public.it_source_use_type[],
  editorial_stage_id uuid references public.it_stages(id),
  editorial_taxonomy_overrides jsonb not null default '{}'::jsonb,
  editorial_note text,
  review_recommended boolean not null default false,
  reviewed_by uuid references public.it_profiles(id),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.it_source_post_mapping_reviews
  for each row execute function public.set_updated_at();

create table public.it_framework_source_posts (
  framework_id uuid not null references public.it_frameworks(id) on delete cascade,
  source_post_id text not null references public.it_source_posts(id) on delete restrict,
  source_assessment_id uuid references public.it_source_post_use_assessments(id) on delete set null,
  contribution_type text not null default 'supporting',
  output_uses public.it_source_use_type[] not null default '{}'::public.it_source_use_type[],
  mapping_origin text not null default 'manual',
  editorial_note text,
  reviewed_by uuid references public.it_profiles(id),
  reviewed_at timestamptz,
  display_order integer not null default 0,
  primary key (framework_id, source_post_id),
  constraint mapping_origin_valid check (
    mapping_origin in ('manual','accepted_suggestion','adjusted_suggestion')
  )
);

comment on column public.it_framework_source_posts.contribution_type is
  'Suggested values: primary_method, supporting_method, example, evidence, background '
  '(spec v7 line 2059) -- not a DB enum, kept as free text per the same "configurable '
  'vocabulary, not hard-coded" guidance spec v7 gives method_tags.';

create index it_source_post_use_assessments_post_created_idx
  on public.it_source_post_use_assessments (source_post_id, created_at desc);

create index it_source_post_use_assessments_reuse_score_idx
  on public.it_source_post_use_assessments (reuse_score);

create index it_source_post_mapping_reviews_status_idx
  on public.it_source_post_mapping_reviews (status, review_recommended);

create index it_framework_source_posts_source_post_idx
  on public.it_framework_source_posts (source_post_id);
