import type { Metadata } from "next";
import Link from "next/link";
import { listCollectionsForAdmin } from "@/server/admin/collections";
import { VisibilityForm } from "@/components/admin/visibility-form";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Collections — Admin",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-amber-100 text-amber-700",
  published: "bg-brand-100 text-brand-700",
  archived: "bg-ink-100 text-ink-500",
};

export default async function AdminCollectionsPage() {
  const collections = await listCollectionsForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink-900">Collections</h1>
          <p className="mt-1 text-ink-500">
            {collections.length} collection{collections.length === 1 ? "" : "s"}. A Collection is an editorial
            journey (spec v9 §14.3.1) — publishing it never changes the lifecycle status of its member frameworks.
          </p>
        </div>
        <ButtonLink href="/admin/collections/new">New collection</ButtonLink>
      </div>
      <div className="overflow-x-auto rounded-md border border-ink-200">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-ink-200 bg-paper-raised text-ink-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Name
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Core
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Members
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
            {collections.map((collection) => (
              <tr key={collection.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/collections/${collection.id}`} className="font-medium text-brand-600 hover:text-brand-700">
                    {collection.name}
                  </Link>
                  <div className="text-xs text-ink-500">/{collection.slug}</div>
                </td>
                <td className="px-4 py-3 text-ink-700">{collection.is_core ? "Yes" : "—"}</td>
                <td className="px-4 py-3 text-ink-700">{collection.member_count}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_STYLES[collection.status] ?? "bg-ink-100 text-ink-700"
                    }`}
                  >
                    {collection.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <VisibilityForm entityId={collection.id} kind="collection" currentVisibility={collection.public_visibility} />
                </td>
              </tr>
            ))}
            {collections.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-500">
                  No collections yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
