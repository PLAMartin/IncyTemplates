-- Incy Templates: it_waitlist_signups
--
-- NOT PART OF THE SPEC. Added for a product decision made outside the technical
-- specification: since checkout and the download/entitlement flow are not built yet,
-- public product and bundle pages show a "Join waitlist" call to action instead of a
-- buy/download CTA. This table backs that capture form.

create table public.it_waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.it_products(id) on delete cascade,
  email text not null,
  source text,
  created_at timestamptz not null default now()
);

create index it_waitlist_signups_product_id_idx on public.it_waitlist_signups(product_id);

comment on table public.it_waitlist_signups is
  'Not part of the technical spec. Backs the "Join waitlist" CTA shown on public product/bundle pages while checkout and downloads are not yet built.';
