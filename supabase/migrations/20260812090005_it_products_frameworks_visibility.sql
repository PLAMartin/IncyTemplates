-- Incy Templates v4: public_visibility for it_products and it_frameworks
-- Spec v4: section 14.3 (it_frameworks gains public_visibility/hidden_at/hidden_by/
-- visibility_note), section 14.7 (same columns on it_products, plus content_path and
-- current_content_revision_id), section 14.7.2 (visibility semantics), section 16
-- (RLS must enforce hidden at the DB layer, not just app code).
--
-- Note: it_product_status already has an 'unlisted' enum value from v3
-- (20260728155503_enums.sql), which conflates lifecycle and visibility -- exactly the
-- problem v4's spec introduction (line 17) calls out. That value is left in place
-- (Postgres enum values can't be cheaply dropped) but is superseded going forward:
-- public_visibility is now the single source of truth for what visitors can see, and
-- status='unlisted' is not read by any policy or query added in this migration or after.
--
-- current_content_revision_id is added as a bare uuid column here (no FK yet) per the
-- spec's own note (line 1491) to avoid circular table-creation order -- the FK is added
-- in 20260812090010_it_product_content_revisions.sql once that table exists.

alter table public.it_products
  add column public_visibility public.it_public_visibility not null default 'public',
  add column hidden_at timestamptz,
  add column hidden_by uuid references public.it_profiles(id),
  add column visibility_note text,
  add column content_path text,
  add column current_content_revision_id uuid;

alter table public.it_frameworks
  add column public_visibility public.it_public_visibility not null default 'public',
  add column hidden_at timestamptz,
  add column hidden_by uuid references public.it_profiles(id),
  add column visibility_note text;

create index it_products_public_visibility_idx on public.it_products (public_visibility);

-- ---------------------------------------------------------------------------------------
-- RLS: hidden must be enforced at the DB layer (spec 14.7.2 / 41), not only in app queries.
-- Every existing policy that joins back to it_products.status = 'published' to decide
-- public readability gets the same public_visibility <> 'hidden' guard added, so a hidden
-- Template's files/versions/bundle membership/relationships aren't independently readable
-- even though the product row itself is now hidden from anon/authenticated. Policies are
-- dropped and recreated with identical names/targets/roles -- only the USING clause changes.
-- ---------------------------------------------------------------------------------------

drop policy "public can read published products" on public.it_products;
create policy "public can read published products"
  on public.it_products for select
  to anon, authenticated
  using (status = 'published' and public_visibility <> 'hidden');

drop policy "public can read published frameworks" on public.it_frameworks;
create policy "public can read published frameworks"
  on public.it_frameworks for select
  to anon, authenticated
  using (status = 'published' and public_visibility <> 'hidden');

drop policy "public can read categories of published products" on public.it_product_categories;
create policy "public can read categories of published products"
  on public.it_product_categories for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.it_products p
      where p.id = it_product_categories.product_id
        and p.status = 'published'
        and p.public_visibility <> 'hidden'
    )
  );

drop policy "public can read stages of published products" on public.it_product_stages;
create policy "public can read stages of published products"
  on public.it_product_stages for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.it_products p
      where p.id = it_product_stages.product_id
        and p.status = 'published'
        and p.public_visibility <> 'hidden'
    )
  );

drop policy "public can read current versions of published products" on public.it_product_versions;
create policy "public can read current versions of published products"
  on public.it_product_versions for select
  to anon, authenticated
  using (
    is_current = true
    and exists (
      select 1 from public.it_products p
      where p.id = it_product_versions.product_id
        and p.status = 'published'
        and p.public_visibility <> 'hidden'
    )
  );

drop policy "public can read preview file metadata for published products" on public.it_files;
create policy "public can read preview file metadata for published products"
  on public.it_files for select
  to anon, authenticated
  using (
    is_public_preview = true
    and exists (
      select 1
      from public.it_product_versions pv
      join public.it_products p on p.id = pv.product_id
      where pv.id = it_files.product_version_id
        and p.status = 'published'
        and p.public_visibility <> 'hidden'
    )
  );

drop policy "public can read template file metadata for published free products" on public.it_files;
create policy "public can read template file metadata for published free products"
  on public.it_files for select
  to anon, authenticated
  using (
    file_role = 'template'
    and exists (
      select 1
      from public.it_product_versions pv
      join public.it_products p on p.id = pv.product_id
      where pv.id = it_files.product_version_id
        and pv.is_current = true
        and p.status = 'published'
        and p.public_visibility <> 'hidden'
        and p.access_type = 'free'
    )
  );

drop policy "public can read bundle items where both sides are published" on public.it_bundle_items;
create policy "public can read bundle items where both sides are published"
  on public.it_bundle_items for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.it_products bp
      where bp.id = it_bundle_items.bundle_product_id
        and bp.status = 'published'
        and bp.public_visibility <> 'hidden'
    )
    and exists (
      select 1 from public.it_products ip
      where ip.id = it_bundle_items.included_product_id
        and ip.status = 'published'
        and ip.public_visibility <> 'hidden'
    )
  );

drop policy "public can read relationships between published products" on public.it_product_relationships;
create policy "public can read relationships between published products"
  on public.it_product_relationships for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.it_products sp
      where sp.id = it_product_relationships.source_product_id
        and sp.status = 'published'
        and sp.public_visibility <> 'hidden'
    )
    and exists (
      select 1 from public.it_products tp
      where tp.id = it_product_relationships.target_product_id
        and tp.status = 'published'
        and tp.public_visibility <> 'hidden'
    )
  );

-- it_frameworks_teasers (20260809160010_it_frameworks_rls.sql) is the security boundary
-- for its own rows (not security_invoker), so its WHERE clause needs the same hidden guard
-- directly -- a hidden flagship draft must not show as a "coming soon" teaser card.
create or replace view public.it_frameworks_teasers as
select
  f.id,
  f.name,
  f.slug,
  f.short_description,
  f.outcome_statement,
  f.status,
  f.flagship,
  f.display_order,
  s.slug as journey_stage_slug,
  s.name as journey_stage_name
from public.it_frameworks f
left join public.it_stages s on s.id = f.journey_stage_id
where f.public_visibility <> 'hidden'
  and (f.status = 'published' or (f.status = 'draft' and f.flagship = true));
