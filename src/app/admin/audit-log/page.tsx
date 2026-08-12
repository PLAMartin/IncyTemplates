import type { Metadata } from "next";
import { listAuditLogForAdmin } from "@/server/admin/audit-log";

export const metadata: Metadata = {
  title: "Audit log — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminAuditLogPage() {
  const entries = await listAuditLogForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink-900">Audit log</h1>
        <p className="mt-1 text-ink-500">
          Every content publish/rollback, file replacement and visibility change made through
          `/admin`, most recent first.
        </p>
      </div>
      {entries.length === 0 ? (
        <p className="rounded-md border border-dashed border-ink-200 p-6 text-center text-sm text-ink-500">
          No actions recorded yet.
        </p>
      ) : (
        <ul className="divide-y divide-ink-100 rounded-md border border-ink-200">
          {entries.map((entry) => (
            <li key={entry.id} className="px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-ink-900">{entry.action}</span>
                <span className="text-ink-500">on {entry.entity_type}</span>
                {entry.actor?.email ? <span className="text-ink-500">· {entry.actor.email}</span> : null}
                <span className="text-xs text-ink-400">{new Date(entry.created_at).toLocaleString()}</span>
              </div>
              {entry.reason ? <p className="mt-1 text-ink-700">{entry.reason}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
