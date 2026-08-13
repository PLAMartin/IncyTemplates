-- Incy Templates v6: it_tool_runs RLS
--
-- SELECT-only for the owning profile, plus staff read -- same posture as it_entitlements. No
-- INSERT/UPDATE/DELETE grant for anon or authenticated at all, and no SELECT for anon: unlike
-- it_free_download_requests (which allows a direct anon INSERT since there's no session to key
-- off), an anonymous Tool-run save still needs a server-assigned anonymous_session_id and goes
-- through the service-role client (src/server/tools/save-tool-run.ts) exactly like the initial
-- signed-in save does. Claiming an anonymous run on sign-in goes through the security-definer
-- it_claim_anonymous_tool_runs() function, not a client UPDATE policy.

alter table public.it_tool_runs enable row level security;

create policy "owner can read their own tool runs"
  on public.it_tool_runs for select
  to authenticated
  using (profile_id = auth.uid());

create policy "staff can read all tool runs"
  on public.it_tool_runs for select
  to authenticated
  using ((select public.is_staff()));
