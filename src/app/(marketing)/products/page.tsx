import type { Metadata } from "next";
import Link from "next/link";
import { getActiveCoreCollection, getFrameworkTeasers } from "@/server/queries";
import { canonicalUrl } from "@/lib/seo/canonical";
import { FrameworkCard } from "@/components/framework/framework-card";
import { CollectionSteps } from "@/components/collections/collection-steps";

export const metadata: Metadata = {
  title: "Products",
  description: "Start a Product: five connected steps from assessing your idea to finding your first customers.",
  alternates: { canonical: canonicalUrl("/products") },
};

/**
 * Spec v9 §8.2/§10.2: the Products destination leads with the active Core Collection, then a
 * restrained "More from IncyTemplates" for anything else explicitly public. `getFrameworkTeasers`
 * already only returns `public_visibility: 'public'` frameworks (the 5 core families plus any
 * future explicitly-promoted family) — the "curated set" requirement is enforced at the query
 * layer, not by filtering here.
 */
export default async function ProductsIndexPage() {
  const [collection, frameworks] = await Promise.all([getActiveCoreCollection(), getFrameworkTeasers()]);
  const coreSlugs = new Set(collection?.members.map((m) => m.framework.slug) ?? []);
  const moreFromIncyTemplates = frameworks.filter((f) => !coreSlugs.has(f.slug));

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-ink-900">Products</h1>
        <p className="mt-2 max-w-2xl text-ink-500">
          Each product family is a reusable method for one job — a Guide to learn how, a Template to do it
          yourself, a Tool to do it interactively. Use whichever depth fits what you need right now.
        </p>
      </div>

      {collection ? (
        <div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-ink-900">{collection.name}</h2>
              <p className="mt-2 max-w-2xl text-ink-500">{collection.headline}</p>
            </div>
            <Link
              href={`/collections/${collection.slug}`}
              className="hidden text-sm font-medium text-brand-600 hover:text-brand-700 sm:block"
            >
              See the full collection
            </Link>
          </div>
          <CollectionSteps collection={collection} className="mt-6" />
        </div>
      ) : null}

      {moreFromIncyTemplates.length > 0 ? (
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink-900">More from Incy Templates</h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-500">
            Additional capabilities we&apos;ve built and stand behind, alongside Start a Product.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {moreFromIncyTemplates.map((framework) => (
              <FrameworkCard key={framework.id} framework={framework} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
