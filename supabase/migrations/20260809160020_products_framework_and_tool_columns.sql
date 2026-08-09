-- Incy Templates v3: it_products gains framework/tool columns
-- Spec v3: section 14.7. Guide/Template/Tool/Bundle all continue to share the single
-- it_products table (per the spec's own literal §14.7 SQL) rather than splitting into
-- per-type tables -- it_products already owns every catalogue/publish/search/SEO concern a
-- Guide or Tool needs, and splitting would fork draft/published visibility across two
-- systems for no benefit at this milestone.
--
-- Note: og_image_url already exists on it_products (added in
-- 20260728155511_products_categories_stages.sql) -- not re-added here.

alter table public.it_products
  add column framework_id uuid references public.it_frameworks(id) on delete restrict,
  add column tool_key text,
  add column tool_schema_version integer,
  add column experience_config jsonb not null default '{}'::jsonb,
  add column quality_standard jsonb not null default '{}'::jsonb;

alter table public.it_products
  add constraint tool_requires_key check (product_type <> 'tool' or tool_key is not null);

create index it_products_framework_id_idx on public.it_products (framework_id);
create index it_products_tool_key_idx on public.it_products (tool_key) where tool_key is not null;

-- Public/staff RLS for it_products is already published-status-scoped
-- (20260728155524_row_level_security.sql) and applies unchanged to the new 'guide'/'tool'
-- product_type values -- no policy changes needed here.
