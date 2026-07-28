-- Incy Templates: reference tables
-- Spec: section 14.3 - it_categories, it_stages, it_licences.
-- These are administrator-managed lookup tables (spec 14.2: "Use lookup tables for
-- administrator-managed categories").

create table public.it_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.it_stages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.it_licences (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  summary text not null,
  full_text text not null,
  max_users integer,
  commercial_use_allowed boolean not null default false,
  client_work_allowed boolean not null default false,
  redistribution_allowed boolean not null default false,
  version text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.it_categories is 'Administrator-managed product categories (spec 14.3).';
comment on table public.it_stages is 'Administrator-managed lifecycle/decision stages a product applies to (spec 14.3).';
comment on table public.it_licences is 'Licence terms attachable to products (spec 14.3).';
