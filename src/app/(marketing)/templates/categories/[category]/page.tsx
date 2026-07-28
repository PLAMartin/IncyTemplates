import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, searchCatalogue } from "@/server/queries";
import { parseCatalogueFilters, filtersToSearchParams, type RawSearchParams } from "@/lib/catalogue/parse-filters";
import { catalogueNoindexDecision } from "@/lib/seo/canonical";
import { CatalogueListing } from "@/components/catalogue/catalogue-listing";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) return {};

  const sp = await searchParams;
  const filters = { ...parseCatalogueFilters(sp), category: categorySlug };
  const decision = catalogueNoindexDecision(filters);

  return {
    title: category.name,
    description: category.description ?? `Templates in the "${category.name}" category.`,
    alternates: { canonical: decision.canonical },
    robots: decision.noindex ? { index: false, follow: true } : undefined,
  };
}

export default async function CategoryTemplatesPage({ params, searchParams }: Props) {
  const { category: categorySlug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) notFound();

  const sp = await searchParams;
  const filters = { ...parseCatalogueFilters(sp), category: categorySlug };
  const result = await searchCatalogue(filters);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-ink-900">{category.name}</h1>
        {category.description ? <p className="mt-2 max-w-2xl text-ink-500">{category.description}</p> : null}
      </div>
      <CatalogueListing
        result={result}
        basePath={`/templates/categories/${categorySlug}`}
        searchParams={filtersToSearchParams(filters)}
      />
    </div>
  );
}
