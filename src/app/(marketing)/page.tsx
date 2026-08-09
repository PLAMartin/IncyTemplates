import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, FileStack, Wrench } from "lucide-react";
import { getFeaturedBundle, getFeaturedFreeProducts, getFrameworkTeasers, getStages } from "@/server/queries";
import { getAllGuides } from "@/lib/mdx/guides";
import { formatMinorUnits } from "@/lib/money/bundle-savings";
import { canonicalUrl } from "@/lib/seo/canonical";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/catalogue/product-card";
import { FrameworkCard } from "@/components/framework/framework-card";
import { GuideCard } from "@/components/content/guide-card";
import { CoverPlaceholder } from "@/components/product/cover-placeholder";
import { AccessBadge } from "@/components/ui/badge";
import { NewsletterSignup } from "@/components/content/newsletter-signup";

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl("/") },
};

const GUIDE_TEMPLATE_TOOL = [
  {
    title: "Guide",
    subtitle: "Learn how",
    description: "Understand the method, the reasoning behind it, and when it applies to your situation.",
    icon: BookOpen,
  },
  {
    title: "Template",
    subtitle: "Do it yourself",
    description: "A structured starting point you complete or adapt, with a worked example included.",
    icon: FileStack,
  },
  {
    title: "Tool",
    subtitle: "Do it interactively",
    description: "Answer a few questions and get a calculated, structured result — faster than doing it by hand.",
    icon: Wrench,
  },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Choose a task", description: "Find the product family for the decision you're facing right now." },
  { step: "2", title: "Learn the method", description: "Read the Guide to understand what to do and why." },
  { step: "3", title: "Apply it", description: "Work through the Template or the Tool, whichever fits how much time you have." },
  { step: "4", title: "Decide what to do next", description: "Get a documented result and one sensible next step, not a wall of options." },
];

export default async function HomePage() {
  const [freeProducts, bundle, stages, frameworks, guides] = await Promise.all([
    getFeaturedFreeProducts(3),
    getFeaturedBundle(),
    getStages(),
    getFrameworkTeasers(),
    getAllGuides(),
  ]);

  return (
    <div>
      {/* 1. Hero */}
      <section className="border-b border-ink-200 bg-paper-raised">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <h1 className="font-serif text-4xl font-semibold text-ink-900 sm:text-5xl">
              Practical tools for turning ideas into products.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-700">
              Guides show you how. Templates give you a starting point. Tools help you do the work. Start with
              whichever depth fits the decision you&apos;re facing right now.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/tools/product-idea-assessor">Assess an idea</ButtonLink>
              <ButtonLink href="/products" variant="secondary">
                Explore all products
              </ButtonLink>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4" aria-hidden>
            <CoverPlaceholder name="Product Idea Assessor" productType="tool" className="translate-y-4" />
            <CoverPlaceholder name="Product Idea Assessor: the Guide" productType="guide" />
            <CoverPlaceholder name="Copy–Improve–Differentiate Assessment" />
            <CoverPlaceholder name="Idea Validation Pack" productType="bundle" className="translate-y-4" />
          </div>
        </div>
      </section>

      {/* 2. How Incy Templates helps */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-serif text-2xl font-semibold text-ink-900">How Incy Templates helps</h2>
        <p className="mt-2 max-w-2xl text-ink-500">
          Guide, Template and Tool are complementary ways to use the same underlying method — not three separate
          products.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {GUIDE_TEMPLATE_TOOL.map(({ title, subtitle, description, icon: Icon }) => (
            <div key={title} className="rounded-md border border-ink-200 bg-paper-raised p-5">
              <Icon aria-hidden className="size-6 text-brand-600" />
              <h3 className="mt-3 font-semibold text-ink-900">
                {title} <span className="font-normal text-ink-500">— {subtitle}</span>
              </h3>
              <p className="mt-1 text-sm text-ink-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Product journey */}
      <section className="border-y border-ink-200 bg-paper-raised">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="font-serif text-2xl font-semibold text-ink-900">Where are you in the journey?</h2>
          <p className="mt-2 max-w-2xl text-ink-500">Start from the task you&apos;re facing, not the format of the answer.</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {stages.map((stage) => (
              <Link
                key={stage.slug}
                href={`/journey/${stage.slug}`}
                className="flex min-h-11 items-center justify-center rounded-md border border-ink-200 bg-paper p-3 text-center text-sm font-medium text-ink-900 hover:border-brand-500 focus-visible:outline-2 focus-visible:outline-focus-ring"
              >
                {stage.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Flagship product: Product Idea Assessor */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-8 rounded-md border border-ink-200 bg-paper-raised p-6 lg:grid-cols-[2fr_3fr] lg:p-10">
          <CoverPlaceholder name="Product Idea Assessor" productType="tool" />
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">Flagship product</span>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-ink-900">Product Idea Assessor</h2>
            <p className="mt-2 text-ink-700">
              Is this idea worth pursuing? Classify it as Copy, Improve or Differentiate, answer four evidence questions, and
              get a scored readiness verdict — free, no account required.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <ButtonLink href="/tools/product-idea-assessor">Try the Tool</ButtonLink>
              <Link
                href="/products/product-idea-assessor"
                className="inline-flex min-h-11 items-center rounded-md border border-ink-200 px-4 text-sm font-medium text-ink-900 hover:bg-ink-100"
              >
                See the full family
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured product families */}
      {frameworks.length > 0 ? (
        <section className="border-y border-ink-200 bg-paper-raised">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-ink-900">Product families</h2>
                <p className="mt-2 text-ink-500">
                  All six flagship product families are live — pick whichever fits where you are in the journey.
                </p>
              </div>
              <Link href="/products" className="hidden text-sm font-medium text-brand-600 hover:text-brand-700 sm:block">
                View all products
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {frameworks.map((framework) => (
                <FrameworkCard key={framework.id} framework={framework} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 6. Featured free templates (legacy catalogue, still useful) */}
      {freeProducts.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
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
        </section>
      ) : null}

      {/* 7. Featured paid bundle */}
      {bundle ? (
        <section className="border-y border-ink-200 bg-paper-raised">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="grid grid-cols-1 gap-8 rounded-md border border-ink-200 bg-paper p-6 lg:grid-cols-[2fr_3fr] lg:p-10">
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
          </div>
        </section>
      ) : null}

      {/* 8. How it works */}
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

      {/* 9. From A Bit Gamey to useful tools */}
      <section className="border-y border-ink-200 bg-brand-100">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="font-serif text-2xl font-semibold text-brand-900">From A Bit Gamey to useful tools</h2>
          <p className="mt-3 max-w-2xl text-brand-900">
            Some product families start as real experience and ideas written up on A Bit Gamey. We don&apos;t
            republish that writing as-is — a family only exists once the method behind it has been distilled,
            tested and turned into something genuinely reusable.
          </p>
          <Link href="/about#source" className="mt-4 inline-block font-medium text-brand-900 underline">
            Read where this comes from
          </Link>
        </div>
      </section>

      {/* 10. Real Incyworks example (illustrative placeholder) */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="rounded-md border border-dashed border-ink-200 p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Illustrative example — not a real case study yet</p>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-ink-900">How a product family like this gets used</h2>
          <p className="mt-3 max-w-2xl text-ink-700">
            This is a placeholder for a genuine Incyworks example: a real decision, made using one of these product
            families, with the actual outcome shown. We haven&apos;t published a real case study yet — when we do,
            it will replace this section with a specific, honest account rather than a generic illustration.
          </p>
        </div>
      </section>

      {/* 11. Guide content teaser */}
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

      {/* 12. Newsletter — UI only, no backend wired up this phase */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="rounded-md border border-ink-200 bg-paper-raised p-6 sm:p-8">
          <h2 className="font-serif text-xl font-semibold text-ink-900">Get one useful idea a month</h2>
          <p className="mt-2 max-w-xl text-sm text-ink-500">
            Occasional emails about new product families and guides. No spam, and marketing consent is always
            separate from anything else — see our{" "}
            <Link href="/legal/privacy" className="underline">
              privacy notice
            </Link>
            .
          </p>
          <NewsletterSignup />
        </div>
      </section>

      {/* 13. Final CTA */}
      <section className="border-t border-ink-200 bg-brand-900">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
            Ready to make your next decision with evidence, not guesswork?
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/tools/product-idea-assessor">Assess an idea</ButtonLink>
            <ButtonLink href="/products" variant="secondary">
              Explore all products
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
