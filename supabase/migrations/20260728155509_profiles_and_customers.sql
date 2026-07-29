-- Incy Templates: it_profiles, it_customers
-- Spec: section 14.3.

create table public.it_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  company_name text,
  country_code char(2),
  role public.it_user_role not null default 'customer',
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,
  marketing_consent_source text,
  product_update_emails boolean not null default true,
  educational_emails boolean not null default false,
  account_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.it_profiles is
  'Application profile linked 1:1 to auth.users. Role changes must go through server-side privileged execution and audit logging (spec 14.3); see it_profiles_protect_role trigger in the functions/triggers migration.';

create table public.it_customers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.it_profiles(id) on delete set null,
  email text not null,
  full_name text,
  company_name text,
  country_code char(2),
  stripe_customer_id text unique,
  status text not null default 'active',
  first_order_at timestamptz,
  last_order_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.it_customers is
  'Commercial customer record independent of whether an Auth account is active (spec 14.3).';

-- Spec 14.3 prose: "A unique functional index should prevent duplicate active customer
-- records for a normalised email where appropriate." Emails are normalised to lowercase
-- by the trigger added in the functions/triggers migration; this partial unique index
-- enforces uniqueness of the normalised email among active customer records only, so a
-- deactivated/merged customer row does not block re-use of the same email.
create unique index it_customers_active_email_key
  on public.it_customers (lower(email))
  where status = 'active';
