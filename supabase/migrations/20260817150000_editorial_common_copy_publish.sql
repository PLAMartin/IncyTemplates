-- Incy Templates v8: admin editorial parity (Guides / Templates / Tools)
-- Spec v8 section 10.11.2 ("common product copy") + 12.3.1 ("Publish must validate the
-- complete common + type-specific editorial snapshot, atomically update the published
-- revision pointer and live denormalised product-copy fields ... then revalidate affected
-- public routes") + 14.7.1 ("content_schema_version = 2 ... Publishing atomically updates
-- the live product metadata used by existing public queries and the current revision
-- pointer").
--
-- it_product_content_revisions.content_data already supports arbitrary jsonb, and
-- it_upsert_content_draft already accepts an explicit p_content_schema_version parameter
-- (20260812090010_it_product_content_revisions.sql) -- no table/insert-side change needed.
-- What's missing: publish/rollback don't yet copy a v2 revision's `content_data->'common'`
-- into the denormalised it_products columns that existing public queries read directly
-- (short_description, full_description, etc. -- see 20260728155511_products_categories_stages.sql).
-- This migration extends both functions (CREATE OR REPLACE, same signature -- compatible,
-- same reasoning as that migration's own it_write_audit_log change) to do so atomically
-- alongside the existing current_content_revision_id update, so the site never sees a
-- half-published state.
--
-- content_schema_version = 1 rows (all pre-v8 Guide history) are left exactly as before --
-- v_common resolves to null for them, and every column assignment below is a no-op in that
-- branch. name/short_description use coalesce()/nullif() because they're NOT NULL columns on
-- it_products; the admin form's Zod schema (src/server/admin/editorial-content.ts) already
-- requires both to be non-empty before a v2 draft can be saved, so this is defence in depth,
-- not the primary validation.

create or replace function public.it_publish_content_revision(
  p_revision_id uuid,
  p_actor_profile_id uuid
)
returns public.it_product_content_revisions
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public.it_product_content_revisions;
  v_previous_revision_id uuid;
  v_common jsonb;
begin
  select current_content_revision_id into v_previous_revision_id
  from public.it_products
  where id = (
    select product_id from public.it_product_content_revisions where id = p_revision_id
  );

  update public.it_product_content_revisions
  set published_at = now(), published_by = p_actor_profile_id
  where id = p_revision_id and published_at is null
  returning * into v_row;

  if v_row.id is null then
    raise exception 'invalid_argument: revision % is not an unpublished draft', p_revision_id;
  end if;

  v_common := case when v_row.content_schema_version = 2 then v_row.content_data->'common' else null end;

  update public.it_products
  set
    current_content_revision_id = v_row.id,
    updated_by = p_actor_profile_id,
    name = case when v_common is not null then coalesce(v_common->>'name', name) else name end,
    short_description = case when v_common is not null then coalesce(nullif(v_common->>'short_description', ''), short_description) else short_description end,
    full_description = case when v_common is not null then v_common->>'full_description' else full_description end,
    outcome_statement = case when v_common is not null then v_common->>'outcome_statement' else outcome_statement end,
    target_audience = case when v_common is not null then v_common->>'target_audience' else target_audience end,
    when_to_use = case when v_common is not null then v_common->>'when_to_use' else when_to_use end,
    when_not_to_use = case when v_common is not null then v_common->>'when_not_to_use' else when_not_to_use end,
    seo_title = case when v_common is not null then v_common->>'seo_title' else seo_title end,
    seo_description = case when v_common is not null then v_common->>'seo_description' else seo_description end
  where id = v_row.product_id;

  perform public.it_write_audit_log(
    'publish',
    'it_product_content_revisions',
    v_row.id,
    jsonb_build_object('previous_revision_id', v_previous_revision_id),
    jsonb_build_object('revision_id', v_row.id, 'revision_number', v_row.revision_number),
    null,
    p_actor_profile_id
  );

  return v_row;
end;
$$;

create or replace function public.it_rollback_content_revision(
  p_product_id uuid,
  p_source_revision_id uuid,
  p_actor_profile_id uuid,
  p_reason text default null
)
returns public.it_product_content_revisions
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_source public.it_product_content_revisions;
  v_next_revision integer;
  v_row public.it_product_content_revisions;
  v_previous_revision_id uuid;
  v_common jsonb;
begin
  select * into v_source
  from public.it_product_content_revisions
  where id = p_source_revision_id and product_id = p_product_id;

  if v_source.id is null then
    raise exception 'invalid_argument: revision % does not belong to product %',
      p_source_revision_id, p_product_id;
  end if;

  select current_content_revision_id into v_previous_revision_id
  from public.it_products where id = p_product_id;

  select coalesce(max(revision_number), 0) + 1 into v_next_revision
  from public.it_product_content_revisions
  where product_id = p_product_id;

  insert into public.it_product_content_revisions (
    product_id, revision_number, content_schema_version, content_data, change_note,
    created_by, published_by, published_at, supersedes_revision_id
  )
  values (
    p_product_id, v_next_revision, v_source.content_schema_version, v_source.content_data,
    coalesce(p_reason, 'Rollback to revision ' || v_source.revision_number),
    p_actor_profile_id, p_actor_profile_id, now(), v_source.id
  )
  returning * into v_row;

  v_common := case when v_row.content_schema_version = 2 then v_row.content_data->'common' else null end;

  update public.it_products
  set
    current_content_revision_id = v_row.id,
    updated_by = p_actor_profile_id,
    name = case when v_common is not null then coalesce(v_common->>'name', name) else name end,
    short_description = case when v_common is not null then coalesce(nullif(v_common->>'short_description', ''), short_description) else short_description end,
    full_description = case when v_common is not null then v_common->>'full_description' else full_description end,
    outcome_statement = case when v_common is not null then v_common->>'outcome_statement' else outcome_statement end,
    target_audience = case when v_common is not null then v_common->>'target_audience' else target_audience end,
    when_to_use = case when v_common is not null then v_common->>'when_to_use' else when_to_use end,
    when_not_to_use = case when v_common is not null then v_common->>'when_not_to_use' else when_not_to_use end,
    seo_title = case when v_common is not null then v_common->>'seo_title' else seo_title end,
    seo_description = case when v_common is not null then v_common->>'seo_description' else seo_description end
  where id = p_product_id;

  perform public.it_write_audit_log(
    'rollback',
    'it_product_content_revisions',
    v_row.id,
    jsonb_build_object('previous_revision_id', v_previous_revision_id),
    jsonb_build_object('revision_id', v_row.id, 'rolled_back_to', v_source.id),
    p_reason,
    p_actor_profile_id
  );

  return v_row;
end;
$$;

revoke execute on function public.it_publish_content_revision(uuid, uuid) from public;
revoke execute on function public.it_rollback_content_revision(uuid, uuid, uuid, text) from public;
grant execute on function public.it_publish_content_revision(uuid, uuid) to service_role;
grant execute on function public.it_rollback_content_revision(uuid, uuid, uuid, text) to service_role;
