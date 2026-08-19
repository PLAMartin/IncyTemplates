import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { getProductByToolKey, getFrameworkOutputs, getFrameworkById, getFrameworkTeasers } from "@/server/queries";
import { getToolCopyForToolKey } from "@/server/queries/tool-copy";
import { canonicalUrl } from "@/lib/seo/canonical";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/content/json-ld";
import { Breadcrumbs } from "@/components/product/breadcrumbs";
import { AccessBadge } from "@/components/ui/badge";
import { FrameworkCard } from "@/components/framework/framework-card";
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
import { UserEngagementDesignerRunner } from "@/components/tools/user-engagement-designer/tool-runner";
import { StoryBuilderRunner } from "@/components/tools/story-builder/tool-runner";
import { StartupLaunchPlannerRunner } from "@/components/tools/startup-launch-planner/tool-runner";
import { MeetingResetRunner } from "@/components/tools/meeting-reset/tool-runner";
import { WritingEditorRunner } from "@/components/tools/writing-editor/tool-runner";
import { AppDesignReviewRunner } from "@/components/tools/app-design-review/tool-runner";
import { AiPromptBuilderRunner } from "@/components/tools/ai-prompt-builder/tool-runner";
import { AiAgentDesignerRunner } from "@/components/tools/ai-agent-designer/tool-runner";
import { NegotiationPrepRunner } from "@/components/tools/negotiation-prep/tool-runner";
import { StickyPitchCheckerRunner } from "@/components/tools/sticky-pitch-checker/tool-runner";
import { RapidLearningPlannerRunner } from "@/components/tools/rapid-learning-planner/tool-runner";

type Props = { params: Promise<{ toolKey: string }> };

/**
 * tool_key -> the Client Component that runs it. Deliberately a small explicit map, not a
 * dynamic import keyed by untrusted string — mirrors the same "database is a lookup key,
 * never executable code" boundary as `src/lib/tools/registry.ts`.
 */
const TOOL_RUNNERS: Record<string, ComponentType<{ copy?: Record<string, string> }>> = {
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
  "user-engagement-designer": UserEngagementDesignerRunner,
  "story-builder": StoryBuilderRunner,
  "startup-launch-planner": StartupLaunchPlannerRunner,
  "meeting-reset": MeetingResetRunner,
  "writing-editor": WritingEditorRunner,
  "app-design-review": AppDesignReviewRunner,
  "ai-prompt-builder": AiPromptBuilderRunner,
  "ai-agent-designer": AiAgentDesignerRunner,
  "negotiation-prep": NegotiationPrepRunner,
  "sticky-pitch-checker": StickyPitchCheckerRunner,
  "rapid-learning-planner": RapidLearningPlannerRunner,
};

/**
 * Static "Worked example" blurbs for the 5 Core Collection Tools (spec v9 §10.6 lists "Worked
 * example" as a required Tool-page section, alongside the real interactive UI). Deliberately
 * NOT part of any Tool's admin-editable `copySchema` — this is the same fixed cross-family
 * illustration used on the Guide/Template pages for these families (spec v9 §3.7, "Shift Swap"),
 * not per-tool editorial copy an admin would routinely revise. Non-core Tools have no entry and
 * simply don't render this section, matching the existing "no example concept in Tool copy"
 * shape the rest of the platform already uses.
 */
const TOOL_WORKED_EXAMPLES: Record<string, string> = {
  "product-idea-assessor":
    "For example: Priya classifies Shift Swap — a shared, notified shift-cover board — as Improve, since covering a shift is already something people do informally by text. Her evidence is moderate: the group-text workaround is strong proof the behaviour exists, but she hasn't yet confirmed the pain is real for anyone but herself. Verdict: proceed to Customer Discovery Kit before committing further.",
  "customer-discovery-kit":
    "For example: after interviewing 8 managers and 6 workers about Shift Swap, Priya scores her evidence here — real past behaviour, several independent confirmations of the same day-of pain point, no leading questions. The result: strong enough to act on, with a flag to keep watching for the abandoned-spreadsheet pattern before assuming a new tool will be trusted any differently.",
  "customer-demand-test":
    "For example: testing real demand for Shift Swap among local café and retail managers — a mostly untested audience with no existing customer list to email — this Tool recommends a Fake Door Test over a Wizard of Oz: proving demand at scale mattered more than proving it could be manually fulfilled at one location.",
  "mvp-scoper":
    "For example: scoping Shift Swap, Priya runs \"automated calendar sync\" through this Tool. It's rated nice-to-have — the product still works without it — and doesn't touch her riskiest question (will people actually use the board instead of texting). Verdict: Defer.",
  "first-customers-planner":
    "For example: choosing how to reach Shift Swap's first customers, this Tool scores \"personally onboarding local businesses\" against a broad ad campaign — a higher fit for a founder with no ad budget but real warm relationships. Verdict: the personal channel wins on fit and repeatability.",
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

  const copy = await getToolCopyForToolKey(toolKey);

  const framework = product.framework_id ? await getFrameworkById(product.framework_id) : null;
  const [familyOutputs, nextStepTeasers] = await Promise.all([
    product.framework_id ? getFrameworkOutputs(product.framework_id) : Promise.resolve([]),
    framework?.next_step_framework_slug ? getFrameworkTeasers() : Promise.resolve([]),
  ]);
  const sameFamily = familyOutputs.filter((o) => o.id !== product.id);
  const nextStep = nextStepTeasers.find((t) => t.slug === framework?.next_step_framework_slug);

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
        <Runner copy={copy} />
      </div>

      {TOOL_WORKED_EXAMPLES[toolKey] ? (
        <div className="mt-10 rounded-md border border-ink-200 bg-paper-raised p-4">
          <h2 className="text-base font-semibold text-ink-900">Worked example</h2>
          <p className="mt-2 text-sm text-ink-700">{TOOL_WORKED_EXAMPLES[toolKey]}</p>
        </div>
      ) : null}

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

      {nextStep ? (
        <div className="mt-10 max-w-sm">
          <h2 className="text-lg font-semibold text-ink-900">Next step</h2>
          <div className="mt-3">
            <FrameworkCard framework={nextStep} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
