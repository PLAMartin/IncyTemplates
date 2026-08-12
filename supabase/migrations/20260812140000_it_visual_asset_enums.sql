-- Incy Templates v5: visual-asset enums
-- Spec v5 section 14.2 (reproduced verbatim).
--
-- Own migration file, separate from the table migration that uses these types, for the
-- same reason as it_public_visibility (20260812090000_it_public_visibility_enum.sql): a
-- newly created enum type can't be used in the same migration/transaction it's created in.

create type public.it_visual_source_type as enum (
  'generated',
  'uploaded',
  'rendered'
);

create type public.it_visual_asset_status as enum (
  'candidate',
  'selected',
  'approved',
  'published',
  'archived',
  'failed'
);

create type public.it_visual_asset_type as enum (
  'family_card',
  'family_hero',
  'guide_diagram',
  'template_preview',
  'tool_preview',
  'social_og'
);
