-- Incy Templates v6: claiming an anonymous Tool run clears its expiry
-- Spec v6 section 14.12 -- "Anonymous runs should expire automatically unless there is a
-- justified reason to retain them." Claiming (signing in and linking the run to a profile)
-- is exactly that justified reason, so it_claim_anonymous_tool_runs() now also clears
-- expires_at back to null, same signature as 20260813170015 (CREATE OR REPLACE in place,
-- no overload risk since the argument list is unchanged).

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
      expires_at = null,
      updated_at = now()
  where anonymous_session_id = p_anonymous_session_id
    and profile_id is null;
end;
$$;
