import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  FileStack,
  FlaskConical,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { getFeaturedBundle, getFeaturedFreeProducts, getStages } from "@/server/queries";
import { getAllGuides } from "@/lib/mdx/guides";
import { formatMinorUnits } from "@/lib/money/bundle-savings";
import { canonicalUrl } from "@/lib/seo/canonical";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/catalogue/product-card";
import { GuideCard } from "@/components/content/guide-card";
import { CoverPlaceholder } from "@/components/product/cover-placeholder";
import { AccessBadge } from "@/components/ui/badge";
import { NewsletterSignup } from "@/components/content/newsletter-signup";

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl("/") },
};

// Spec §10.1's decision-stage nav lists 6 of the 8 journey stages
// (test-demand and review-and-improve are reachable from /templates/stages
// but deliberately left off the homepage to keep the nav to one row).
const HOMEPAGE_STAGE_SLUGS = [
  "find-a-problem",
  "evaluate-an-idea",
  "understand-customers",
  "define-the-product",
  "plan-the-mvp",
  "prepare-to-launch",
];

const DIFFERENTIATORS = [
  { title: "Field-tested", description: "Built from real founder decisions, not generic frameworks.", icon: CheckCircle2 },
  { title: "Examples included", description: "Important templates ship with at least one completed example.", icon: FileStack },
  { title: "Evidence-led", description: "Templates distinguish what you've confirmed from what you're assuming.", icon: FlaskConical },
  { title: "Multiple formats", description: "Markdown, PDF and more — use whichever fits how you work.", icon: ListChecks },
  { title: "AI-agent-ready", description: "Suitable templates include a Markdown edition built for AI agents.", icon: Sparkles },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Choose", description: "Find the template for the decision you're facing right now." },
  { step: "2", title: "Complete", description: "Work through it with plain-English instructions and a completed example." },
  { step: "3", title: "Decide", description: "Reach a documented conclusion, not just a filled-in document." },
  { step: "4", title: "Continue", description: "Move to the next template for your next decision." },
];

export default async function HomePage() {
  const [freeProducts, bundle, stages, guides] = await Promise.all([
    getFeaturedFreeProducts(3),
    getFeaturedBundle(),
    getStages(),
    getAllGuides(),
  ]);

  const homepageStages = HOMEPAGE_STAGE_SLUGS.map((slug) => stages.find((s) => s.slug === slug)).filter(
    (s): s is NonNullable<typeof s> => Boolean(s),
  );

  return (
    <div>
      {/* 1. Hero */}
      <section className="border-b border-ink-200 bg-paper-raised">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <h1 className="font-serif text-4xl font-semibold text-ink-900 sm:text-5xl">
              Practical templates that help you make the next important decision.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-700">
              Field-tested, evidence-led templates for founders and small product teams — from finding a problem
              worth solving to getting ready to launch. Not just documents: decisions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/templates">Browse templates</ButtonLink>
              <ButtonLink href="/templates/free" variant="secondary">
                Start with a free template
              </ButtonLink>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4" aria-hidden>
            <CoverPlaceholder name="Product Idea Snapshot" className="translate-y-4" />
            <CoverPlaceholder name="Proven–Better–New Assessment" />
            <CoverPlaceholder name="Customer Interview Planner" />
            <CoverPlaceholder name="Idea Validation Pack" productType="bundle" className="translate-y-4" />
          </div>
        </div>
      </section>

      {/* 2. Decision-stage navigation */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-serif text-2xl font-semibold text-ink-900">Where are you in the journey?</h2>
        <p className="mt-2 max-w-2xl text-ink-500">Start from the decision you&apos;re facing, not the format of the file.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {homepageStages.map((stage) => (
            <Link
              key={stage.slug}
              href={`/templates/stages/${stage.slug}`}
              className="flex min-h-11 items-center justify-center rounded-md border border-ink-200 bg-paper-raised p-3 text-center text-sm font-medium text-ink-900 hover:border-brand-500 focus-visible:outline-2 focus-visible:outline-focus-ring"
            >
              {stage.name}
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured free templates */}
      {freeProducts.length > 0 ? (
        <section className="border-y border-ink-200 bg-paper-raised">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-ink-900">Featured free templates</h2>
                <p className="mt-2 text-ink-500">No account or payment required.</p>
              </div>
              <Link href="/templates/free" className="hidden text-sm font-medium text-brand-600 hover:text-brand-700 sm:block">
                View all free templates
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {freeProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 4. Featured paid bundle */}
      {bundle ? (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid grid-cols-1 gap-8 rounded-md border border-ink-200 bg-paper-raised p-6 lg:grid-cols-[2fr_3fr] lg:p-10">
            <CoverPlaceholder name={bundle.name} productType="bundle" />
            <div>
              <AccessBadge state="paid" />
              <h2 className="mt-3 font-serif text-2xl font-semibold text-ink-900">{bundle.name}</h2>
              <p className="mt-2 text-ink-700">{bundle.short_description}</p>
              <p className="mt-4 text-lg font-semibold text-ink-900">
                {formatMinorUnits(bundle.price_minor ?? 0, bundle.currency_code)}
              </p>
              <ButtonLink href={`/bundles/${bundle.slug}`} className="mt-4">
                See what&apos;s included
              </ButtonLink>
            </div>
          </div>
        </section>
      ) : null}

      {/* 5. How Incy Templates are different */}
      <section className="border-y border-ink-200 bg-paper-raised">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="font-serif text-2xl font-semibold text-ink-900">How Incy Templates is different</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {DIFFERENTIATORS.map(({ title, description, icon: Icon }) => (
              <div key={title}>
                <Icon aria-hidden className="size-6 text-brand-600" />
                <h3 className="mt-3 font-semibold text-ink-900">{title}</h3>
                <p className="mt-1 text-sm text-ink-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. How it works */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-serif text-2xl font-semibold text-ink-900">How it works</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map(({ step, title, description }) => (
            <div key={step} className="rounded-md border border-ink-200 bg-paper-raised p-5">
              <span className="text-xs font-semibold text-brand-600">Step {step}</span>
              <h3 className="mt-2 font-semibold text-ink-900">{title}</h3>
              <p className="mt-1 text-sm text-ink-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Proven–Better–New method */}
      <section className="border-y border-ink-200 bg-brand-100">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="font-serif text-2xl font-semibold text-brand-900">The Proven–Better–New method</h2>
          <p className="mt-3 max-w-2xl text-brand-900">
            Before you validate an idea, work out how much validation it actually needs. Our Proven–Better–New method
            classifies every idea so you know exactly how much evidence to gather before committing.
          </p>
          <Link href="/methods/proven-better-new" className="mt-4 inline-block font-medium text-brand-900 underline">
            Learn the method
          </Link>
        </div>
      </section>

      {/* 8. Real Incyworks example (illustrative placeholder) */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="rounded-md border border-dashed border-ink-200 p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Illustrative example — not a real case study yet</p>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-ink-900">How a template like this gets used</h2>
          <p className="mt-3 max-w-2xl text-ink-700">
            This is a placeholder for a genuine Incyworks example: a real decision, made using one of these
            templates, with the actual outcome shown. We haven&apos;t published a real case study yet — when we do,
            it will replace this section with a specific, honest account rather than a generic illustration.
          </p>
        </div>
      </section>

      {/* 9. Guide content teaser */}
      {guides.length > 0 ? (
        <section className="border-y border-ink-200 bg-paper-raised">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-serif text-2xl font-semibold text-ink-900">From the guides</h2>
              <Link href="/guides" className="hidden text-sm font-medium text-brand-600 hover:text-brand-700 sm:block">
                View all guides
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {guides.slice(0, 3).map((guide) => (
                <GuideCard key={guide.slug} guide={guide} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 10. Newsletter — UI only, no backend wired up this phase */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="rounded-md border border-ink-200 bg-paper-raised p-6 sm:p-8">
          <h2 className="font-serif text-xl font-semibold text-ink-900">Get one useful idea a month</h2>
          <p className="mt-2 max-w-xl text-sm text-ink-500">
            Occasional emails about new templates and guides. No spam, and marketing consent is always separate from
            anything else — see our{" "}
            <Link href="/legal/privacy" className="underline">
              privacy notice
            </Link>
            .
          </p>
          <NewsletterSignup />
        </div>
      </section>

      {/* 11. Final CTA */}
      <section className="border-t border-ink-200 bg-brand-900">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
            Ready to make your next decision with evidence, not guesswork?
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/templates">Browse templates</ButtonLink>
            <ButtonLink href="/templates/free" variant="secondary">
              Start with a free template
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
