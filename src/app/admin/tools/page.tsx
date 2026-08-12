import type { Metadata } from "next";
import Link from "next/link";
import { listToolsForAdmin } from "@/server/admin/tool-copy";

export const metadata: Metadata = {
  title: "Tools — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminToolsPage() {
  const tools = await listToolsForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink-900">Tools</h1>
        <p className="mt-1 text-ink-500">
          {tools.length} registered tool{tools.length === 1 ? "" : "s"}. Executable scoring logic always stays in
          code — only the declared-safe text fields below are editable here.
        </p>
      </div>
      <div className="overflow-x-auto rounded-md border border-ink-200">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-ink-200 bg-paper-raised text-ink-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Name
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Tool key
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Editable copy
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {tools.map((tool) => (
              <tr key={tool.toolKey}>
                <td className="px-4 py-3">
                  {tool.hasCopySchema ? (
                    <Link href={`/admin/tools/${tool.toolKey}`} className="font-medium text-brand-600 hover:text-brand-700">
                      {tool.name ?? tool.toolKey}
                    </Link>
                  ) : (
                    <span className="font-medium text-ink-900">{tool.name ?? tool.toolKey}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-500">{tool.toolKey}</td>
                <td className="px-4 py-3 text-ink-700">{tool.hasCopySchema ? "Yes" : "Not declared yet"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
