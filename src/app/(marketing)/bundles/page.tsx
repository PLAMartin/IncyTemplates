import type { Metadata } from "next";
import { searchCatalogue } from "@/server/queries";
import { ProductCard } from "@/components/catalogue/product-card";
import { CatalogueEmptyState } from "@/components/catalogue/empty-state";
import { canonicalUrl } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: "Bundles",
  description: "Paid template bundles that sequence several templates into one complete, connected process.",
  alternates: { canonical: canonicalUrl("/bundles") },
};

export default async function BundlesPage() {
  const result = await searchCatalogue({ type: "bundle", page: 1 });

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-ink-900">Bundles</h1>
        <p className="mt-2 max-w-2xl text-ink-500">
          Sequenced sets of templates that take you all the way through a stage of the founder journey, at a lower
          combined price than buying each template on its own.
        </p>
      </div>
      {result.items.length === 0 ? (
        <CatalogueEmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {result.items.map((bundle) => (
            <ProductCard key={bundle.id} product={bundle} />
          ))}
        </div>
      )}
    </div>
  );
}
