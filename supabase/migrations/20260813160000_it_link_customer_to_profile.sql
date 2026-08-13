-- Account-linking function (spec §18.2): on any authenticated session, link unlinked active
-- it_customers rows (and their entitlements) whose email matches the caller's own verified
-- profile email. Idempotent -- a customer with nothing unlinked is a safe no-op, so this is
-- called on every successful sign-in (src/app/auth/callback/route.ts), not just the first.
--
-- security definer + auth.uid()-scoped, never an explicit profile_id parameter, so it's safe to
-- grant directly to `authenticated`: a caller can only ever link records to their own verified
-- session, never anyone else's. Same reasoning as it_write_audit_log's
-- coalesce(p_actor_profile_id, auth.uid()) pattern.
create or replace function public.it_link_customer_to_profile()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile record;
  v_customer record;
begin
  select id, email into v_profile from public.it_profiles where id = auth.uid();
  if v_profile.id is null then
    return;
  end if;

  for v_customer in
    select id from public.it_customers
    where lower(email) = lower(v_profile.email)
      and status = 'active'
      and profile_id is null
  loop
    update public.it_customers
    set profile_id = v_profile.id, updated_at = now()
    where id = v_customer.id;

    update public.it_entitlements
    set profile_id = v_profile.id
    where customer_id = v_customer.id and profile_id is null;

    perform public.it_write_audit_log(
      p_action := 'customer_linked_to_profile',
      p_entity_type := 'it_customers',
      p_entity_id := v_customer.id,
      p_before_state := null,
      p_after_state := jsonb_build_object('profile_id', v_profile.id),
      p_reason := null,
      p_actor_profile_id := v_profile.id
    );
  end loop;
end;
$$;

revoke execute on function public.it_link_customer_to_profile() from public;
grant execute on function public.it_link_customer_to_profile() to authenticated;
