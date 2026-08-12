import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGuideForAdmin } from "@/server/admin/guides";
import { GuideEditorForm } from "@/components/admin/guide-editor-form";
import { GuideRollbackList } from "@/components/admin/guide-rollback-list";

export const metadata: Metadata = {
  title: "Edit guide — Admin",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function AdminGuideEditPage({ params }: Props) {
  const { id } = await params;
  const guide = await getGuideForAdmin(id);
  if (!guide) notFound();

  const editableContent = guide.draftRevision?.content_data ?? guide.publishedRevision?.content_data;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink-900">{guide.name}</h1>
        <p className="mt-1 text-sm text-ink-500">
          /{guide.slug} · {guide.status} · {guide.public_visibility}
          {guide.draftRevision ? " · unpublished changes" : ""}
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink-900">Content</h2>
        <GuideEditorForm
          productId={guide.id}
          initialBodyMarkdown={editableContent?.body_markdown ?? ""}
          initialAuthor={editableContent?.author ?? ""}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink-900">History</h2>
        <GuideRollbackList
          productId={guide.id}
          currentRevisionId={guide.publishedRevision?.id ?? null}
          history={guide.history.map((r) => ({
            id: r.id,
            revision_number: r.revision_number,
            change_note: r.change_note,
            published_at: r.published_at,
          }))}
        />
      </section>
    </div>
  );
}
