-- Incy Templates v4: it_product_content_revisions
-- Spec v4: section 14.7.1 (table shape reproduced verbatim), section 10.11 (admin editor
-- capabilities: draft/preview/publish/rollback), section 41 (draft revisions never public).
--
-- Design choices not fully spelled out by the spec's SQL snippet:
--   - Draft mutability: the spec explicitly allows either "draft is replaced in place" or
--     "draft is itself immutable, edits create a new draft" (line 1526), and says to pick
--     one consistently. This chooses the former (mutable draft) via an upsert function --
--     matches ordinary CMS "save draft" UX (repeated saves while editing shouldn't fork a
--     new revision row per keystroke) and mirrors the existing
--     it_product_versions_one_current_per_product partial-unique-index pattern
--     (20260728155513_product_versions_files_bundles.sql) with "one open draft" instead of
--     "one current version" as the invariant.
--   - Rollback publishes immediately (create + publish as one atomic step) rather than
--     landing as a new draft needing a second "publish" click -- "rollback" is read here as
--     "restore the live site to a previous state now", which is also what the spec's own
--     wording ("Rollback creates/publishes a new revision", line 1528) suggests.
--   - All writes go through the three security-definer functions below, executed only via
--     service_role (never granted to `authenticated`) -- this repo's RLS migration
--     deliberately has zero staff write policies anywhere; privileged writes always go
--     through server-side routes using the service-role key, and this table follows that
--     same convention rather than inventing staff RLS write policies for itself.

create table public.it_product_content_revisions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.it_products(id) on delete cascade,
  revision_number integer not null,
  content_schema_version integer not null default 1,
  content_data jsonb not null default '{}'::jsonb,
  change_note text,
  created_by uuid not null references public.it_profiles(id),
  created_at timestamptz not null default now(),
  published_by uuid references public.it_profiles(id),
  published_at timestamptz,
  supersedes_revision_id uuid references public.it_product_content_revisions(id),
  unique (product_id, revision_number)
);

-- "At most one open draft per product" -- mirrors it_product_versions_one_current_per_product.
create unique index it_product_content_revisions_one_draft_per_product
  on public.it_product_content_revisions (product_id)
  where published_at is null;

create index it_product_content_revisions_product_id_idx
  on public.it_product_content_revisions (product_id);

-- FK deferred from the it_products table-creation migration per the spec's own note
-- (line 1491) about avoiding circular table-creation order; added now that this table exists.
alter table public.it_products
  add constraint it_products_current_content_revision_id_fkey
  foreign key (current_content_revision_id)
  references public.it_product_content_revisions(id);

-- ---------------------------------------------------------------------------------------
-- Extend it_write_audit_log with an optional explicit actor.
--
-- The existing function (20260728155522_functions_and_triggers.sql) always records
-- auth.uid() as the actor. That's correct for its existing callers -- triggers that fire
-- during an ordinary RLS-scoped `authenticated` write. But admin content/visibility/file
-- mutations run through the service-role client (per the convention above), where there is
-- no request-bound auth.uid() to read. Appending a new trailing parameter with a default
-- is a compatible CREATE OR REPLACE (same function identity, existing grants/callers
-- unaffected) -- see PostgreSQL docs on adding defaulted parameters to an existing function.
-- ---------------------------------------------------------------------------------------

create or replace function public.it_write_audit_log(
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_before_state jsonb default null,
  p_after_state jsonb default null,
  p_reason text default null,
  p_actor_profile_id uuid default null
)
returns public.it_audit_log
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public.it_audit_log;
begin
  insert into public.it_audit_log (
    actor_profile_id, action, entity_type, entity_id, before_state, after_state, reason
  )
  values (
    coalesce(p_actor_profile_id, auth.uid()), p_action, p_entity_type, p_entity_id,
    p_before_state, p_after_state, p_reason
  )
  returning * into v_row;

  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------------------
-- Draft/publish/rollback functions. All three are security definer (bypass RLS as the
-- function owner, consistent with it_grant_entitlement and friends) and granted only to
-- service_role -- callers are admin server routes that have already run their own
-- requireRole() check in the app-layer DAL before invoking these.
-- ---------------------------------------------------------------------------------------

create or replace function public.it_upsert_content_draft(
  p_product_id uuid,
  p_content_data jsonb,
  p_actor_profile_id uuid,
  p_change_note text default null,
  p_content_schema_version integer default 1
)
returns public.it_product_content_revisions
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_next_revision integer;
  v_row public.it_product_content_revisions;
begin
  select coalesce(max(revision_number), 0) + 1 into v_next_revision
  from public.it_product_content_revisions
  where product_id = p_product_id;

  insert into public.it_product_content_revisions (
    product_id, revision_number, content_schema_version, content_data, change_note, created_by
  )
  values (
    p_product_id, v_next_revision, p_content_schema_version, p_content_data, p_change_note,
    p_actor_profile_id
  )
  on conflict (product_id) where published_at is null
  do update set
    content_data = excluded.content_data,
    change_note = excluded.change_note,
    content_schema_version = excluded.content_schema_version
  returning * into v_row;

  return v_row;
end;
$$;

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

  update public.it_products
  set current_content_revision_id = v_row.id, updated_by = p_actor_profile_id
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

  update public.it_products
  set current_content_revision_id = v_row.id, updated_by = p_actor_profile_id
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

revoke execute on function public.it_upsert_content_draft(uuid, jsonb, uuid, text, integer) from public;
revoke execute on function public.it_publish_content_revision(uuid, uuid) from public;
revoke execute on function public.it_rollback_content_revision(uuid, uuid, uuid, text) from public;
grant execute on function public.it_upsert_content_draft(uuid, jsonb, uuid, text, integer) to service_role;
grant execute on function public.it_publish_content_revision(uuid, uuid) to service_role;
grant execute on function public.it_rollback_content_revision(uuid, uuid, uuid, text) to service_role;

-- ---------------------------------------------------------------------------------------
-- RLS: staff can read every revision (drafts included, for admin preview/editing); public
-- can read a revision only once it's published and its parent product is itself publicly
-- readable -- draft content_data is never exposed to anon/authenticated visitors.
-- ---------------------------------------------------------------------------------------

alter table public.it_product_content_revisions enable row level security;

create policy "staff can read all content revisions"
  on public.it_product_content_revisions for select
  to authenticated
  using ((select public.is_staff()));

create policy "public can read published content revisions"
  on public.it_product_content_revisions for select
  to anon, authenticated
  using (
    published_at is not null
    and exists (
      select 1 from public.it_products p
      where p.id = it_product_content_revisions.product_id
        and p.status = 'published'
        and p.public_visibility <> 'hidden'
    )
  );

grant select on public.it_product_content_revisions to anon, authenticated;
