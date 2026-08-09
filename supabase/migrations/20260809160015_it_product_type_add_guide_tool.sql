-- Incy Templates v3: it_product_type gains 'guide' and 'tool'
-- Spec v3: section 14.2. Own migration file, no other statements: Postgres forbids using a
-- newly added enum value in the same transaction that adds it, so this file only adds the
-- values -- everything that references 'guide'/'tool' lives in later migrations.

alter type public.it_product_type add value 'guide';
alter type public.it_product_type add value 'tool';
