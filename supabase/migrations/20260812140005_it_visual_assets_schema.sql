-- Incy Templates v5: visual-asset data model
-- Spec v5 section 14.13 (`it_visual_recipes`, `it_visual_assets`, `it_visual_asset_variants`).
--
-- Deviation from the spec's literal DDL (see docs/decisions/0005-schema-deviations.md for the
-- established pattern of documenting these): `master_file_id`/`file_id` are NOT foreign keys
-- into `it_files`. That table's `product_version_id` is `not null references
-- it_product_versions(id)` (20260728155513_product_versions_files_bundles.sql) -- every row is
-- scoped to a specific downloadable product version. A visual asset can belong to a framework
-- (which has no version concept at all) or to a product without being a "version" of a
-- downloadable file, so it_files' NOT NULL constraint can't be satisfied. Rather than relax a
-- foundational, heavily-relied-on constraint, it_visual_assets/it_visual_asset_variants carry
-- their own storage_bucket/storage_path/mime_type/byte_size/checksum columns directly, mirroring
-- it_files' shape without the mismatched FK.

create table public.it_visual_recipes (
  id uuid primary key default gen_random_uuid(),
  recipe_key text not null,
  version integer not null,
  name text not null,
  status text not null default 'draft',
  config_data jsonb not null default '{}'::jsonb,
  prompt_template text,
  created_by uuid not null references public.it_profiles(id),
  created_at timestamptz not null default now(),
  approved_by uuid references public.it_profiles(id),
  approved_at timestamptz,
  unique (recipe_key, version)
);

comment on table public.it_visual_recipes is
  'Versioned site-wide visual-generation/composition rules (spec v5 §11.6, §14.13). config_data holds safe art-direction/design-token references only -- never provider API keys or other secrets. A recipe version is immutable once an approved/published visual references it (enforced by convention/audit, not a DB trigger, matching how it_product_versions history is treated).';

create table public.it_visual_assets (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid references public.it_frameworks(id) on delete cascade,
  product_id uuid references public.it_products(id) on delete cascade,
  asset_type public.it_visual_asset_type not null,
  source_type public.it_visual_source_type not null,
  status public.it_visual_asset_status not null default 'candidate',
  visual_recipe_id uuid references public.it_visual_recipes(id),
  visual_brief jsonb not null default '{}'::jsonb,
  prompt_snapshot text,
  provider text,
  provider_model text,
  provider_asset_id text,
  generation_metadata jsonb not null default '{}'::jsonb,
  storage_bucket text,
  storage_path text,
  original_filename text,
  mime_type text,
  byte_size bigint,
  checksum_sha256 text,
  alt_text text,
  decorative boolean not null default false,
  parent_asset_id uuid references public.it_visual_assets(id),
  selected_at timestamptz,
  selected_by uuid references public.it_profiles(id),
  approved_at timestamptz,
  approved_by uuid references public.it_profiles(id),
  published_at timestamptz,
  published_by uuid references public.it_profiles(id),
  created_at timestamptz not null default now(),
  created_by uuid not null references public.it_profiles(id),
  archived_at timestamptz,
  constraint visual_has_owner check (
    framework_id is not null or product_id is not null
  ),
  constraint visual_alt_rule check (
    decorative = true
    or status in ('candidate', 'failed')
    or nullif(trim(alt_text), '') is not null
  ),
  constraint visual_master_file_rule check (
    status not in ('selected', 'approved', 'published')
    or (storage_bucket is not null and storage_path is not null)
  )
);

comment on table public.it_visual_assets is
  'Master candidate/approved visuals and their editorial/generation history (spec v5 §14.13). prompt_snapshot/provider_*/generation_metadata are admin-only provenance, never publicly readable -- see it_visual_assets_public. A generated asset may not jump straight from candidate to published; selection and approval are separate, explicit steps (enforced at the application/RPC layer, matching the it_product_content_revisions draft/publish/rollback convention).';

create index it_visual_assets_framework_id_idx on public.it_visual_assets (framework_id);
create index it_visual_assets_product_id_idx on public.it_visual_assets (product_id);
create index it_visual_assets_status_idx on public.it_visual_assets (status);
create index it_visual_assets_parent_asset_id_idx on public.it_visual_assets (parent_asset_id);

create table public.it_visual_asset_variants (
  id uuid primary key default gen_random_uuid(),
  visual_asset_id uuid not null references public.it_visual_assets(id) on delete cascade,
  variant_key text not null,
  storage_bucket text not null,
  storage_path text not null,
  width integer not null,
  height integer not null,
  format text not null,
  byte_size bigint,
  created_at timestamptz not null default now(),
  unique (visual_asset_id, variant_key, format)
);

comment on table public.it_visual_asset_variants is
  'Deterministic delivery variants derived from an approved visual master (spec v5 §14.13, §11.10). Recommended variant_key values: card_sm, card_md, hero_md, hero_lg, og_1200x630. Generation is deterministic image processing, never another AI provider call.';

create index it_visual_asset_variants_visual_asset_id_idx on public.it_visual_asset_variants (visual_asset_id);
