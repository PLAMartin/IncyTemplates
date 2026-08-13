-- Incy Templates v6: claim anonymous Tool runs on sign-in
-- Spec v6 section 14.12 -- mirrors it_link_customer_to_profile()'s safety shape
-- (20260813160000): security definer, reads auth.uid() internally rather than accepting an
-- explicit profile id argument, so a caller can only ever claim runs into their own verified
-- session -- safe to grant execute to authenticated directly. Idempotent (no matching
-- anonymous rows is a no-op), called from src/app/auth/callback/route.ts on every sign-in.

create or replace function public.it_claim_anonymous_tool_runs(p_anonymous_session_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_anonymous_session_id is null then
    return;
  end if;

  update public.it_tool_runs
  set profile_id = auth.uid(),
      anonymous_session_id = null,
      updated_at = now()
  where anonymous_session_id = p_anonymous_session_id
    and profile_id is null;
end;
$$;

revoke execute on function public.it_claim_anonymous_tool_runs(uuid) from public;
grant execute on function public.it_claim_anonymous_tool_runs(uuid) to authenticated;
