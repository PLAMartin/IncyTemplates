-- Incy Templates v5: visual-asset RLS
-- Spec v5 §16.1: "Published/current Visual Asset metadata and public variants required by
-- the requested page; never candidate/selected/admin-only prompt metadata."
--
-- it_visual_assets always carries prompt_snapshot/provider_*/generation_metadata/visual_brief
-- editorial notes, regardless of status -- unlike it_product_content_revisions (where the
-- whole row becomes safe once published), there is no status value that makes every column of
-- this table public-safe. So, unlike that table, there is no anon/authenticated SELECT policy
-- on the base table at all: public reads go exclusively through it_visual_assets_public, a
-- narrow, explicit column allowlist, following the it_frameworks_teasers precedent
-- (20260809160010_it_frameworks_rls.sql) -- deliberately NOT security_invoker, so its own WHERE
-- clause is the complete security boundary and there is nothing sensitive in its column list to
-- leak regardless of the base table's RLS.

alter table public.it_visual_recipes enable row level security;

create policy "staff can read all visual recipes"
  on public.it_visual_recipes for select
  to authenticated
  using ((select public.is_staff()));

alter table public.it_visual_assets enable row level security;

create policy "staff can read all visual assets"
  on public.it_visual_assets for select
  to authenticated
  using ((select public.is_staff()));

create view public.it_visual_assets_public as
select
  a.id,
  a.framework_id,
  a.product_id,
  a.asset_type,
  a.alt_text,
  a.decorative,
  a.published_at
from public.it_visual_assets a
where a.status = 'published'
  and (
    a.framework_id is null
    or exists (
      select 1 from public.it_frameworks f
      where f.id = a.framework_id and f.status = 'published'
    )
  )
  and (
    a.product_id is null
    or exists (
      select 1 from public.it_products p
      where p.id = a.product_id and p.status = 'published' and p.public_visibility <> 'hidden'
    )
  );

comment on view public.it_visual_assets_public is
  'Public-safe projection of published visual assets: never exposes prompt_snapshot, provider_*, generation_metadata or visual_brief editorial notes. Excludes assets whose parent framework/product is itself not publicly visible, so a hidden product cannot leak its approved visual through this side door.';

grant select on public.it_visual_assets_public to anon, authenticated;

alter table public.it_visual_asset_variants enable row level security;

create policy "staff can read all visual asset variants"
  on public.it_visual_asset_variants for select
  to authenticated
  using ((select public.is_staff()));

create policy "public can read variants of published visual assets"
  on public.it_visual_asset_variants for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.it_visual_assets_public p
      where p.id = it_visual_asset_variants.visual_asset_id
    )
  );

grant select on public.it_visual_asset_variants to anon, authenticated;
