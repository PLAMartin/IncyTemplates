-- Incy Templates v3: framework status enum
-- Spec v3: section 14.2 (it_framework_status). Own migration file: the enum must commit
-- before any table/constraint in a later migration can reference it.

create type public.it_framework_status as enum (
  'candidate',
  'draft',
  'approved',
  'published',
  'archived'
);
