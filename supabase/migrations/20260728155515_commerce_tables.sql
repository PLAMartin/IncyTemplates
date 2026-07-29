-- Incy Templates: it_orders, it_order_items, it_entitlements, it_download_events,
-- it_free_download_requests, it_webhook_events
-- Spec: section 14.3.

create table public.it_orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.it_customers(id) on delete restrict,
  status public.it_order_status not null default 'pending',
  currency_code char(3) not null,
  subtotal_minor integer not null default 0,
  discount_minor integer not null default 0,
  tax_minor integer not null default 0,
  total_minor integer not null default 0,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  stripe_invoice_id text,
  stripe_customer_id text,
  customer_email text not null,
  billing_name text,
  billing_country_code char(2),
  promotion_code text,
  paid_at timestamptz,
  refunded_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index it_orders_customer_id_idx on public.it_orders (customer_id);
create index it_orders_status_idx on public.it_orders (status);

create table public.it_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.it_orders(id) on delete restrict,
  product_id uuid references public.it_products(id) on delete restrict,
  product_name_snapshot text not null,
  product_type_snapshot public.it_product_type not null,
  quantity integer not null default 1,
  unit_amount_minor integer not null,
  discount_minor integer not null default 0,
  tax_minor integer not null default 0,
  total_minor integer not null,
  stripe_price_id text,
  created_at timestamptz not null default now()
);

comment on table public.it_order_items is
  'Order items preserve a purchase-time snapshot (spec 14.3); do not join to it_products for historical display copy.';

create index it_order_items_order_id_idx on public.it_order_items (order_id);
create index it_order_items_product_id_idx on public.it_order_items (product_id);

create table public.it_entitlements (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.it_customers(id) on delete restrict,
  profile_id uuid references public.it_profiles(id) on delete set null,
  product_id uuid not null references public.it_products(id) on delete restrict,
  source_order_item_id uuid references public.it_order_items(id) on delete restrict,
  source_bundle_product_id uuid references public.it_products(id) on delete restrict,
  status public.it_entitlement_status not null default 'active',
  includes_future_updates boolean not null default true,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revocation_reason text,
  created_at timestamptz not null default now()
);

-- DEVIATION FROM SPEC: the spec's SQL snippet for it_entitlements (14.3) does not include
-- this index; it is only called for in the surrounding prose ("Use a partial unique index
-- to prevent duplicate active entitlements for the same customer and product").
create unique index it_entitlements_one_active_per_customer_product
  on public.it_entitlements (customer_id, product_id)
  where status = 'active';

create index it_entitlements_customer_id_idx on public.it_entitlements (customer_id);
create index it_entitlements_profile_id_idx on public.it_entitlements (profile_id);
create index it_entitlements_product_id_idx on public.it_entitlements (product_id);

create table public.it_download_events (
  id uuid primary key default gen_random_uuid(),
  file_id uuid not null references public.it_files(id) on delete restrict,
  product_id uuid not null references public.it_products(id) on delete restrict,
  entitlement_id uuid references public.it_entitlements(id) on delete set null,
  customer_id uuid references public.it_customers(id) on delete set null,
  profile_id uuid references public.it_profiles(id) on delete set null,
  anonymous_session_id uuid,
  email_hash text,
  source text,
  user_agent text,
  ip_hash text,
  downloaded_at timestamptz not null default now()
);

comment on column public.it_download_events.ip_hash is
  'Store a privacy-preserving hash only, never a raw IP address (spec 14.3).';

create index it_download_events_file_id_idx on public.it_download_events (file_id);
create index it_download_events_product_id_idx on public.it_download_events (product_id);
create index it_download_events_customer_id_idx on public.it_download_events (customer_id);

create table public.it_free_download_requests (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.it_products(id) on delete restrict,
  email text,
  marketing_consent boolean not null default false,
  consent_text_version text,
  source text,
  anonymous_session_id uuid,
  created_at timestamptz not null default now()
);

create index it_free_download_requests_product_id_idx on public.it_free_download_requests (product_id);

create table public.it_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  payload jsonb not null,
  processing_status text not null default 'received',
  attempts integer not null default 0,
  last_error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, provider_event_id)
);
