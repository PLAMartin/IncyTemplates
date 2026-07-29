-- Expose template-role file metadata for published free products to the
-- anon/public catalogue query. Without this, `getProductBySlug`'s public
-- read can never see a free product's template file (only
-- `is_public_preview = true` files, e.g. completed-example PDFs, were
-- previously visible), so the free view/download CTA on the product page
-- could never resolve a file id — a pre-existing gap independent of the
-- view-vs-download flow itself.
--
-- Scope is deliberately narrow: template-role files only, only for the
-- current version, only for published + free products. This does not touch
-- storage.objects policies — the `it-free-files` bucket stays private, file
-- content is still only reachable via a service-role-generated signed
-- read (or, for the view flow, a service-role storage download gated by a
-- signed view-grant cookie). Exposing this row's `storage_path` column
-- alongside id/file_role/file_format/display_name mirrors the existing
-- preview-file policy below, which already exposes the same columns for
-- `is_public_preview = true` rows.

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
        and p.access_type = 'free'
    )
  );
