import type { Metadata } from "next";
import { listFrameworksForAdmin } from "@/server/admin/frameworks";
import { VisibilityForm } from "@/components/admin/visibility-form";

export const metadata: Metadata = {
  title: "Frameworks — Admin",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, string> = {
  candidate: "bg-ink-100 text-ink-700",
  draft: "bg-amber-100 text-amber-700",
  approved: "bg-brand-100 text-brand-700",
  published: "bg-brand-100 text-brand-700",
  archived: "bg-ink-100 text-ink-500",
};

export default async function AdminFrameworksPage() {
  const frameworks = await listFrameworksForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink-900">Frameworks</h1>
        <p className="mt-1 text-ink-500">
          {frameworks.length} framework{frameworks.length === 1 ? "" : "s"}. Visibility changes require the Admin
          role and are recorded in the audit log.
        </p>
      </div>
      <div className="overflow-x-auto rounded-md border border-ink-200">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-ink-200 bg-paper-raised text-ink-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Name
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Stage
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Visibility
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {frameworks.map((framework) => (
              <tr key={framework.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-ink-900">{framework.name}</div>
                  <div className="text-xs text-ink-500">/{framework.slug}</div>
                </td>
                <td className="px-4 py-3 text-ink-700">{framework.journey_stage?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_STYLES[framework.status] ?? "bg-ink-100 text-ink-700"
                    }`}
                  >
                    {framework.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <VisibilityForm entityId={framework.id} kind="framework" currentVisibility={framework.public_visibility} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
