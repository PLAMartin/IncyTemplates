-- Incy Templates: Row Level Security
-- Spec: section 16.
--
-- RLS is enabled on every table (16, opening line). Policies below implement:
--   16.1 Public read policies (anon + authenticated)
--   16.2 Customer policies (authenticated, own-row access)
--   16.3 Admin policies (staff roles via has_role()/is_admin()/is_staff())
--
-- Per 16.3's closing line ("Administrative writes should generally pass through
-- server-only services rather than direct browser table updates"), this migration adds
-- almost no direct-write policies for staff. Privileged writes (publishing products,
-- managing files, refunds, staff role changes, etc.) are expected to go through
-- server-side routes/services using the service_role key, which bypasses RLS entirely
-- in Supabase and therefore needs no policy of its own. Where the 16.3 capability matrix
-- distinguishes support/editor/admin/owner more finely than a single RLS predicate can
-- reasonably express, the coarser "authenticated staff can read" policy is used and the
-- finer distinction is left as a comment, enforced at the UI/service layer instead.

-- ---------------------------------------------------------------------------------------
-- Enable RLS on every table.
-- ---------------------------------------------------------------------------------------

alter table public.it_profiles enable row level security;
alter table public.it_customers enable row level security;
alter table public.it_categories enable row level security;
alter table public.it_stages enable row level security;
alter table public.it_licences enable row level security;
alter table public.it_products enable row level security;
alter table public.it_product_categories enable row level security;
alter table public.it_product_stages enable row level security;
alter table public.it_product_versions enable row level security;
alter table public.it_files enable row level security;
alter table public.it_bundle_items enable row level security;
alter table public.it_product_relationships enable row level security;
alter table public.it_orders enable row level security;
alter table public.it_order_items enable row level security;
alter table public.it_entitlements enable row level security;
alter table public.it_download_events enable row level security;
alter table public.it_free_download_requests enable row level security;
alter table public.it_webhook_events enable row level security;
alter table public.it_contact_enquiries enable row level security;
alter table public.it_feedback enable row level security;
alter table public.it_audit_log enable row level security;
alter table public.it_redirects enable row level security;
alter table public.it_waitlist_signups enable row level security;

-- ---------------------------------------------------------------------------------------
-- it_categories (16.1: "Active categories")
-- ---------------------------------------------------------------------------------------

create policy "public can read active categories"
  on public.it_categories for select
  to anon, authenticated
  using (is_active = true);

create policy "staff can read all categories"
  on public.it_categories for select
  to authenticated
  using ((select public.is_staff()));

-- ---------------------------------------------------------------------------------------
-- it_stages (16.1: "Active stages")
-- ---------------------------------------------------------------------------------------

create policy "public can read active stages"
  on public.it_stages for select
  to anon, authenticated
  using (is_active = true);

create policy "staff can read all stages"
  on public.it_stages for select
  to authenticated
  using ((select public.is_staff()));

-- ---------------------------------------------------------------------------------------
-- it_licences (16.1: "Active licences intended for public display")
-- ---------------------------------------------------------------------------------------

create policy "public can read active licences"
  on public.it_licences for select
  to anon, authenticated
  using (is_active = true);

create policy "staff can read all licences"
  on public.it_licences for select
  to authenticated
  using ((select public.is_staff()));

-- ---------------------------------------------------------------------------------------
-- it_products (16.1: "Published products"; 16.3: editor/admin/owner need draft visibility)
-- ---------------------------------------------------------------------------------------

create policy "public can read published products"
  on public.it_products for select
  to anon, authenticated
  using (status = 'published');

-- Matrix (16.3): "Edit draft products" is Yes for editor/admin/owner, No for support.
-- Draft *visibility* is granted here to all staff (support included) since support staff
-- plausibly need to see unpublished products to answer customer questions; the narrower
-- "Edit" capability itself is a write concern left to server-side services per the
-- closing line of 16.3, not to this read policy.
create policy "staff can read all products regardless of status"
  on public.it_products for select
  to authenticated
  using ((select public.is_staff()));

-- ---------------------------------------------------------------------------------------
-- it_product_categories / it_product_stages
-- (16.1 scopes public reads to data attached to published products)
-- ---------------------------------------------------------------------------------------

create policy "public can read categories of published products"
  on public.it_product_categories for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.it_products p
      where p.id = it_product_categories.product_id
        and p.status = 'published'
    )
  );

create policy "staff can read all product categories"
  on public.it_product_categories for select
  to authenticated
  using ((select public.is_staff()));

create policy "public can read stages of published products"
  on public.it_product_stages for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.it_products p
      where p.id = it_product_stages.product_id
        and p.status = 'published'
    )
  );

create policy "staff can read all product stages"
  on public.it_product_stages for select
  to authenticated
  using ((select public.is_staff()));

-- ---------------------------------------------------------------------------------------
-- it_product_versions (16.1: "Current published product versions")
-- ---------------------------------------------------------------------------------------

create policy "public can read current versions of published products"
  on public.it_product_versions for select
  to anon, authenticated
  using (
    is_current = true
    and exists (
      select 1 from public.it_products p
      where p.id = it_product_versions.product_id
        and p.status = 'published'
    )
  );

create policy "staff can read all product versions"
  on public.it_product_versions for select
  to authenticated
  using ((select public.is_staff()));

-- ---------------------------------------------------------------------------------------
-- it_files (16.1: "Public-preview file metadata"; 16.2: entitled reads are server-side)
-- ---------------------------------------------------------------------------------------
-- Only public-preview metadata for published products is exposed to the browser client.
-- Section 16.2 explicitly requires that entitled customers "Read file metadata only when
-- a server-side entitlement check authorises it" -- that path is a server route using the
-- service_role key (which bypasses RLS), not a browser-facing RLS policy, so no
-- authenticated-customer policy is added here for non-preview files.

create policy "public can read preview file metadata for published products"
  on public.it_files for select
  to anon, authenticated
  using (
    is_public_preview = true
    and exists (
      select 1
      from public.it_product_versions pv
      join public.it_products p on p.id = pv.product_id
      where pv.id = it_files.product_version_id
        and p.status = 'published'
    )
  );

create policy "staff can read all file metadata"
  on public.it_files for select
  to authenticated
  using ((select public.is_staff()));

-- ---------------------------------------------------------------------------------------
-- it_bundle_items (16.1: "Published bundle relationships")
-- ---------------------------------------------------------------------------------------

create policy "public can read bundle items where both sides are published"
  on public.it_bundle_items for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.it_products bp
      where bp.id = it_bundle_items.bundle_product_id
        and bp.status = 'published'
    )
    and exists (
      select 1 from public.it_products ip
      where ip.id = it_bundle_items.included_product_id
        and ip.status = 'published'
    )
  );

create policy "staff can read all bundle items"
  on public.it_bundle_items for select
  to authenticated
  using ((select public.is_staff()));

-- ---------------------------------------------------------------------------------------
-- it_product_relationships
-- Not explicitly listed in 16.1's bullet list, but treated consistently with the other
-- public catalogue relationship data (bundle items): both sides must be published for an
-- anonymous/authenticated visitor to see a "related products" link.
-- ---------------------------------------------------------------------------------------

create policy "public can read relationships between published products"
  on public.it_product_relationships for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.it_products sp
      where sp.id = it_product_relationships.source_product_id
        and sp.status = 'published'
    )
    and exists (
      select 1 from public.it_products tp
      where tp.id = it_product_relationships.target_product_id
        and tp.status = 'published'
    )
  );

create policy "staff can read all product relationships"
  on public.it_product_relationships for select
  to authenticated
  using ((select public.is_staff()));

-- ---------------------------------------------------------------------------------------
-- it_profiles (16.2: "Read and update their own profile, excluding role and protected
-- fields"; role protection is enforced by the protect_role trigger, not by RLS, since RLS
-- cannot restrict which columns an UPDATE touches)
-- ---------------------------------------------------------------------------------------

create policy "customers can read own profile"
  on public.it_profiles for select
  to authenticated
  using (id = auth.uid());

create policy "customers can update own profile"
  on public.it_profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Matrix (16.3): "View customers" is Yes for support/admin/owner, No for editor.
create policy "support and admin staff can read all profiles"
  on public.it_profiles for select
  to authenticated
  using ((select public.has_role('support')) or (select public.is_admin()));

-- ---------------------------------------------------------------------------------------
-- it_customers (16.2: "Read customer records linked to their profile")
-- ---------------------------------------------------------------------------------------

create policy "customers can read own customer record"
  on public.it_customers for select
  to authenticated
  using (profile_id = auth.uid());

-- Matrix (16.3): "View customers" is Yes for support/admin/owner, No for editor.
create policy "support and admin staff can read all customers"
  on public.it_customers for select
  to authenticated
  using ((select public.has_role('support')) or (select public.is_admin()));

-- ---------------------------------------------------------------------------------------
-- it_orders (16.2: "Read their own orders")
-- ---------------------------------------------------------------------------------------

create policy "customers can read own orders"
  on public.it_orders for select
  to authenticated
  using (
    exists (
      select 1 from public.it_customers c
      where c.id = it_orders.customer_id
        and c.profile_id = auth.uid()
    )
  );

-- Matrix (16.3): "View orders" is Yes for support/admin/owner, No for editor.
-- "Refund assistance" is Limited for support and Yes for admin/owner -- that finer
-- read/write distinction is a service-layer concern (refunds must go through Stripe via
-- a server route), not a separate RLS predicate.
create policy "support and admin staff can read all orders"
  on public.it_orders for select
  to authenticated
  using ((select public.has_role('support')) or (select public.is_admin()));

-- ---------------------------------------------------------------------------------------
-- it_order_items (16.2: "Read their own orders and order items")
-- ---------------------------------------------------------------------------------------

create policy "customers can read own order items"
  on public.it_order_items for select
  to authenticated
  using (
    exists (
      select 1
      from public.it_orders o
      join public.it_customers c on c.id = o.customer_id
      where o.id = it_order_items.order_id
        and c.profile_id = auth.uid()
    )
  );

create policy "support and admin staff can read all order items"
  on public.it_order_items for select
  to authenticated
  using ((select public.has_role('support')) or (select public.is_admin()));

-- ---------------------------------------------------------------------------------------
-- it_entitlements (16.2: "Read their own entitlements")
-- ---------------------------------------------------------------------------------------

create policy "customers can read own entitlements"
  on public.it_entitlements for select
  to authenticated
  using (
    profile_id = auth.uid()
    or exists (
      select 1 from public.it_customers c
      where c.id = it_entitlements.customer_id
        and c.profile_id = auth.uid()
    )
  );

create policy "support and admin staff can read all entitlements"
  on public.it_entitlements for select
  to authenticated
  using ((select public.has_role('support')) or (select public.is_admin()));

-- ---------------------------------------------------------------------------------------
-- it_download_events
-- Not listed as customer-readable in 16.2 (only file *metadata* access is customer
-- facing, gated server-side by entitlement). Download events carry hashed identifiers
-- used for fraud/analytics and are staff-only.
-- ---------------------------------------------------------------------------------------

create policy "admin staff can read download events"
  on public.it_download_events for select
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------------------
-- it_free_download_requests
-- Not explicitly covered by 16.1/16.2, but the free-template download journey (9.1)
-- requires unauthenticated visitors to submit an email to receive a free file, so an
-- anon/authenticated INSERT policy is required for that flow to work at all. No SELECT
-- is granted to anon/authenticated -- only staff can read submitted requests.
-- ---------------------------------------------------------------------------------------

create policy "anyone can request a free download"
  on public.it_free_download_requests for insert
  to anon, authenticated
  with check (true);

create policy "admin staff can read free download requests"
  on public.it_free_download_requests for select
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------------------
-- it_webhook_events
-- No anon/authenticated policies at all: Stripe webhook handling runs exclusively via a
-- server route using the service_role key, which bypasses RLS. Enabling RLS with no
-- matching policy denies all access to anon/authenticated by default.
-- ---------------------------------------------------------------------------------------

-- ---------------------------------------------------------------------------------------
-- it_contact_enquiries (16.2: "Read their own contact enquiries where appropriate")
-- ---------------------------------------------------------------------------------------

create policy "anyone can submit a contact enquiry"
  on public.it_contact_enquiries for insert
  to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

create policy "customers can read own contact enquiries"
  on public.it_contact_enquiries for select
  to authenticated
  using (user_id = auth.uid());

-- Matrix does not enumerate contact enquiries directly; treated as an admin/owner
-- support-desk capability similar to "View customers".
create policy "support and admin staff can read all contact enquiries"
  on public.it_contact_enquiries for select
  to authenticated
  using ((select public.has_role('support')) or (select public.is_admin()));

-- ---------------------------------------------------------------------------------------
-- it_feedback (16.2: "Create feedback associated with their profile")
-- ---------------------------------------------------------------------------------------

create policy "customers can create own feedback"
  on public.it_feedback for insert
  to authenticated
  with check (profile_id = auth.uid());

-- Product decision-helpfulness feedback is also collected from anonymous visitors on
-- public product pages; anonymous rows carry no profile_id/customer_id.
create policy "anonymous visitors can submit unattributed feedback"
  on public.it_feedback for insert
  to anon
  with check (profile_id is null and customer_id is null);

create policy "admin staff can read all feedback"
  on public.it_feedback for select
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------------------
-- it_audit_log
-- Matrix (16.3): "View audit log" is Limited for support/editor, Yes for admin/owner.
-- A single RLS predicate cannot cleanly express "Limited" (the spec does not define what
-- subset support/editor may see). Per the task instruction, the coarser
-- "authenticated staff can read" policy is used here; the support/editor vs admin/owner
-- distinction is left to the admin UI to enforce (e.g. hiding sensitive entity types or
-- payload fields from non-admin staff), consistent with 16.3's closing line.
-- ---------------------------------------------------------------------------------------

create policy "staff can read audit log"
  on public.it_audit_log for select
  to authenticated
  using ((select public.is_staff()));

-- ---------------------------------------------------------------------------------------
-- it_redirects
-- Not enumerated in 16.1, but slug-redirect resolution (26.4) happens on every request
-- for a possibly-anonymous visitor hitting an old URL, so it must be publicly readable;
-- it contains no sensitive data (just path-to-path mappings).
-- ---------------------------------------------------------------------------------------

create policy "public can read redirects"
  on public.it_redirects for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------------------
-- it_waitlist_signups
-- Not part of the spec (see 20260728155520_waitlist_signups.sql). Public/anon INSERT is
-- required for the "Join waitlist" CTA to work for signed-out visitors; no SELECT is
-- granted to anon or ordinary authenticated users, matching the task's explicit
-- requirement that only service_role/admin can read signups.
-- ---------------------------------------------------------------------------------------

create policy "anyone can join a waitlist"
  on public.it_waitlist_signups for insert
  to anon, authenticated
  with check (true);

create policy "admin staff can read waitlist signups"
  on public.it_waitlist_signups for select
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------------------
-- Base table grants.
--
-- This project's supabase/config.toml leaves `auto_expose_new_tables` unset, i.e. it uses
-- the current default where newly created tables are NOT automatically reachable by the
-- anon/authenticated/service_role Data API roles. RLS policies only ever narrow what a
-- role can already see/change at the base SQL-privilege level -- without an explicit
-- GRANT, PostgREST requests fail with "permission denied for table" before RLS is even
-- evaluated. The grants below are deliberately as narrow as each role's policies above
-- require: SELECT-only where a role only ever reads, and only on the tables that role has
-- at least one matching policy for.
-- ---------------------------------------------------------------------------------------

grant usage on schema public to anon, authenticated, service_role;

-- service_role bypasses RLS entirely in Supabase and is used exclusively by trusted
-- server-side code (webhook handling, fulfilment, admin services), so it is granted full
-- CRUD on every table rather than enumerated per-table.
grant select, insert, update, delete on all tables in schema public to service_role;

-- Public catalogue reads (16.1): anon + authenticated, SELECT only.
grant select on
  public.it_categories,
  public.it_stages,
  public.it_licences,
  public.it_products,
  public.it_product_categories,
  public.it_product_stages,
  public.it_product_versions,
  public.it_files,
  public.it_bundle_items,
  public.it_product_relationships,
  public.it_redirects
to anon, authenticated;

-- Customer/staff-only reads (16.2/16.3): authenticated only, RLS narrows to own rows or
-- staff roles. No anon grant -- these must never be reachable while signed out.
grant select on
  public.it_profiles,
  public.it_customers,
  public.it_orders,
  public.it_order_items,
  public.it_entitlements,
  public.it_download_events,
  public.it_audit_log,
  public.it_waitlist_signups
to authenticated;

-- Customers may update only their own profile (role protected by trigger, not by grant).
grant update on public.it_profiles to authenticated;

-- Public/anonymous submission forms: INSERT only, no SELECT for anon.
grant insert on public.it_free_download_requests to anon, authenticated;
grant insert on public.it_contact_enquiries to anon, authenticated;
grant insert on public.it_waitlist_signups to anon, authenticated;
grant insert on public.it_feedback to anon, authenticated;
grant select on public.it_feedback to authenticated;
grant select on public.it_contact_enquiries to authenticated;
grant select on public.it_free_download_requests to authenticated;

-- it_webhook_events intentionally receives no anon/authenticated grant at all: only
-- service_role (granted above) may touch it.
