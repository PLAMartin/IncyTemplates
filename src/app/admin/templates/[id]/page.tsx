import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTemplateForAdmin } from "@/server/admin/templates";
import { getTemplateContentForAdmin } from "@/server/admin/template-content";
import { rollbackTemplateContentAction } from "@/server/actions/admin-template-content";
import { TemplateUploadForm } from "@/components/admin/template-upload-form";
import { TemplateContentEditorForm } from "@/components/admin/template-content-editor-form";
import { ContentRevisionRollbackList } from "@/components/admin/content-revision-rollback-list";

export const metadata: Metadata = {
  title: "Edit template — Admin",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

function suggestNextVersion(currentVersion: string | undefined): string {
  if (!currentVersion) return "1.0";
  const match = currentVersion.match(/^(\d+)\.(\d+)$/);
  if (!match) return currentVersion;
  return `${match[1]}.${Number(match[2]) + 1}`;
}

export default async function AdminTemplateEditPage({ params }: Props) {
  const { id } = await params;
  const [template, content] = await Promise.all([getTemplateForAdmin(id), getTemplateContentForAdmin(id)]);
  if (!template || !content) notFound();

  const currentVersion = template.versions.find((v) => v.is_current);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink-900">{template.name}</h1>
        <p className="mt-1 text-sm text-ink-500">
          /{template.slug} · {template.status} · {template.public_visibility}
          {content.draftRevision ? " · unpublished editorial changes" : ""}
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink-900">Editorial content</h2>
        <TemplateContentEditorForm productId={template.id} initialCommon={content.commonCopy} initialTemplate={content.templateCopy} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink-900">Editorial content history</h2>
        <ContentRevisionRollbackList
          currentRevisionId={content.publishedRevision?.id ?? null}
          history={content.history.map((r) => ({
            id: r.id,
            revision_number: r.revision_number,
            change_note: r.change_note,
            published_at: r.published_at,
          }))}
          onRollback={(sourceRevisionId) => rollbackTemplateContentAction({ productId: template.id, sourceRevisionId })}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink-900">Create a new version</h2>
        <TemplateUploadForm productId={template.id} suggestedNextVersion={suggestNextVersion(currentVersion?.version)} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink-900">Version history</h2>
        {template.versions.length === 0 ? (
          <p className="text-sm text-ink-500">No versions yet.</p>
        ) : (
          <ul className="divide-y divide-ink-100 rounded-md border border-ink-200">
            {template.versions.map((version) => (
              <li key={version.id} className="space-y-2 px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink-900">v{version.version}</span>
                  {version.is_current ? (
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">Current</span>
                  ) : null}
                  <span className="text-xs text-ink-400">
                    {version.released_at ? new Date(version.released_at).toLocaleString() : ""}
                  </span>
                </div>
                {version.release_notes ? <p className="text-ink-500">{version.release_notes}</p> : null}
                <ul className="space-y-1">
                  {version.files.map((file) => (
                    <li key={file.id} className="text-ink-700">
                      {file.display_name} — {file.file_role}/{file.file_format}, {Math.round(file.byte_size / 1024)}KB
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
