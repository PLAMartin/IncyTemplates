-- Incy Templates v4: it_replace_product_file
-- Spec v4 §14.7.1/2152/10.11: "eligible downloadable Template artefacts to be replaced by
-- creating a new version/file record with validation, not by destructively overwriting the
-- previous file", "Editor/Admin capabilities [extend to] ... Template file versions".
--
-- The existing it_product_versions_one_current_per_product partial unique index
-- (20260728155513_product_versions_files_bundles.sql) means "make this the current version"
-- requires flipping the old current row's is_current to false and inserting the new one as
-- a single atomic step — two separate client-side calls could race or partially fail,
-- leaving either zero or two current versions. Mirrors the
-- it_upsert_content_draft/it_publish_content_revision functions' shape: this repo's
-- established pattern for "admin write that must be atomic and audited" is a security
-- definer function, granted only to service_role, that itself calls it_write_audit_log.
--
-- Storage upload (the actual file bytes) happens client-side via the service-role Supabase
-- client BEFORE calling this function — this function only does the DB bookkeeping once the
-- upload has already succeeded, matching scripts/seed-storage.ts's existing
-- upload-then-upsert-rows order.

create or replace function public.it_replace_product_file(
  p_product_id uuid,
  p_version text,
  p_file_role public.it_file_role,
  p_file_format public.it_file_format,
  p_display_name text,
  p_storage_bucket text,
  p_storage_path text,
  p_original_filename text,
  p_mime_type text,
  p_byte_size bigint,
  p_checksum_sha256 text,
  p_actor_profile_id uuid,
  p_release_notes text default null,
  p_is_public_preview boolean default false
)
returns public.it_files
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_previous_version_id uuid;
  v_version_id uuid;
  v_file public.it_files;
begin
  select id into v_previous_version_id
  from public.it_product_versions
  where product_id = p_product_id and is_current = true;

  if v_previous_version_id is not null then
    update public.it_product_versions set is_current = false where id = v_previous_version_id;
  end if;

  insert into public.it_product_versions (product_id, version, release_notes, is_current, released_at, created_by)
  values (p_product_id, p_version, p_release_notes, true, now(), p_actor_profile_id)
  returning id into v_version_id;

  insert into public.it_files (
    product_version_id, file_role, file_format, display_name, storage_bucket, storage_path,
    original_filename, mime_type, byte_size, checksum_sha256, is_public_preview, created_by
  )
  values (
    v_version_id, p_file_role, p_file_format, p_display_name, p_storage_bucket, p_storage_path,
    p_original_filename, p_mime_type, p_byte_size, p_checksum_sha256, p_is_public_preview, p_actor_profile_id
  )
  returning * into v_file;

  perform public.it_write_audit_log(
    'file_replace',
    'it_products',
    p_product_id,
    jsonb_build_object('previous_version_id', v_previous_version_id),
    jsonb_build_object('version_id', v_version_id, 'version', p_version, 'file_id', v_file.id),
    p_release_notes,
    p_actor_profile_id
  );

  return v_file;
end;
$$;

revoke execute on function public.it_replace_product_file(
  uuid, text, public.it_file_role, public.it_file_format, text, text, text, text, text, bigint, text, uuid, text, boolean
) from public;
grant execute on function public.it_replace_product_file(
  uuid, text, public.it_file_role, public.it_file_format, text, text, text, text, text, bigint, text, uuid, text, boolean
) to service_role;
