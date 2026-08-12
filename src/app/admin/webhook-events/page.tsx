import type { Metadata } from "next";
import { requireRole } from "@/server/auth/dal";
import { listWebhookEventsForAdmin } from "@/server/admin/orders";

export const metadata: Metadata = {
  title: "Webhook queue — Admin",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, string> = {
  received: "bg-ink-100 text-ink-700",
  processing: "bg-amber-100 text-amber-700",
  processed: "bg-brand-100 text-brand-700",
  failed: "bg-red-100 text-red-700",
};

/** Same floor as it_download_events' "admin staff can read download events" policy (is_admin() — admin+owner only). */
export default async function AdminWebhookEventsPage() {
  await requireRole("admin");
  const events = await listWebhookEventsForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink-900">Webhook queue</h1>
        <p className="mt-1 text-ink-500">
          {events.length} event{events.length === 1 ? "" : "s"}. Empty until Stripe webhooks are live — this reads
          `it_webhook_events` directly, not a stub.
        </p>
      </div>
      {events.length === 0 ? (
        <p className="rounded-md border border-dashed border-ink-200 p-6 text-center text-sm text-ink-500">
          No webhook events recorded yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-ink-200">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-ink-200 bg-paper-raised text-ink-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Event
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Attempts
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Received
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink-900">{event.event_type}</div>
                    <div className="text-xs text-ink-500">{event.provider}</div>
                    {event.last_error ? <div className="mt-1 text-xs text-red-700">{event.last_error}</div> : null}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[event.processing_status] ?? "bg-ink-100 text-ink-700"
                      }`}
                    >
                      {event.processing_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{event.attempts}</td>
                  <td className="px-4 py-3 text-ink-500">{new Date(event.received_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
