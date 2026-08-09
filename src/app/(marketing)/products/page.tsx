import type { Metadata } from "next";
import { getFrameworkTeasers } from "@/server/queries";
import { canonicalUrl } from "@/lib/seo/canonical";
import { FrameworkCard } from "@/components/framework/framework-card";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse product families by the outcome you need — each combines a Guide, Template and/or Tool.",
  alternates: { canonical: canonicalUrl("/products") },
};

export default async function ProductsIndexPage() {
  const frameworks = await getFrameworkTeasers();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-ink-900">Products</h1>
        <p className="mt-2 max-w-2xl text-ink-500">
          Each product family is a reusable method for one job — a Guide to learn how, a Template to do it
          yourself, a Tool to do it interactively. Use whichever depth fits what you need right now.
        </p>
      </div>
      {frameworks.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {frameworks.map((framework) => (
            <FrameworkCard key={framework.id} framework={framework} />
          ))}
        </div>
      ) : (
        <p className="text-ink-500">No product families are published yet.</p>
      )}
    </div>
  );
}
