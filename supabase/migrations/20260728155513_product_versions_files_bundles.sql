-- Incy Templates: it_product_versions, it_files, it_bundle_items, it_product_relationships
-- Spec: section 14.3.

create table public.it_product_versions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.it_products(id) on delete restrict,
  version text not null,
  release_notes text,
  is_current boolean not null default false,
  released_at timestamptz,
  created_by uuid references public.it_profiles(id),
  created_at timestamptz not null default now(),
  unique (product_id, version)
);

-- DEVIATION FROM SPEC: the spec's SQL snippet for it_product_versions (14.3) does not
-- include this index; it is only called for in the surrounding prose ("Only one current
-- version per product should be permitted using a partial unique index"). Added here as
-- a partial unique index rather than a trigger, per the task's guidance that an index
-- alone is the simpler and sufficient mechanism.
create unique index it_product_versions_one_current_per_product
  on public.it_product_versions (product_id)
  where is_current;

create index it_product_versions_product_id_idx on public.it_product_versions (product_id);

create table public.it_files (
  id uuid primary key default gen_random_uuid(),
  product_version_id uuid not null references public.it_product_versions(id) on delete restrict,
  file_role public.it_file_role not null,
  file_format public.it_file_format not null,
  display_name text not null,
  storage_bucket text not null,
  storage_path text not null,
  original_filename text not null,
  mime_type text not null,
  byte_size bigint not null,
  checksum_sha256 text,
  is_public_preview boolean not null default false,
  display_order integer not null default 0,
  created_by uuid references public.it_profiles(id),
  created_at timestamptz not null default now(),
  unique (storage_bucket, storage_path)
);

create index it_files_product_version_id_idx on public.it_files (product_version_id);

create table public.it_bundle_items (
  bundle_product_id uuid not null references public.it_products(id) on delete cascade,
  included_product_id uuid not null references public.it_products(id) on delete restrict,
  display_order integer not null default 0,
  is_required boolean not null default true,
  primary key (bundle_product_id, included_product_id),
  constraint bundle_not_self check (bundle_product_id <> included_product_id)
);

comment on table public.it_bundle_items is
  'Application validation must ensure bundle_product_id is a bundle and included_product_id is an individual template (spec 14.3); not enforceable as a plain CHECK constraint since it depends on another row''s product_type.';

create index it_bundle_items_included_product_id_idx on public.it_bundle_items (included_product_id);

create table public.it_product_relationships (
  source_product_id uuid not null references public.it_products(id) on delete cascade,
  target_product_id uuid not null references public.it_products(id) on delete cascade,
  relationship_type text not null,
  display_order integer not null default 0,
  primary key (source_product_id, target_product_id, relationship_type),
  constraint relationship_not_self check (source_product_id <> target_product_id)
);

comment on column public.it_product_relationships.relationship_type is
  'Suggested values per spec 14.3: next_step, related, alternative, bundle_upgrade, prerequisite.';

create index it_product_relationships_target_product_id_idx on public.it_product_relationships (target_product_id);
