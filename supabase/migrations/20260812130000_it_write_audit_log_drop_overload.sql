-- Incy Templates v4: fix it_write_audit_log ambiguous-overload regression
--
-- 20260812090010_it_product_content_revisions.sql added a trailing
-- `p_actor_profile_id uuid default null` parameter via `create or replace function`,
-- believing this to be a compatible in-place replacement. It is not: PostgreSQL identifies
-- a function by name plus parameter *count and types*, not by name alone, so this created a
-- second, distinct 7-parameter overload alongside the original 6-parameter one rather than
-- replacing it. Any call with exactly 6 positional arguments (the pre-existing
-- it_products_audit_privileged_changes and it_profiles role-change triggers, both in
-- 20260728155522_functions_and_triggers.sql, call it that way) is now ambiguous between
-- "the 6-arg function" and "the 7-arg function using its trailing default" and fails with
-- "function ... is not unique". Discovered live when provisioning the first staff account
-- triggered the role-change audit path.
--
-- Fix: drop the original 6-parameter overload. The 7-parameter version's trailing default
-- makes it fully call-compatible with every existing 6-arg call site, so no call site needs
-- to change.

drop function if exists public.it_write_audit_log(text, text, uuid, jsonb, jsonb, text);

revoke execute on function public.it_write_audit_log(
  text, text, uuid, jsonb, jsonb, text, uuid
) from public;
grant execute on function public.it_write_audit_log(
  text, text, uuid, jsonb, jsonb, text, uuid
) to authenticated, service_role;
