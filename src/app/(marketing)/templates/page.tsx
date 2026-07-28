import type { Metadata } from "next";
import { getCategories, getStages, searchCatalogue } from "@/server/queries";
import { parseCatalogueFilters, filtersToSearchParams, type RawSearchParams } from "@/lib/catalogue/parse-filters";
import { catalogueNoindexDecision } from "@/lib/seo/canonical";
import { FilterBar } from "@/components/catalogue/filter-bar";
import { CatalogueListing } from "@/components/catalogue/catalogue-listing";

type Props = { searchParams: Promise<RawSearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const filters = parseCatalogueFilters(sp);
  const decision = catalogueNoindexDecision(filters);

  return {
    title: "Browse templates",
    description:
      "Search and filter free and paid business and product-development templates by decision stage, category, format and price.",
    alternates: { canonical: decision.canonical },
    robots: decision.noindex ? { index: false, follow: true } : undefined,
  };
}

export default async function TemplatesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filters = parseCatalogueFilters(sp);

  const [categories, stages, result] = await Promise.all([
    getCategories(),
    getStages(),
    searchCatalogue(filters),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-ink-900">Browse templates</h1>
        <p className="mt-2 max-w-2xl text-ink-500">
          Search and filter free and paid templates by decision stage, category, format and price.
        </p>
      </div>
      <FilterBar categories={categories} stages={stages} />
      <CatalogueListing result={result} basePath="/templates" searchParams={filtersToSearchParams(filters)} />
    </div>
  );
}
