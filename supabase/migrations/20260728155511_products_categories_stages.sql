-- Incy Templates: it_products, it_product_categories, it_product_stages
-- Spec: section 14.3, and section 21.1 (full-text search columns).

create table public.it_products (
  id uuid primary key default gen_random_uuid(),
  product_type public.it_product_type not null,
  access_type public.it_access_type not null,
  status public.it_product_status not null default 'draft',
  name text not null,
  slug text not null unique,
  short_description text not null,
  full_description text,
  outcome_statement text,
  target_audience text,
  when_to_use text,
  when_not_to_use text,
  completion_minutes_min integer,
  completion_minutes_max integer,
  skill_level text,
  current_version text,
  price_minor integer,
  compare_at_price_minor integer,
  currency_code char(3) not null default 'GBP',
  stripe_product_id text unique,
  stripe_price_id text unique,
  -- DEVIATION FROM SPEC: the spec's SQL snippet (14.3) declares `licence_id uuid` with no
  -- foreign key. A licence relationship with no referential integrity would allow orphaned
  -- or typo'd licence ids, so a FK to it_licences is added here.
  licence_id uuid references public.it_licences(id),
  featured boolean not null default false,
  featured_order integer,
  published_at timestamptz,
  scheduled_for timestamptz,
  seo_title text,
  seo_description text,
  og_image_url text,
  schema_data jsonb not null default '{}'::jsonb,
  search_keywords text[] not null default '{}',
  created_by uuid references public.it_profiles(id),
  updated_by uuid references public.it_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint valid_price check (
    (access_type = 'free' and coalesce(price_minor, 0) = 0)
    or
    (access_type = 'paid' and price_minor is not null and price_minor >= 0)
  )
);

comment on column public.it_products.licence_id is
  'DEVIATION FROM SPEC: FK to it_licences added; the spec SQL snippet omitted it.';

-- Spec 21.1: MVP search must cover product name, short description, outcome statement and
-- search keywords via PostgreSQL full-text search. A generated tsvector column keeps the
-- index automatically in sync with the source columns, weighted per section 21.2 ranking
-- guidance (title highest, then outcome statement, then keywords, then short description).
alter table public.it_products
  add column search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(outcome_statement, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(search_keywords, ' ')), 'B') ||
    setweight(to_tsvector('english', coalesce(short_description, '')), 'C')
  ) stored;

create index it_products_search_vector_idx on public.it_products using gin (search_vector);
create index it_products_status_idx on public.it_products (status);
create index it_products_product_type_idx on public.it_products (product_type);
create index it_products_slug_trgm_idx on public.it_products using gin (slug extensions.gin_trgm_ops);

create table public.it_product_categories (
  product_id uuid not null references public.it_products(id) on delete cascade,
  category_id uuid not null references public.it_categories(id) on delete restrict,
  is_primary boolean not null default false,
  primary key (product_id, category_id)
);

create table public.it_product_stages (
  product_id uuid not null references public.it_products(id) on delete cascade,
  stage_id uuid not null references public.it_stages(id) on delete restrict,
  is_primary boolean not null default false,
  primary key (product_id, stage_id)
);

create index it_product_categories_category_id_idx on public.it_product_categories (category_id);
create index it_product_stages_stage_id_idx on public.it_product_stages (stage_id);
