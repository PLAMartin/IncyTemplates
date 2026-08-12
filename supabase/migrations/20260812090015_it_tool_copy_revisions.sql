-- Incy Templates v4: it_tool_copy_revisions
-- Spec v4: section 14.7.1 ("Tool: intro/instructions, field labels, help text, result
-- explanations, disclaimers, CTA labels and only Tool-declared safe configuration values"),
-- section 43.4 ("Tool admin-editable fields are explicitly separated from executable
-- logic"), spec line 998 ("must never expose a generic ... editor or allow arbitrary
-- executable code to be stored and executed from database content").
--
-- Same draft/publish/rollback shape as it_product_content_revisions
-- (20260812090010_it_product_content_revisions.sql), keyed by tool_key instead of
-- product_id -- a Tool's copy is a property of the tool_key (the version-controlled
-- registry entry in src/lib/tools/registry.ts), not of any one it_products row, even
-- though today each tool_key happens to back exactly one product. No FK to
-- it_products.tool_key: that column has a plain index (it_products_tool_key_idx), not a
-- uniqueness constraint, and validity of tool_key values is already enforced at the
-- application layer by the registry itself (tool_key is only ever a lookup string into a
-- hardcoded map, never a code path chosen by database content -- see the registry's own
-- comment). content_data here must only ever contain the fields a Tool explicitly declares
-- as safe via its copySchema (src/lib/tools/types.ts) -- never executable expressions.

create table public.it_tool_copy_revisions (
  id uuid primary key default gen_random_uuid(),
  tool_key text not null,
  revision_number integer not null,
  content_schema_version integer not null default 1,
  content_data jsonb not null default '{}'::jsonb,
  change_note text,
  created_by uuid not null references public.it_profiles(id),
  created_at timestamptz not null default now(),
  published_by uuid references public.it_profiles(id),
  published_at timestamptz,
  supersedes_revision_id uuid references public.it_tool_copy_revisions(id),
  unique (tool_key, revision_number)
);

create unique index it_tool_copy_revisions_one_draft_per_tool
  on public.it_tool_copy_revisions (tool_key)
  where published_at is null;

create index it_tool_copy_revisions_tool_key_idx on public.it_tool_copy_revisions (tool_key);

create or replace function public.it_upsert_tool_copy_draft(
  p_tool_key text,
  p_content_data jsonb,
  p_actor_profile_id uuid,
  p_change_note text default null,
  p_content_schema_version integer default 1
)
returns public.it_tool_copy_revisions
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_next_revision integer;
  v_row public.it_tool_copy_revisions;
begin
  select coalesce(max(revision_number), 0) + 1 into v_next_revision
  from public.it_tool_copy_revisions
  where tool_key = p_tool_key;

  insert into public.it_tool_copy_revisions (
    tool_key, revision_number, content_schema_version, content_data, change_note, created_by
  )
  values (
    p_tool_key, v_next_revision, p_content_schema_version, p_content_data, p_change_note,
    p_actor_profile_id
  )
  on conflict (tool_key) where published_at is null
  do update set
    content_data = excluded.content_data,
    change_note = excluded.change_note,
    content_schema_version = excluded.content_schema_version
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.it_publish_tool_copy_revision(
  p_revision_id uuid,
  p_actor_profile_id uuid
)
returns public.it_tool_copy_revisions
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public.it_tool_copy_revisions;
  v_previous_revision_id uuid;
begin
  select id into v_previous_revision_id
  from public.it_tool_copy_revisions
  where tool_key = (select tool_key from public.it_tool_copy_revisions where id = p_revision_id)
    and published_at is not null
  order by revision_number desc
  limit 1;

  update public.it_tool_copy_revisions
  set published_at = now(), published_by = p_actor_profile_id
  where id = p_revision_id and published_at is null
  returning * into v_row;

  if v_row.id is null then
    raise exception 'invalid_argument: revision % is not an unpublished draft', p_revision_id;
  end if;

  perform public.it_write_audit_log(
    'publish',
    'it_tool_copy_revisions',
    v_row.id,
    jsonb_build_object('previous_revision_id', v_previous_revision_id),
    jsonb_build_object('revision_id', v_row.id, 'revision_number', v_row.revision_number, 'tool_key', v_row.tool_key),
    null,
    p_actor_profile_id
  );

  return v_row;
end;
$$;

create or replace function public.it_rollback_tool_copy_revision(
  p_tool_key text,
  p_source_revision_id uuid,
  p_actor_profile_id uuid,
  p_reason text default null
)
returns public.it_tool_copy_revisions
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_source public.it_tool_copy_revisions;
  v_next_revision integer;
  v_row public.it_tool_copy_revisions;
begin
  select * into v_source
  from public.it_tool_copy_revisions
  where id = p_source_revision_id and tool_key = p_tool_key;

  if v_source.id is null then
    raise exception 'invalid_argument: revision % does not belong to tool %',
      p_source_revision_id, p_tool_key;
  end if;

  select coalesce(max(revision_number), 0) + 1 into v_next_revision
  from public.it_tool_copy_revisions
  where tool_key = p_tool_key;

  insert into public.it_tool_copy_revisions (
    tool_key, revision_number, content_schema_version, content_data, change_note,
    created_by, published_by, published_at, supersedes_revision_id
  )
  values (
    p_tool_key, v_next_revision, v_source.content_schema_version, v_source.content_data,
    coalesce(p_reason, 'Rollback to revision ' || v_source.revision_number),
    p_actor_profile_id, p_actor_profile_id, now(), v_source.id
  )
  returning * into v_row;

  perform public.it_write_audit_log(
    'rollback',
    'it_tool_copy_revisions',
    v_row.id,
    jsonb_build_object('rolled_back_to', v_source.id),
    jsonb_build_object('revision_id', v_row.id, 'tool_key', v_row.tool_key),
    p_reason,
    p_actor_profile_id
  );

  return v_row;
end;
$$;

revoke execute on function public.it_upsert_tool_copy_draft(text, jsonb, uuid, text, integer) from public;
revoke execute on function public.it_publish_tool_copy_revision(uuid, uuid) from public;
revoke execute on function public.it_rollback_tool_copy_revision(text, uuid, uuid, text) from public;
grant execute on function public.it_upsert_tool_copy_draft(text, jsonb, uuid, text, integer) to service_role;
grant execute on function public.it_publish_tool_copy_revision(uuid, uuid) to service_role;
grant execute on function public.it_rollback_tool_copy_revision(text, uuid, uuid, text) to service_role;

-- ---------------------------------------------------------------------------------------
-- RLS: staff read all; public reads only published copy for a tool_key that currently
-- backs a published, non-hidden product.
-- ---------------------------------------------------------------------------------------

alter table public.it_tool_copy_revisions enable row level security;

create policy "staff can read all tool copy revisions"
  on public.it_tool_copy_revisions for select
  to authenticated
  using ((select public.is_staff()));

create policy "public can read published tool copy revisions"
  on public.it_tool_copy_revisions for select
  to anon, authenticated
  using (
    published_at is not null
    and exists (
      select 1 from public.it_products p
      where p.tool_key = it_tool_copy_revisions.tool_key
        and p.status = 'published'
        and p.public_visibility <> 'hidden'
    )
  );

grant select on public.it_tool_copy_revisions to anon, authenticated;
