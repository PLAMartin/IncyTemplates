-- Incy Templates v5: visual-asset lifecycle functions
-- Spec v5 §9.12: generation/select/reject, and "approves and publishes" as one explicit editor
-- action (point 9), plus "Restore a prior approved visual as a new publication action without
-- rewriting history" (point 11). Same shape as the content-revision functions
-- (20260812090010_it_product_content_revisions.sql): security definer, granted only to
-- service_role, self-auditing via it_write_audit_log.
--
-- Deliberate deviation from the status enum's five reachable states: spec §9.12 point 9
-- describes "approve and publish" as a single editor action ("An authorised Editor/Admin
-- explicitly approves and publishes the visual"), not two separate button-presses. So
-- it_publish_visual_asset below sets approved_at/approved_by and published_at/published_by in
-- the same call rather than requiring a distinct persisted 'approved'-only resting state first —
-- 'approved' as an independently reachable UI state is schema-valid but nothing in this build
-- produces it as a standalone step, matching the spec's own action grouping.

create or replace function public.it_select_visual_candidate(
  p_asset_id uuid,
  p_actor_profile_id uuid
)
returns public.it_visual_assets
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public.it_visual_assets;
begin
  update public.it_visual_assets
  set status = 'selected', selected_at = now(), selected_by = p_actor_profile_id
  where id = p_asset_id and status in ('candidate', 'selected')
  returning * into v_row;

  if v_row.id is null then
    raise exception 'invalid_argument: asset % is not a candidate/selected visual', p_asset_id;
  end if;

  perform public.it_write_audit_log(
    'visual_select', 'it_visual_assets', v_row.id, null,
    jsonb_build_object('status', v_row.status), null, p_actor_profile_id
  );

  return v_row;
end;
$$;

create or replace function public.it_reject_visual_candidate(
  p_asset_id uuid,
  p_actor_profile_id uuid,
  p_reason text default null
)
returns public.it_visual_assets
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public.it_visual_assets;
begin
  update public.it_visual_assets
  set status = 'archived', archived_at = now()
  where id = p_asset_id and status in ('candidate', 'selected')
  returning * into v_row;

  if v_row.id is null then
    raise exception 'invalid_argument: asset % is not a candidate/selected visual', p_asset_id;
  end if;

  perform public.it_write_audit_log(
    'visual_reject', 'it_visual_assets', v_row.id, null, null, p_reason, p_actor_profile_id
  );

  return v_row;
end;
$$;

-- Used for both "approve and publish" (spec §9.12 point 9, target is a candidate/selected row)
-- and "restore" (point 11, target is a previously-published-then-archived row) -- the mechanics
-- are identical either way: archive whatever is currently published for this
-- framework/product+asset_type slot, then publish the target row. Callers distinguish the two
-- only in their own UI copy/audit-log action name context, not in this function's behaviour.
create or replace function public.it_publish_visual_asset(
  p_asset_id uuid,
  p_actor_profile_id uuid
)
returns public.it_visual_assets
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_target public.it_visual_assets;
  v_previous_published_id uuid;
  v_row public.it_visual_assets;
begin
  select * into v_target from public.it_visual_assets where id = p_asset_id;
  if v_target.id is null then
    raise exception 'invalid_argument: asset % does not exist', p_asset_id;
  end if;
  if v_target.storage_bucket is null or v_target.storage_path is null then
    raise exception 'invalid_argument: asset % has no master file to publish', p_asset_id;
  end if;

  select id into v_previous_published_id
  from public.it_visual_assets
  where status = 'published'
    and id <> p_asset_id
    and asset_type = v_target.asset_type
    and framework_id is not distinct from v_target.framework_id
    and product_id is not distinct from v_target.product_id;

  if v_previous_published_id is not null then
    update public.it_visual_assets
    set status = 'archived', archived_at = now()
    where id = v_previous_published_id;
  end if;

  update public.it_visual_assets
  set
    status = 'published',
    approved_at = coalesce(approved_at, now()),
    approved_by = coalesce(approved_by, p_actor_profile_id),
    published_at = now(),
    published_by = p_actor_profile_id,
    archived_at = null
  where id = p_asset_id
  returning * into v_row;

  perform public.it_write_audit_log(
    'visual_publish', 'it_visual_assets', v_row.id,
    jsonb_build_object('previous_published_id', v_previous_published_id),
    jsonb_build_object('status', v_row.status, 'asset_type', v_row.asset_type),
    null, p_actor_profile_id
  );

  return v_row;
end;
$$;

revoke execute on function public.it_select_visual_candidate(uuid, uuid) from public;
grant execute on function public.it_select_visual_candidate(uuid, uuid) to service_role;

revoke execute on function public.it_reject_visual_candidate(uuid, uuid, text) from public;
grant execute on function public.it_reject_visual_candidate(uuid, uuid, text) to service_role;

revoke execute on function public.it_publish_visual_asset(uuid, uuid) from public;
grant execute on function public.it_publish_visual_asset(uuid, uuid) to service_role;
