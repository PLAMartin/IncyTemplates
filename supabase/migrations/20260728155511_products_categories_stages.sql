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
-- search keywords via PostgreSQL full-text search, weighted per section 21.2 ranking
-- guidance (title highest, then outcome statement, then keywords, then short description).
--
-- DEVIATION FROM SPEC (bugfix, not a spec change): to_tsvector(regconfig, text) is STABLE,
-- not IMMUTABLE, so it cannot be used in a `generated always as` expression (Postgres error
-- 42P17), and an IMMUTABLE SQL wrapper function around it was also rejected on this Postgres
-- version. Falling back to the classic, universally-supported pattern instead: a plain
-- column kept in sync by a BEFORE INSERT/UPDATE trigger, which has no immutability
-- restriction at all.
alter table public.it_products add column search_vector tsvector;

create function public.it_products_search_vector_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.outcome_statement, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.search_keywords, '{}'), ' ')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.short_description, '')), 'C');
  return new;
end;
$$;

create trigger it_products_search_vector_trigger
  before insert or update on public.it_products
  for each row execute function public.it_products_search_vector_update();

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
