import type { Metadata } from "next";
import { Receipt } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { formatMinorUnits } from "@/lib/money/bundle-savings";

export const metadata: Metadata = {
  title: "Order history",
  robots: { index: false, follow: false },
};

type OrderRow = {
  id: string;
  status: string;
  total_minor: number;
  currency_code: string;
  paid_at: string | null;
  created_at: string;
  it_order_items: { product_name_snapshot: string }[] | null;
};

/** Same RLS-scoped read pattern as the library page — "customers can read own orders" policy. */
export default async function AccountOrdersPage() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("it_orders")
    .select("id, status, total_minor, currency_code, paid_at, created_at, it_order_items(product_name_snapshot)")
    .order("created_at", { ascending: false });

  const orders = error ? [] : ((data as unknown as OrderRow[]) ?? []);

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-ink-900">Order history</h1>
      {orders.length === 0 ? (
        <div className="mt-6 flex items-start gap-3 rounded-md border border-ink-200 bg-paper-raised p-6 text-sm text-ink-500">
          <Receipt aria-hidden className="mt-0.5 size-5 shrink-0" />
          <p>No orders yet.</p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-ink-200 rounded-md border border-ink-200 bg-paper-raised">
          {orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium text-ink-900">
                  {order.it_order_items?.map((item) => item.product_name_snapshot).join(", ") || "Order"}
                </p>
                <p className="text-sm text-ink-500">
                  {order.paid_at ? new Date(order.paid_at).toLocaleDateString() : new Date(order.created_at).toLocaleDateString()} ·{" "}
                  {order.status}
                </p>
              </div>
              <p className="font-medium text-ink-900">{formatMinorUnits(order.total_minor, order.currency_code)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
