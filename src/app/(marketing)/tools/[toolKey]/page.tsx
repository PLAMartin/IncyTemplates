import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { getProductByToolKey, getFrameworkOutputs } from "@/server/queries";
import { canonicalUrl } from "@/lib/seo/canonical";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/content/json-ld";
import { Breadcrumbs } from "@/components/product/breadcrumbs";
import { AccessBadge } from "@/components/ui/badge";
import { ProductCard } from "@/components/catalogue/product-card";
import { ProductIdeaAssessorRunner } from "@/components/tools/product-idea-assessor/tool-runner";
import { CustomerDiscoveryKitRunner } from "@/components/tools/customer-discovery-kit/tool-runner";
import { BetterDecisionMakerRunner } from "@/components/tools/better-decision-maker/tool-runner";
import { MvpScoperRunner } from "@/components/tools/mvp-scoper/tool-runner";
import { ProductNamingSystemRunner } from "@/components/tools/product-naming-system/tool-runner";
import { FirstCustomersPlannerRunner } from "@/components/tools/first-customers-planner/tool-runner";
import { ProductMarketFitTrackerRunner } from "@/components/tools/product-market-fit-tracker/tool-runner";
import { PricingYourProductRunner } from "@/components/tools/pricing-your-product/tool-runner";
import { ProductIdeaGeneratorRunner } from "@/components/tools/product-idea-generator/tool-runner";
import { BusinessModelChooserRunner } from "@/components/tools/business-model-chooser/tool-runner";
import { DecisionFrameworkPickerRunner } from "@/components/tools/decision-framework-picker/tool-runner";
import { ProductPositioningBuilderRunner } from "@/components/tools/product-positioning-builder/tool-runner";
import { CustomerDemandTestRunner } from "@/components/tools/customer-demand-test/tool-runner";
import { ProductPrioritisationToolRunner } from "@/components/tools/product-prioritisation-tool/tool-runner";
import { LateralThinkingToolkitRunner } from "@/components/tools/lateral-thinking-toolkit/tool-runner";

type Props = { params: Promise<{ toolKey: string }> };

/**
 * tool_key -> the Client Component that runs it. Deliberately a small explicit map, not a
 * dynamic import keyed by untrusted string — mirrors the same "database is a lookup key,
 * never executable code" boundary as `src/lib/tools/registry.ts`.
 */
const TOOL_RUNNERS: Record<string, ComponentType> = {
  "product-idea-assessor": ProductIdeaAssessorRunner,
  "customer-discovery-kit": CustomerDiscoveryKitRunner,
  "better-decision-maker": BetterDecisionMakerRunner,
  "mvp-scoper": MvpScoperRunner,
  "product-naming-system": ProductNamingSystemRunner,
  "first-customers-planner": FirstCustomersPlannerRunner,
  "product-market-fit-tracker": ProductMarketFitTrackerRunner,
  "pricing-your-product": PricingYourProductRunner,
  "product-idea-generator": ProductIdeaGeneratorRunner,
  "business-model-chooser": BusinessModelChooserRunner,
  "decision-framework-picker": DecisionFrameworkPickerRunner,
  "product-positioning-builder": ProductPositioningBuilderRunner,
  "customer-demand-test": CustomerDemandTestRunner,
  "product-prioritisation-tool": ProductPrioritisationToolRunner,
  "lateral-thinking-toolkit": LateralThinkingToolkitRunner,
};

export async function generateStaticParams() {
  return Object.keys(TOOL_RUNNERS).map((toolKey) => ({ toolKey }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { toolKey } = await params;
  const product = await getProductByToolKey(toolKey);
  if (!product) return {};
  return {
    title: product.seo_title ?? product.name,
    description: product.seo_description ?? product.short_description,
    alternates: { canonical: canonicalUrl(`/tools/${toolKey}`) },
  };
}

export default async function ToolPage({ params }: Props) {
  const { toolKey } = await params;
  const [product, Runner] = [await getProductByToolKey(toolKey), TOOL_RUNNERS[toolKey]];
  if (!product || !Runner) notFound();

  const familyOutputs = product.framework_id ? await getFrameworkOutputs(product.framework_id) : [];
  const sameFamily = familyOutputs.filter((o) => o.id !== product.id);

  const path = `/tools/${toolKey}`;
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: product.name, path },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />
      <Breadcrumbs items={breadcrumbItems.map((b) => ({ name: b.name, href: b.path }))} />

      <div className="mt-6">
        <AccessBadge state="free" />
        <h1 className="mt-3 font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">{product.name}</h1>
        {product.outcome_statement ? <p className="mt-3 text-lg text-ink-700">{product.outcome_statement}</p> : null}
        <p className="mt-2 text-ink-500">{product.short_description}</p>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 rounded-md border border-ink-200 bg-paper-raised p-4 text-sm">
        <div>
          <dt className="text-ink-500">Approximate effort</dt>
          <dd className="font-medium text-ink-900">
            {product.completion_minutes_min ? `${product.completion_minutes_min}–${product.completion_minutes_max} min` : "A few minutes"}
          </dd>
        </div>
        <div>
          <dt className="text-ink-500">Privacy</dt>
          <dd className="font-medium text-ink-900">Runs in your browser. Nothing is saved or sent anywhere.</dd>
        </div>
      </dl>

      <div className="mt-8">
        <Runner />
      </div>

      {sameFamily.length > 0 ? (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-ink-900">Same family</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {sameFamily.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
