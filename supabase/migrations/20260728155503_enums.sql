-- Incy Templates: enumerations
-- Spec: section 14.2. Reproduced verbatim from the spec's suggested enum list.
-- Prefer PostgreSQL enums only for highly stable values; administrator-managed
-- categories (categories, stages, licences) are lookup tables instead (see
-- 20260728155506_reference_tables.sql).

create type public.it_product_type as enum (
  'template',
  'bundle'
);

create type public.it_product_status as enum (
  'draft',
  'scheduled',
  'published',
  'unlisted',
  'archived'
);

create type public.it_access_type as enum (
  'free',
  'paid'
);

create type public.it_order_status as enum (
  'pending',
  'paid',
  'failed',
  'refunded',
  'partially_refunded',
  'cancelled'
);

create type public.it_entitlement_status as enum (
  'active',
  'revoked',
  'refunded',
  'expired'
);

create type public.it_file_role as enum (
  'template',
  'example',
  'instructions',
  'facilitator_guide',
  'preview',
  'cover',
  'bonus'
);

create type public.it_file_format as enum (
  'pdf',
  'docx',
  'xlsx',
  'pptx',
  'markdown',
  'notion',
  'miro',
  'google_docs',
  'google_sheets',
  'zip',
  'png',
  'jpg',
  'webp',
  'other'
);

create type public.it_user_role as enum (
  'customer',
  'support',
  'editor',
  'admin',
  'owner'
);
