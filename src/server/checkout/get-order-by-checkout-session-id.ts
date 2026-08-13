import "server-only";
import { getSupabaseServiceRoleClient, hasServiceRoleConfig } from "@/lib/supabase/service-role-client";

export type OrderConfirmation = {
  id: string;
  status: string;
  totalMinor: number;
  currencyCode: string;
  customerEmail: string;
  productId: string;
  productName: string;
};

/**
 * Service-role read for the /checkout/success page — no RLS policy permits anon SELECT on
 * it_orders (staff/customer-session reads only), and this page runs with neither. Returns null
 * both when the order genuinely doesn't exist and when the environment has no service-role
 * config, so the page can render the same "still confirming" state either way rather than
 * throwing.
 */
export async function getOrderByCheckoutSessionId(checkoutSessionId: string): Promise<OrderConfirmation | null> {
  if (!hasServiceRoleConfig()) return null;

  const supabase = getSupabaseServiceRoleClient();
  const { data: order, error } = await supabase
    .from("it_orders")
    .select("id, status, total_minor, currency_code, customer_email, it_order_items(product_id, product_name_snapshot)")
    .eq("stripe_checkout_session_id", checkoutSessionId)
    .maybeSingle();

  if (error || !order) return null;

  const item = (order.it_order_items as { product_id: string; product_name_snapshot: string }[] | null)?.[0];

  return {
    id: order.id,
    status: order.status,
    totalMinor: order.total_minor,
    currencyCode: order.currency_code,
    customerEmail: order.customer_email,
    productId: item?.product_id ?? "",
    productName: item?.product_name_snapshot ?? "",
  };
}
