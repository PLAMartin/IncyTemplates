import type { Metadata } from "next";
import { requireAnyRole } from "@/server/auth/dal";
import { listOrdersForAdmin } from "@/server/admin/orders";

export const metadata: Metadata = {
  title: "Orders — Admin",
  robots: { index: false, follow: false },
};

function formatMoney(minor: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(minor / 100);
}

/** "View orders" is Yes for support/admin/owner, No for editor (spec §16.3) — requireAnyRole, not requireRole, since editor outranks support in the DAL's linear rank but must NOT see this. */
export default async function AdminOrdersPage() {
  await requireAnyRole(["support", "admin", "owner"]);
  const orders = await listOrdersForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink-900">Orders</h1>
        <p className="mt-1 text-ink-500">
          {orders.length} order{orders.length === 1 ? "" : "s"}. Checkout isn&apos;t live yet, so this is expected to
          be empty until Stripe is wired up.
        </p>
      </div>
      {orders.length === 0 ? (
        <p className="rounded-md border border-dashed border-ink-200 p-6 text-center text-sm text-ink-500">
          No orders yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-ink-200">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-ink-200 bg-paper-raised text-ink-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Customer
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Total
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Placed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 text-ink-900">{order.customer_email}</td>
                  <td className="px-4 py-3 capitalize text-ink-700">{order.status}</td>
                  <td className="px-4 py-3 text-ink-700">{formatMoney(order.total_minor, order.currency_code)}</td>
                  <td className="px-4 py-3 text-ink-500">{new Date(order.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
