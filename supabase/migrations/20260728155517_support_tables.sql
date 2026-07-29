-- Incy Templates: it_contact_enquiries, it_feedback, it_audit_log, it_redirects
-- Spec: section 14.3, and section 26.4 (it_redirects).

create table public.it_contact_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company_name text,
  enquiry_type text,
  message text not null,
  status text not null default 'new',
  source_url text,
  user_id uuid references public.it_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index it_contact_enquiries_user_id_idx on public.it_contact_enquiries (user_id);

create table public.it_feedback (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.it_products(id) on delete set null,
  customer_id uuid references public.it_customers(id) on delete set null,
  profile_id uuid references public.it_profiles(id) on delete set null,
  decision_helpfulness integer,
  rating integer,
  comment text,
  permission_to_quote boolean not null default false,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index it_feedback_product_id_idx on public.it_feedback (product_id);
create index it_feedback_profile_id_idx on public.it_feedback (profile_id);

create table public.it_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.it_profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_state jsonb,
  after_state jsonb,
  reason text,
  created_at timestamptz not null default now()
);

create index it_audit_log_entity_idx on public.it_audit_log (entity_type, entity_id);
create index it_audit_log_actor_profile_id_idx on public.it_audit_log (actor_profile_id);

-- Spec section 26.4: "When a published slug changes: record old slug, add permanent
-- redirect, update canonical URL, update internal links, update sitemap." The table
-- below is reproduced verbatim from the SQL given in 26.4.
create table public.it_redirects (
  id uuid primary key default gen_random_uuid(),
  source_path text not null unique,
  destination_path text not null,
  status_code integer not null default 308,
  created_at timestamptz not null default now()
);
