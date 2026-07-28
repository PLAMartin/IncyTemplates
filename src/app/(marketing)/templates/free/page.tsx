import type { Metadata } from "next";
import { searchCatalogue } from "@/server/queries";
import { parseCatalogueFilters, filtersToSearchParams, type RawSearchParams } from "@/lib/catalogue/parse-filters";
import { catalogueNoindexDecision } from "@/lib/seo/canonical";
import { CatalogueListing } from "@/components/catalogue/catalogue-listing";

type Props = { searchParams: Promise<RawSearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const filters = { ...parseCatalogueFilters(sp), access: "free" as const };
  const decision = catalogueNoindexDecision(filters);
  return {
    title: "Free templates",
    description: "Every free template in the Incy Templates catalogue — no account or payment required.",
    alternates: { canonical: decision.canonical },
    robots: decision.noindex ? { index: false, follow: true } : undefined,
  };
}

export default async function FreeTemplatesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filters = { ...parseCatalogueFilters(sp), access: "free" as const };
  const result = await searchCatalogue(filters);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-ink-900">Free templates</h1>
        <p className="mt-2 max-w-2xl text-ink-500">
          Every free template in the catalogue. No account or payment required to get started.
        </p>
      </div>
      <CatalogueListing result={result} basePath="/templates/free" searchParams={filtersToSearchParams(filters)} />
    </div>
  );
}
