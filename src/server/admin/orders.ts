import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

export type AdminOrderListItem = {
  id: string;
  status: string;
  customer_email: string;
  total_minor: number;
  currency_code: string;
  paid_at: string | null;
  created_at: string;
};

/**
 * Read via the session-bound client — "support and admin staff can read all
 * orders" RLS policy (20260728155524_row_level_security.sql:304) already
 * covers this for the support/admin/owner roles this page is gated to (see
 * requireAnyRole in the page itself); no service-role needed.
 */
export async function listOrdersForAdmin(): Promise<AdminOrderListItem[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("it_orders")
    .select("id, status, customer_email, total_minor, currency_code, paid_at, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(`Failed to load orders: ${error.message}`);
  return data ?? [];
}

export type AdminWebhookEventListItem = {
  id: string;
  provider: string;
  event_type: string;
  processing_status: string;
  attempts: number;
  last_error: string | null;
  received_at: string;
  processed_at: string | null;
};

/**
 * it_webhook_events has NO RLS policy for anon/authenticated at all (see
 * that table's comment block in row_level_security.sql — Stripe webhook
 * handling runs exclusively via service_role) — reading it for display,
 * even as staff, has to go through the service-role client. The page this
 * feeds is still gated by requireRole('admin') in the app layer first.
 */
export async function listWebhookEventsForAdmin(): Promise<AdminWebhookEventListItem[]> {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("it_webhook_events")
    .select("id, provider, event_type, processing_status, attempts, last_error, received_at, processed_at")
    .order("received_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(`Failed to load webhook events: ${error.message}`);
  return data ?? [];
}
