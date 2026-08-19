-- Incy Templates v9: it_collections + it_collection_frameworks
-- Spec v9 §14.3.1: a lightweight editorial Collection layer above frameworks, used to express
-- a curated, ordered visitor journey (the launch "Start a Product" collection) independently of
-- the existing `flagship` boolean and `next_step_framework_id` chain -- §12.3.2 is explicit that
-- "Core Collection membership is separate from featured/legacy flagship metadata", and the
-- current `flagship` set (6 frameworks, includes Better Decision Maker/Product Naming System,
-- excludes Customer Demand Test) does not match the 5-family Core Collection, confirming this
-- needs new purpose-built data rather than a relabelled column.
--
-- DDL below matches spec v9 §14.3.1 verbatim (table/column names, types, defaults, constraints).
-- `status` is a plain text + check constraint per the spec's own DDL, not a new Postgres enum --
-- deliberately not matching it_frameworks' `it_framework_status` enum convention, since the spec
-- gives this exact shape and a three-value draft/published/archived set has no other consumer
-- that would benefit from enum reuse.

create table public.it_collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'draft'
    check (status in ('draft','published','archived')),
  public_visibility public.it_public_visibility not null default 'public',
  headline text,
  short_description text not null,
  display_order integer not null default 0,
  is_core boolean not null default false,
  seo_title text,
  seo_description text,
  created_by uuid references public.it_profiles(id),
  updated_by uuid references public.it_profiles(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.it_collections
  for each row execute function public.set_updated_at();

-- Spec §14.16: "Collections by status/public_visibility/is_core/display_order".
create index it_collections_status_visibility_core_idx
  on public.it_collections (status, public_visibility, is_core, display_order);

create table public.it_collection_frameworks (
  collection_id uuid not null references public.it_collections(id) on delete cascade,
  framework_id uuid not null references public.it_frameworks(id) on delete restrict,
  step_order integer not null,
  step_label text not null,
  transition_copy text,
  is_required boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (collection_id, framework_id),
  unique (collection_id, step_order)
);

-- The composite PK covers (collection_id, framework_id); the unique constraint above covers
-- (collection_id, step_order). Neither covers the reverse "which collections is this framework
-- in" lookup spec §14.16 also calls for, so index framework_id directly.
create index it_collection_frameworks_framework_id_idx
  on public.it_collection_frameworks (framework_id);

-- ---------------------------------------------------------------------------------------
-- RLS -- same shape as it_frameworks (20260809160010_it_frameworks_rls.sql,
-- 20260812090005_it_products_frameworks_visibility.sql): anon/authenticated can read
-- published + non-hidden rows, staff can read everything regardless of status, and all writes
-- go through the service-role client only -- there is no staff write RLS policy on
-- it_frameworks/it_products either (see src/server/admin/frameworks.ts's header comment for why:
-- privileged writes are enforced by `requireRole()` in the Server Action layer, not by RLS).
-- A member row is publicly readable only when both its own collection and the linked framework
-- clear the same "published and not hidden" bar -- mirrors the bundle_items /
-- product_relationships two-sided-exists pattern from 20260812090005 rather than inventing a new
-- shape. This is the DB-layer "hidden is never readable" guarantee only; the app-level
-- distinction between "public" and "unlisted" member frameworks for collection *rendering* (spec
-- §12.3.2: public collection queries return only public member frameworks) is enforced in the
-- query layer, same division of responsibility as getFrameworkOutputs/getFrameworkTeasers today.
-- ---------------------------------------------------------------------------------------

alter table public.it_collections enable row level security;

create policy "public can read published collections"
  on public.it_collections for select
  to anon, authenticated
  using (status = 'published' and public_visibility <> 'hidden');

create policy "staff can read all collections regardless of status"
  on public.it_collections for select
  to authenticated
  using ((select public.is_staff()));

grant select on public.it_collections to anon, authenticated;

alter table public.it_collection_frameworks enable row level security;

create policy "public can read members of published collections"
  on public.it_collection_frameworks for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.it_collections c
      where c.id = it_collection_frameworks.collection_id
        and c.status = 'published'
        and c.public_visibility <> 'hidden'
    )
    and exists (
      select 1 from public.it_frameworks f
      where f.id = it_collection_frameworks.framework_id
        and f.status = 'published'
        and f.public_visibility <> 'hidden'
    )
  );

create policy "staff can read all collection members"
  on public.it_collection_frameworks for select
  to authenticated
  using ((select public.is_staff()));

grant select on public.it_collection_frameworks to anon, authenticated;
