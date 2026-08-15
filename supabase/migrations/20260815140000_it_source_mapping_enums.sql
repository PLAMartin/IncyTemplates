-- Incy Templates v7: source-mapping enums
-- Spec v7 section 12.8/23.2, DDL ~line 1839. Own migration file: new enum types must commit
-- before any table/constraint in a later migration can reference them, the same constraint
-- this codebase already hit for it_framework_status (20260809160000) and it_public_visibility
-- (20260812090000).

create type public.it_source_use_type as enum (
  'source_only',
  'guide',
  'template',
  'tool'
);

create type public.it_source_mapping_status as enum (
  'unreviewed',
  'accepted',
  'adjusted',
  'dismissed'
);
