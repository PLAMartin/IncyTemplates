import type { Metadata } from "next";
import { getFrameworks, getFrameworkOutputs } from "@/server/queries";
import { canonicalUrl } from "@/lib/seo/canonical";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/content/json-ld";
import { Breadcrumbs } from "@/components/product/breadcrumbs";
import { FinderRunner } from "@/components/finder/finder-runner";
import type { FinderFrameworkOption, FinderOutputType } from "@/lib/finder";
import type { ProductSummary } from "@/types/catalogue";

function isFinderOutput(product: ProductSummary): product is ProductSummary & { product_type: FinderOutputType } {
  return product.product_type === "guide" || product.product_type === "template" || product.product_type === "tool";
}

export const metadata: Metadata = {
  title: "Next Step Finder",
  description: "Answer three quick questions and find the most useful thing to do next, free, no account required.",
  alternates: { canonical: canonicalUrl("/finder") },
};

export default async function FinderPage() {
  const frameworks = await getFrameworks();
  const outputsByFramework = await Promise.all(frameworks.map((framework) => getFrameworkOutputs(framework.id)));

  // Projects real, already-fetched catalogue data into the rules engine's minimal input
  // shape (spec §22.4's "rules... stored as data" — the frameworks/outputs *are* that data,
  // not a separate hand-maintained table) and carries the full ProductSummary list forward
  // so the client component can resolve a recommendation back into real product cards.
  const frameworkOptions: FinderFrameworkOption[] = frameworks.map((framework, index) => ({
    id: framework.id,
    slug: framework.slug,
    name: framework.name,
    outcomeStatement: framework.outcome_statement,
    nextStepFrameworkSlug: framework.next_step_framework_slug,
    outputs: outputsByFramework[index]!
      .filter(isFinderOutput)
      .map((o) => ({ productType: o.product_type, accessType: o.access_type })),
  }));

  const path = "/finder";
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Next Step Finder", path },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />
      <Breadcrumbs items={breadcrumbItems.map((b) => ({ name: b.name, href: b.path }))} />

      <div className="mt-6">
        <h1 className="font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">Next Step Finder</h1>
        <p className="mt-3 text-lg text-ink-700">
          Answer three quick questions and find the most useful thing for you to do next.
        </p>
      </div>

      <div className="mt-8">
        <FinderRunner frameworkOptions={frameworkOptions} outputsByFramework={outputsByFramework.flat()} />
      </div>
    </div>
  );
}
