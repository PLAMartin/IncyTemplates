import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStages, searchCatalogue } from "@/server/queries";
import { parseCatalogueFilters, filtersToSearchParams, type RawSearchParams } from "@/lib/catalogue/parse-filters";
import { catalogueNoindexDecision } from "@/lib/seo/canonical";
import { CatalogueListing } from "@/components/catalogue/catalogue-listing";

type Props = {
  params: Promise<{ stage: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateStaticParams() {
  const stages = await getStages();
  return stages.map((stage) => ({ stage: stage.slug }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { stage: stageSlug } = await params;
  const stages = await getStages();
  const stage = stages.find((s) => s.slug === stageSlug);
  if (!stage) return {};

  const sp = await searchParams;
  const filters = { ...parseCatalogueFilters(sp), stage: stageSlug };
  const decision = catalogueNoindexDecision(filters);

  return {
    title: stage.name,
    description: stage.description ?? `Templates for the "${stage.name}" stage.`,
    alternates: { canonical: decision.canonical },
    robots: decision.noindex ? { index: false, follow: true } : undefined,
  };
}

export default async function StageTemplatesPage({ params, searchParams }: Props) {
  const { stage: stageSlug } = await params;
  const stages = await getStages();
  const stage = stages.find((s) => s.slug === stageSlug);
  if (!stage) notFound();

  const sp = await searchParams;
  const filters = { ...parseCatalogueFilters(sp), stage: stageSlug };
  const result = await searchCatalogue(filters);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-ink-900">{stage.name}</h1>
        {stage.description ? <p className="mt-2 max-w-2xl text-ink-500">{stage.description}</p> : null}
      </div>
      <CatalogueListing
        result={result}
        basePath={`/templates/stages/${stageSlug}`}
        searchParams={filtersToSearchParams(filters)}
      />
    </div>
  );
}
