import type { Metadata } from "next";
import Link from "next/link";
import { listGuidesForAdmin } from "@/server/admin/guides";

export const metadata: Metadata = {
  title: "Guides — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminGuidesPage() {
  const guides = await listGuidesForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink-900">Guides</h1>
        <p className="mt-1 text-ink-500">
          {guides.length} guide{guides.length === 1 ? "" : "s"}. Imported from content/guides/*.mdx — edit and
          publish here, not by committing a file change.
        </p>
      </div>
      <div className="overflow-x-auto rounded-md border border-ink-200">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-ink-200 bg-paper-raised text-ink-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Name
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Visibility
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Draft
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {guides.map((guide) => (
              <tr key={guide.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/guides/${guide.id}`} className="font-medium text-brand-600 hover:text-brand-700">
                    {guide.name}
                  </Link>
                  <div className="text-xs text-ink-500">/{guide.slug}</div>
                </td>
                <td className="px-4 py-3 text-ink-700">{guide.status}</td>
                <td className="px-4 py-3 text-ink-700">{guide.public_visibility}</td>
                <td className="px-4 py-3 text-ink-700">{guide.has_open_draft ? "Unpublished changes" : "—"}</td>
              </tr>
            ))}
            {guides.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ink-500">
                  No guides yet — run <code className="text-xs">npm run import:guides</code> to import
                  content/guides/*.mdx.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
