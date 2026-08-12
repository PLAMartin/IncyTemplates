import type { Metadata } from "next";
import Link from "next/link";
import { listTemplatesForAdmin } from "@/server/admin/templates";

export const metadata: Metadata = {
  title: "Templates — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminTemplatesPage() {
  const templates = await listTemplatesForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink-900">Templates</h1>
        <p className="mt-1 text-ink-500">
          {templates.length} template{templates.length === 1 ? "" : "s"}. Replacing a file creates a new version —
          the previous one stays in history, it&apos;s never overwritten.
        </p>
      </div>
      <div className="overflow-x-auto rounded-md border border-ink-200">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-ink-200 bg-paper-raised text-ink-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Name
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Access
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Current version
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {templates.map((template) => (
              <tr key={template.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/templates/${template.id}`} className="font-medium text-brand-600 hover:text-brand-700">
                    {template.name}
                  </Link>
                  <div className="text-xs text-ink-500">/{template.slug}</div>
                </td>
                <td className="px-4 py-3 capitalize text-ink-700">{template.access_type}</td>
                <td className="px-4 py-3 text-ink-700">{template.status}</td>
                <td className="px-4 py-3 text-ink-700">{template.current_version ?? "—"}</td>
              </tr>
            ))}
            {templates.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ink-500">
                  No templates found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
