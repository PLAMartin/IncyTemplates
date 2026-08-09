import type { Metadata } from "next";
import { searchCatalogue } from "@/server/queries";
import { canonicalUrl } from "@/lib/seo/canonical";
import { ProductCard } from "@/components/catalogue/product-card";

export const metadata: Metadata = {
  title: "Tools",
  description: "Interactive tools that take your inputs and produce a structured result — free, no account required.",
  alternates: { canonical: canonicalUrl("/tools") },
};

export default async function ToolsIndexPage() {
  const result = await searchCatalogue({ type: "tool" });

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-ink-900">Tools</h1>
        <p className="mt-2 max-w-2xl text-ink-500">
          Answer a few questions and get a structured result — a score, a recommendation, or a next action. No
          account required to use one.
        </p>
      </div>
      {result.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((tool) => (
            <ProductCard key={tool.id} product={tool} />
          ))}
        </div>
      ) : (
        <p className="text-ink-500">No tools are published yet.</p>
      )}
    </div>
  );
}
