-- Incy Templates: database functions and triggers
-- Spec: section 15. Numbered comments below map to the numbered list in 15.
--
-- All security definer functions in this file:
--   - set a safe, explicit search_path (public, pg_temp) to avoid search_path hijacking;
--   - are narrowly scoped to a single responsibility;
--   - revoke execute from public and grant it only to the roles that legitimately need it;
--   - validate caller permissions where the function performs a privileged action.

-- ---------------------------------------------------------------------------------------
-- 15.1 set_updated_at() trigger function
-- ---------------------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public;
grant execute on function public.set_updated_at() to authenticated, service_role;

-- Applied to every table that has an updated_at column.
create trigger set_updated_at before update on public.it_profiles
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.it_customers
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.it_categories
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.it_stages
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.it_licences
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.it_products
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.it_orders
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.it_contact_enquiries
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------------------
-- 15.3 Email normalisation function
-- (placed before 15.2 because the auth-user trigger below depends on it)
-- ---------------------------------------------------------------------------------------

create or replace function public.it_normalize_email(p_email text)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  select nullif(lower(trim(p_email)), '');
$$;

revoke execute on function public.it_normalize_email(text) from public;
grant execute on function public.it_normalize_email(text) to authenticated, anon, service_role;

-- Generic trigger applying it_normalize_email() to a column literally named "email".
-- Used by it_profiles, it_customers, it_free_download_requests and it_waitlist_signups,
-- per spec 15.3 / 14.3's "email normalised to lowercase" requirement.
create or replace function public.it_normalize_email_column()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.email is not null then
    new.email = public.it_normalize_email(new.email);
  end if;
  return new;
end;
$$;

revoke execute on function public.it_normalize_email_column() from public;
grant execute on function public.it_normalize_email_column() to authenticated, anon, service_role;

create trigger normalize_email before insert or update of email on public.it_profiles
  for each row execute function public.it_normalize_email_column();

create trigger normalize_email before insert or update of email on public.it_customers
  for each row execute function public.it_normalize_email_column();

create trigger normalize_email before insert or update of email on public.it_free_download_requests
  for each row execute function public.it_normalize_email_column();

create trigger normalize_email before insert or update of email on public.it_waitlist_signups
  for each row execute function public.it_normalize_email_column();

-- ---------------------------------------------------------------------------------------
-- 15.2 Auth-user profile creation function
-- ---------------------------------------------------------------------------------------

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.it_profiles (id, email)
  values (new.id, public.it_normalize_email(new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_auth_user() from public;
-- Not granted to any client-facing role: this function is only ever invoked by the
-- auth.users insert trigger below, never called directly.

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------------------------
-- 15.4 Current product-version enforcement
-- ---------------------------------------------------------------------------------------
-- Implemented as a partial unique index rather than a trigger: see
-- it_product_versions_one_current_per_product in
-- 20260728155513_product_versions_files_bundles.sql. A partial unique index is simpler,
-- cannot be bypassed by any write path (including direct SQL or a future service-role
-- script), and needs no additional trigger maintenance.

-- ---------------------------------------------------------------------------------------
-- Role-change protection (supports 14.3: "Administrative role assignment must never be
-- controlled by editable user metadata" / "Role changes require server-side privileged
-- execution and audit logging"). RLS alone cannot restrict which *columns* an UPDATE
-- touches, so this is enforced with a BEFORE UPDATE trigger in addition to RLS.
-- ---------------------------------------------------------------------------------------

create or replace function public.it_profiles_protect_role()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.role is distinct from old.role then
    if auth.role() <> 'service_role' and not public.is_admin() then
      raise exception 'insufficient_privilege: only service_role or an admin/owner may change it_profiles.role';
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function public.it_profiles_protect_role() from public;
grant execute on function public.it_profiles_protect_role() to authenticated, service_role;

create trigger protect_role before update on public.it_profiles
  for each row execute function public.it_profiles_protect_role();

-- ---------------------------------------------------------------------------------------
-- 15.7 Admin-role helper functions using trusted database state (it_profiles.role via
-- auth.uid()), used throughout the RLS policies in 20260728155524_row_level_security.sql.
-- ---------------------------------------------------------------------------------------

create or replace function public.has_role(p_role public.it_user_role)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.it_profiles
    where id = auth.uid() and role = p_role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.it_profiles
    where id = auth.uid() and role in ('admin', 'owner')
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.it_profiles
    where id = auth.uid() and role in ('support', 'editor', 'admin', 'owner')
  );
$$;

revoke execute on function public.has_role(public.it_user_role) from public;
revoke execute on function public.is_admin() from public;
revoke execute on function public.is_staff() from public;
grant execute on function public.has_role(public.it_user_role) to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_staff() to authenticated;

-- ---------------------------------------------------------------------------------------
-- 15.9 Order-total consistency check
-- ---------------------------------------------------------------------------------------
-- A plain CHECK constraint is sufficient and self-enforcing for the order-level arithmetic
-- identity. Line-item-to-order-total reconciliation (summing it_order_items across an
-- order, accounting for quantity/rounding) is a fulfilment-service responsibility rather
-- than a database constraint, since it depends on multi-row state that CHECK constraints
-- cannot see without deferred constraint triggers.
alter table public.it_orders
  add constraint it_orders_totals_consistent
  check (total_minor = subtotal_minor - discount_minor + tax_minor);

-- ---------------------------------------------------------------------------------------
-- 15.6 Safe entitlement-grant function
-- ---------------------------------------------------------------------------------------
-- Idempotent: if an active entitlement already exists for the customer/product pair, the
-- existing row is returned rather than inserting a duplicate (also backstopped by the
-- it_entitlements_one_active_per_customer_product partial unique index).

create or replace function public.it_grant_entitlement(
  p_customer_id uuid,
  p_product_id uuid,
  p_source_order_item_id uuid default null,
  p_source_bundle_product_id uuid default null,
  p_profile_id uuid default null,
  p_includes_future_updates boolean default true
)
returns public.it_entitlements
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_entitlement public.it_entitlements;
begin
  select * into v_entitlement
  from public.it_entitlements
  where customer_id = p_customer_id
    and product_id = p_product_id
    and status = 'active';

  if found then
    return v_entitlement;
  end if;

  insert into public.it_entitlements (
    customer_id, profile_id, product_id, source_order_item_id,
    source_bundle_product_id, includes_future_updates
  )
  values (
    p_customer_id, p_profile_id, p_product_id, p_source_order_item_id,
    p_source_bundle_product_id, p_includes_future_updates
  )
  on conflict (customer_id, product_id) where status = 'active' do nothing
  returning * into v_entitlement;

  if v_entitlement.id is null then
    -- A concurrent grant won the race; fetch the row it created.
    select * into v_entitlement
    from public.it_entitlements
    where customer_id = p_customer_id
      and product_id = p_product_id
      and status = 'active';
  end if;

  return v_entitlement;
end;
$$;

revoke execute on function public.it_grant_entitlement(uuid, uuid, uuid, uuid, uuid, boolean) from public;
-- Fulfilment (Stripe webhook handling) runs with the service-role key server-side.
-- Not granted to anon/authenticated: entitlements must never be grantable directly
-- from the browser.
grant execute on function public.it_grant_entitlement(uuid, uuid, uuid, uuid, uuid, boolean) to service_role;

-- ---------------------------------------------------------------------------------------
-- 15.5 Bundle-expansion entitlement function
-- ---------------------------------------------------------------------------------------
-- Given a paid bundle purchase, grants one entitlement per included product using the
-- safe grant function above, tagging each with the bundle as source_bundle_product_id.

create or replace function public.it_expand_bundle_entitlements(
  p_bundle_product_id uuid,
  p_customer_id uuid,
  p_source_order_item_id uuid,
  p_profile_id uuid default null
)
returns setof public.it_entitlements
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_product_type public.it_product_type;
  v_bundle_item public.it_bundle_items;
  v_entitlement public.it_entitlements;
begin
  select product_type into v_product_type
  from public.it_products
  where id = p_bundle_product_id;

  if v_product_type is distinct from 'bundle' then
    raise exception 'invalid_argument: product % is not a bundle', p_bundle_product_id;
  end if;

  for v_bundle_item in
    select * from public.it_bundle_items where bundle_product_id = p_bundle_product_id
  loop
    v_entitlement := public.it_grant_entitlement(
      p_customer_id := p_customer_id,
      p_product_id := v_bundle_item.included_product_id,
      p_source_order_item_id := p_source_order_item_id,
      p_source_bundle_product_id := p_bundle_product_id,
      p_profile_id := p_profile_id
    );
    return next v_entitlement;
  end loop;

  return;
end;
$$;

revoke execute on function public.it_expand_bundle_entitlements(uuid, uuid, uuid, uuid) from public;
grant execute on function public.it_expand_bundle_entitlements(uuid, uuid, uuid, uuid) to service_role;

-- ---------------------------------------------------------------------------------------
-- 15.8 Search-vector update function
-- ---------------------------------------------------------------------------------------
-- Not needed as a trigger function: it_products.search_vector is a stored generated
-- column (see 20260728155511_products_categories_stages.sql) which PostgreSQL keeps in
-- sync automatically on every insert/update, so there is no separate function to write
-- or a trigger that could fall out of sync with the source columns.

-- ---------------------------------------------------------------------------------------
-- 15.10 Audit functions for privileged content changes
-- ---------------------------------------------------------------------------------------

create or replace function public.it_write_audit_log(
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_before_state jsonb default null,
  p_after_state jsonb default null,
  p_reason text default null
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
    auth.uid(), p_action, p_entity_type, p_entity_id, p_before_state, p_after_state, p_reason
  )
  returning * into v_row;

  return v_row;
end;
$$;

revoke execute on function public.it_write_audit_log(text, text, uuid, jsonb, jsonb, text) from public;
grant execute on function public.it_write_audit_log(text, text, uuid, jsonb, jsonb, text) to authenticated, service_role;

-- Automatically audit status/price changes to products (the two most consequential
-- fields an editor/admin can silently change).
create or replace function public.it_products_audit_privileged_changes()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if (old.status is distinct from new.status) or (old.price_minor is distinct from new.price_minor) then
    perform public.it_write_audit_log(
      'update',
      'it_products',
      new.id,
      jsonb_build_object('status', old.status, 'price_minor', old.price_minor),
      jsonb_build_object('status', new.status, 'price_minor', new.price_minor),
      null
    );
  end if;
  return new;
end;
$$;

revoke execute on function public.it_products_audit_privileged_changes() from public;
grant execute on function public.it_products_audit_privileged_changes() to authenticated, service_role;

create trigger audit_privileged_changes after update on public.it_products
  for each row execute function public.it_products_audit_privileged_changes();

-- Automatically audit role changes on profiles (the protect_role trigger above rejects
-- unauthorised attempts; this logs the authorised ones).
create or replace function public.it_profiles_audit_role_changes()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if old.role is distinct from new.role then
    perform public.it_write_audit_log(
      'role_change',
      'it_profiles',
      new.id,
      jsonb_build_object('role', old.role),
      jsonb_build_object('role', new.role),
      null
    );
  end if;
  return new;
end;
$$;

revoke execute on function public.it_profiles_audit_role_changes() from public;
grant execute on function public.it_profiles_audit_role_changes() to authenticated, service_role;

create trigger audit_role_changes after update on public.it_profiles
  for each row execute function public.it_profiles_audit_role_changes();
