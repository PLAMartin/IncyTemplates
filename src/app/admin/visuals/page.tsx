import type { Metadata } from "next";
import Link from "next/link";
import { listFrameworkVisualSummaries } from "@/server/admin/visuals";

export const metadata: Metadata = {
  title: "Visuals — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminVisualsPage() {
  const frameworks = await listFrameworkVisualSummaries();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink-900">Visuals</h1>
        <p className="mt-1 text-ink-500">
          {frameworks.length} framework{frameworks.length === 1 ? "" : "s"}. Manage each family&apos;s card/hero
          visuals, candidates and history.
        </p>
      </div>
      <div className="overflow-x-auto rounded-md border border-ink-200">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-ink-200 bg-paper-raised text-ink-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Framework
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Published
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Open candidates
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {frameworks.map((framework) => (
              <tr key={framework.frameworkId}>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/visuals/${framework.frameworkId}`}
                    className="font-medium text-brand-600 hover:text-brand-700"
                  >
                    {framework.frameworkName}
                  </Link>
                  <div className="text-xs text-ink-500">/{framework.frameworkSlug}</div>
                </td>
                <td className="px-4 py-3 text-ink-700">
                  {framework.publishedAssetTypes.length > 0 ? framework.publishedAssetTypes.join(", ") : "None yet"}
                </td>
                <td className="px-4 py-3 text-ink-700">{framework.openCandidateCount || "—"}</td>
              </tr>
            ))}
            {frameworks.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-ink-500">
                  No frameworks yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
