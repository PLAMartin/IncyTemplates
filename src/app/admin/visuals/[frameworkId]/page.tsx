import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFrameworkVisualsForAdmin } from "@/server/admin/visuals";
import { listVisualProviderStatuses } from "@/lib/visuals/providers";
import { VisualCreateForm } from "@/components/admin/visual-create-form";
import { VisualCandidateGrid } from "@/components/admin/visual-candidate-grid";
import { VisualHistoryList } from "@/components/admin/visual-history-list";

export const metadata: Metadata = {
  title: "Framework visuals — Admin",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ frameworkId: string }> };

/** Avoids "IncyTemplates Visual Recipe v1 v1" — some recipe names already embed their version. */
function recipeLabel(name: string, version: number): string {
  return new RegExp(`v${version}$`, "i").test(name.trim()) ? name : `${name} v${version}`;
}

export default async function AdminFrameworkVisualsPage({ params }: Props) {
  const { frameworkId } = await params;
  const detail = await getFrameworkVisualsForAdmin(frameworkId);
  if (!detail) notFound();

  const published = detail.assets.filter((a) => a.status === "published");
  const openCandidates = detail.assets.filter((a) => a.status === "candidate" || a.status === "selected");
  const archived = detail.assets.filter((a) => a.status === "archived");

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink-900">{detail.frameworkName}</h1>
        <p className="mt-1 text-sm text-ink-500">/{detail.frameworkSlug} · Visuals</p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink-900">Currently published</h2>
        {published.length === 0 ? (
          <p className="text-sm text-ink-500">Nothing published yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {published.map((asset) => (
              <div key={asset.id} className="space-y-2 rounded-md border border-ink-200 bg-paper-raised p-3">
                {asset.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.url} alt="" className="aspect-[4/3] w-full rounded-md border border-ink-100 object-cover" />
                ) : null}
                <div className="text-xs text-ink-500">
                  {asset.assetType} · {asset.sourceType}
                  {asset.recipeName ? ` · ${asset.recipeName} v${asset.recipeVersion}` : ""}
                  <br />
                  Published {asset.publishedAt ? new Date(asset.publishedAt).toLocaleString() : "—"}
                  <br />
                  Alt text: {asset.decorative ? "(decorative)" : asset.altText || "(missing)"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink-900">Create a candidate</h2>
        <VisualCreateForm
          frameworkId={detail.frameworkId}
          recipeLabel={detail.activeRecipe ? recipeLabel(detail.activeRecipe.name, detail.activeRecipe.version) : null}
          providerStatuses={listVisualProviderStatuses()}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink-900">Open candidates</h2>
        <VisualCandidateGrid frameworkId={detail.frameworkId} candidates={openCandidates} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink-900">History</h2>
        <VisualHistoryList frameworkId={detail.frameworkId} history={archived} />
      </section>
    </div>
  );
}
