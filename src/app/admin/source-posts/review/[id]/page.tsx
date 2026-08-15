import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getSourcePostForAdmin } from "@/server/admin/source-posts";
import { listFrameworksForAdmin } from "@/server/admin/frameworks";
import { suggestedFrameworkMappingSchema } from "@/lib/source-mapping/schema";
import { MappingReviewPanel } from "@/components/admin/source-posts/mapping-review-panel";
import { FrameworkMappingsPanel } from "@/components/admin/source-posts/framework-mappings-panel";

export const metadata: Metadata = {
  title: "Review source post — Admin",
  robots: { index: false, follow: false },
};

const DIMENSION_LABELS: Record<string, string> = {
  problemStatement: "Problem",
  sourceStage: "Stage",
  userTask: "User task",
  methodTags: "Method",
  frequency: "Frequency",
  judgementLevel: "Judgement level",
};

export default async function AdminSourcePostReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [detail, frameworks] = await Promise.all([getSourcePostForAdmin(id), listFrameworksForAdmin()]);

  if (!detail) notFound();

  const latest = detail.assessments[0] ?? null;
  const linkedFrameworkIds = new Set(detail.frameworkLinks.map((l) => l.frameworkId));
  const suggestedFrameworks = z.array(suggestedFrameworkMappingSchema).safeParse(latest?.suggestedFrameworks ?? []).data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink-900">{detail.post.title}</h1>
        <p className="mt-1 text-ink-500">
          {detail.post.sourceCategory ?? "Uncategorised"} · {detail.post.publishedAt?.slice(0, 10) ?? "no date"} ·{" "}
          <span className="font-mono text-xs">{detail.post.id}</span>
        </p>
      </div>

      {latest ? (
        <section className="space-y-4 rounded-md border border-ink-200 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-ink-900">Suggested assessment</h2>
            <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-700">
              {latest.analysisMethod} · {latest.analysisVersion}
            </span>
          </div>

          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-ink-700">{DIMENSION_LABELS.problemStatement}</dt>
              <dd className="text-ink-900">{latest.problemStatement ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink-700">{DIMENSION_LABELS.sourceStage}</dt>
              <dd className="text-ink-900">{latest.sourceStage ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink-700">{DIMENSION_LABELS.userTask}</dt>
              <dd className="text-ink-900">{latest.userTask ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink-700">{DIMENSION_LABELS.methodTags}</dt>
              <dd className="text-ink-900">{latest.methodTags.join(", ") || "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink-700">{DIMENSION_LABELS.frequency}</dt>
              <dd className="text-ink-900">{latest.frequency ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink-700">{DIMENSION_LABELS.judgementLevel}</dt>
              <dd className="text-ink-900">{latest.judgementLevel ?? "—"}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-4 rounded-md bg-paper-raised p-3 text-sm">
            <span>Problem {latest.scoreProblem}/2</span>
            <span>Actionability {latest.scoreActionability}/2</span>
            <span>Repeatability {latest.scoreRepeatability}/2</span>
            <span>Structure {latest.scoreStructure}/2</span>
            <span>Automation {latest.scoreAutomation}/2</span>
            <span className="font-semibold text-ink-900">Total {latest.reuseScore}/10</span>
          </div>

          <div>
            <span className="text-sm font-medium text-ink-700">Suggested uses: </span>
            {latest.suggestedUses.map((use) => (
              <span key={use} className="mr-1 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                Suggested: {use.replace("_", " ")}
              </span>
            ))}
          </div>

          {latest.rationale ? <p className="text-sm text-ink-500">{latest.rationale}</p> : null}

          {detail.assessments.length > 1 ? (
            <details className="text-sm text-ink-500">
              <summary className="cursor-pointer font-medium text-ink-700">
                Assessment history ({detail.assessments.length} versions)
              </summary>
              <ul className="mt-2 space-y-1">
                {detail.assessments.map((a) => (
                  <li key={a.id}>
                    {a.createdAt.slice(0, 10)} — {a.analysisMethod}/{a.analysisVersion} — score {a.reuseScore}/10 —{" "}
                    {a.suggestedUses.join("+")}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </section>
      ) : (
        <p className="text-ink-500">No assessment yet for this post.</p>
      )}

      <section className="space-y-4 rounded-md border border-ink-200 p-5">
        <h2 className="font-serif text-lg font-semibold text-ink-900">Editorial decision</h2>
        <p className="text-sm text-ink-500">
          The current human decision — distinct from the suggestion above, which is never overwritten by review
          actions.
        </p>
        <MappingReviewPanel
          sourcePostId={detail.post.id}
          assessmentId={latest?.id ?? null}
          suggestedUses={latest?.suggestedUses ?? []}
          review={detail.review}
        />
      </section>

      <section className="space-y-4 rounded-md border border-ink-200 p-5">
        <h2 className="font-serif text-lg font-semibold text-ink-900">Framework mappings</h2>
        <p className="text-sm text-ink-500">
          Accepting a suggestion or adding a mapping links this post to a framework as provenance — it never
          publishes a Guide, Template or Tool.
        </p>
        <FrameworkMappingsPanel
          sourcePostId={detail.post.id}
          assessmentId={latest?.id ?? null}
          existingLinks={detail.frameworkLinks}
          suggestedFrameworks={suggestedFrameworks}
          frameworks={frameworks.map((f) => ({ id: f.id, name: f.name, slug: f.slug }))}
          linkedFrameworkIds={[...linkedFrameworkIds]}
        />
      </section>
    </div>
  );
}
