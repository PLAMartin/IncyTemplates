-- Incy Templates v4: it_public_visibility enum
-- Spec v4: section 14.2 (reproduced verbatim), section 14.7.2 ("public/unlisted/hidden" semantics).
--
-- New enum value additions must commit before use in the same migration run this
-- codebase already hit that constraint for it_framework_status
-- (20260809160000_it_framework_status_enum.sql) and it_product_type
-- (20260809160015_it_product_type_add_guide_tool.sql), so this enum gets its own migration
-- file for the same reason: the column/policy migration that uses it runs next.
--
-- Deliberately separate from it_product_status (which already has an unrelated
-- 'unlisted' value baked in from v3 -- see comment in
-- 20260812090005_it_products_frameworks_visibility.sql for why that's not reused).

create type public.it_public_visibility as enum (
  'public',
  'unlisted',
  'hidden'
);
