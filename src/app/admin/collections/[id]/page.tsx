import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionForAdmin } from "@/server/admin/collections";
import { listFrameworksForAdmin } from "@/server/admin/frameworks";
import { CollectionForm } from "@/components/admin/collection-form";
import { CollectionMembersEditor } from "@/components/admin/collection-members-editor";
import { CollectionPublishButton } from "@/components/admin/collection-publish-button";
import { VisibilityForm } from "@/components/admin/visibility-form";

export const metadata: Metadata = {
  title: "Edit collection — Admin",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function AdminCollectionEditPage({ params }: Props) {
  const { id } = await params;
  const [collection, frameworks] = await Promise.all([getCollectionForAdmin(id), listFrameworksForAdmin()]);
  if (!collection) notFound();

  const memberFrameworkIds = new Set(collection.members.map((m) => m.frameworkId));
  const availableFrameworks = frameworks
    .filter((f) => !memberFrameworkIds.has(f.id))
    .map((f) => ({ id: f.id, name: f.name, slug: f.slug, status: f.status, public_visibility: f.public_visibility }));

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink-900">{collection.name}</h1>
        <p className="mt-1 text-sm text-ink-500">
          /{collection.slug} · {collection.status} · {collection.public_visibility}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink-900">Publication</h2>
        <div className="flex flex-wrap items-center gap-4">
          <CollectionPublishButton collectionId={collection.id} status={collection.status} />
          <VisibilityForm entityId={collection.id} kind="collection" currentVisibility={collection.public_visibility} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink-900">Collection details</h2>
        <CollectionForm
          mode="edit"
          collectionId={collection.id}
          initial={{
            name: collection.name,
            slug: collection.slug,
            headline: collection.headline ?? "",
            shortDescription: collection.short_description,
            displayOrder: collection.display_order,
            isCore: collection.is_core,
            seoTitle: collection.seo_title ?? "",
            seoDescription: collection.seo_description ?? "",
          }}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink-900">Members</h2>
        <CollectionMembersEditor collectionId={collection.id} members={collection.members} availableFrameworks={availableFrameworks} />
      </section>
    </div>
  );
}
