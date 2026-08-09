import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStages, getFrameworkTeasers } from "@/server/queries";
import { canonicalUrl } from "@/lib/seo/canonical";
import { FrameworkCard } from "@/components/framework/framework-card";

type Props = { params: Promise<{ stage: string }> };

export async function generateStaticParams() {
  const stages = await getStages();
  return stages.map((stage) => ({ stage: stage.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stage: stageSlug } = await params;
  const stages = await getStages();
  const stage = stages.find((s) => s.slug === stageSlug);
  if (!stage) return {};
  return {
    title: stage.name,
    description: stage.description ?? `Product families for the "${stage.name}" stage.`,
    alternates: { canonical: canonicalUrl(`/journey/${stageSlug}`) },
  };
}

export default async function JourneyStagePage({ params }: Props) {
  const { stage: stageSlug } = await params;
  const stages = await getStages();
  const stage = stages.find((s) => s.slug === stageSlug);
  if (!stage) notFound();

  const allTeasers = await getFrameworkTeasers();
  const frameworks = allTeasers.filter((f) => f.journey_stage?.slug === stageSlug);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-ink-900">{stage.name}</h1>
        {stage.description ? <p className="mt-2 max-w-2xl text-ink-500">{stage.description}</p> : null}
      </div>
      {frameworks.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {frameworks.map((framework) => (
            <FrameworkCard key={framework.id} framework={framework} />
          ))}
        </div>
      ) : (
        <p className="text-ink-500">No product families for this stage yet.</p>
      )}
    </div>
  );
}
