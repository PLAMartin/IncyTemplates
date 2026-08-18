import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolCopyForAdmin } from "@/server/admin/tool-copy";
import { resolveToolCopy } from "@/lib/tools/copy";
import { rollbackToolCopyAction, rollbackToolCommonCopyAction } from "@/server/actions/admin-tool-copy";
import { ToolCopyEditorForm } from "@/components/admin/tool-copy-editor-form";
import { ContentRevisionRollbackList } from "@/components/admin/content-revision-rollback-list";

export const metadata: Metadata = {
  title: "Edit tool copy — Admin",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ toolKey: string }> };

export default async function AdminToolCopyEditPage({ params }: Props) {
  const { toolKey } = await params;
  const detail = await getToolCopyForAdmin(toolKey);
  if (!detail) notFound();

  const editableSource = detail.draftRevision?.content_data ?? detail.publishedRevision?.content_data ?? {};
  const initialValues = resolveToolCopy(detail.schema, editableSource);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink-900">{toolKey}</h1>
        <p className="mt-1 text-sm text-ink-500">{detail.draftRevision ? "Unpublished changes" : "Up to date"}</p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink-900">Editorial content</h2>
        <ToolCopyEditorForm
          toolKey={toolKey}
          productId={detail.productId}
          schema={detail.schema}
          initialCommon={detail.commonCopy}
          initialValues={initialValues}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink-900">Tool copy history</h2>
        <ContentRevisionRollbackList
          currentRevisionId={detail.publishedRevision?.id ?? null}
          history={detail.history.map((r) => ({
            id: r.id,
            revision_number: r.revision_number,
            change_note: r.change_note,
            published_at: r.published_at,
          }))}
          onRollback={rollbackToolCopyAction.bind(null, toolKey)}
        />
      </section>

      {detail.productId ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-ink-900">Common copy history</h2>
          <ContentRevisionRollbackList
            currentRevisionId={detail.commonPublishedRevisionId}
            history={detail.commonHistory.map((r) => ({
              id: r.id,
              revision_number: r.revision_number,
              change_note: r.change_note,
              published_at: r.published_at,
            }))}
            onRollback={rollbackToolCommonCopyAction.bind(null, detail.productId!)}
          />
        </section>
      ) : null}
    </div>
  );
}
