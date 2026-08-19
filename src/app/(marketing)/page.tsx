import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, FileStack, Wrench } from "lucide-react";
import { getActiveCoreCollection } from "@/server/queries";
import { canonicalUrl } from "@/lib/seo/canonical";
import { ButtonLink } from "@/components/ui/button";
import { CoverPlaceholder } from "@/components/product/cover-placeholder";
import { HeroResultPreview } from "@/components/home/hero-result-preview";
import { NewsletterSignup } from "@/components/content/newsletter-signup";
import { CollectionSteps } from "@/components/collections/collection-steps";

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
    subtitle: "Do the work",
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

export default async function HomePage() {
  const collection = await getActiveCoreCollection();

  return (
    <div>
      {/* 1. Hero */}
      <section className="border-b border-ink-200 bg-paper-raised">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <h1 className="font-serif text-4xl font-semibold text-ink-900 sm:text-5xl">
              Practical tools for turning an idea into a product people want.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-700">
              Five connected steps from assessing your idea to finding your first customers. Guides show you how,
              Templates structure the work, Tools help you do it interactively.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/tools/product-idea-assessor">Assess an idea</ButtonLink>
              {collection ? (
                <ButtonLink href={`/collections/${collection.slug}`} variant="secondary">
                  See the five steps
                </ButtonLink>
              ) : null}
            </div>
          </div>
          <div aria-hidden className="mx-auto w-full max-w-sm">
            <HeroResultPreview />
          </div>
        </div>
      </section>

      {/* 2. Start a Product — five-step journey */}
      {collection ? (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
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
        </section>
      ) : null}

      {/* 3. How each capability helps */}
      <section className="border-y border-ink-200 bg-paper-raised">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="font-serif text-2xl font-semibold text-ink-900">How each step helps</h2>
          <p className="mt-2 max-w-2xl text-ink-500">
            Guide, Template and Tool are complementary ways to use the same underlying method — not three separate
            products. Use whichever depth fits what you need right now.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {GUIDE_TEMPLATE_TOOL.map(({ title, subtitle, description, icon: Icon }) => (
              <div key={title} className="rounded-md border border-ink-200 bg-paper p-5">
                <Icon aria-hidden className="size-6 text-brand-600" />
                <h3 className="mt-3 font-semibold text-ink-900">
                  {title} <span className="font-normal text-ink-500">— {subtitle}</span>
                </h3>
                <p className="mt-1 text-sm text-ink-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Featured starting capability: Product Idea Assessor */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-8 rounded-md border border-ink-200 bg-paper-raised p-6 lg:grid-cols-[2fr_3fr] lg:p-10">
          <CoverPlaceholder name="Product Idea Assessor" productType="tool" />
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">Start here — free</span>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-ink-900">Product Idea Assessor</h2>
            <p className="mt-2 text-ink-700">
              Is this idea worth pursuing? Classify it as Copy, Improve or Differentiate, answer four evidence questions, and
              get a scored readiness verdict — free, no account required, about 5–10 minutes.
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

      {/* 5. Worked-example thread */}
      {collection ? (
        <section className="border-y border-ink-200 bg-brand-100">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-900">Worked example</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-brand-900">
              One idea, five steps — see it work end to end
            </h2>
            <p className="mt-3 max-w-2xl text-brand-900">
              Shift Swap — a shared, notified shift-cover board for retail and hospitality teams — runs through
              every step of the collection: classified as an Improve idea, tested with real interviews and a Fake
              Door Test, honestly scoped, and launched to warm leads first. The same example appears in every Guide,
              Template and Tool below, so you can see how the pieces actually connect.
            </p>
            <Link
              href={`/collections/${collection.slug}`}
              className="mt-4 inline-block font-medium text-brand-900 underline"
            >
              Follow the full example
            </Link>
          </div>
        </section>
      ) : null}

      {/* 6. Broader value of IncyTemplates — restrained, not a catalogue wall */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-serif text-2xl font-semibold text-ink-900">Beyond the first five steps</h2>
        <p className="mt-2 max-w-2xl text-ink-700">
          Start a Product is the beginning, not the whole platform. Incy Templates also covers pricing and
          positioning, comparing decisions, working with AI, and the recurring habits of running a product once
          you&apos;ve launched it — promoted as its own collection once there&apos;s real evidence people want it
          next.
        </p>
        <Link href="/products" className="mt-4 inline-block font-medium text-brand-600 hover:text-brand-700">
          See what else is available
        </Link>
      </section>

      {/* 7. From A Bit Gamey to useful tools */}
      <section className="border-y border-ink-200 bg-paper-raised">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="font-serif text-2xl font-semibold text-ink-900">From A Bit Gamey to practical tools</h2>
          <p className="mt-3 max-w-2xl text-ink-500">
            Some product families start as real experience and ideas written up on A Bit Gamey. We don&apos;t
            republish that writing as-is — a family only exists once the method behind it has been distilled,
            tested and turned into something genuinely reusable.
          </p>
          <Link href="/about#source" className="mt-4 inline-block font-medium text-brand-600 underline hover:text-brand-700">
            Read where this comes from
          </Link>
        </div>
      </section>

      {/* 8. Newsletter — UI only, no backend wired up this phase */}
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

      {/* 9. Final CTA */}
      <section className="border-t border-ink-200 bg-brand-900">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
            Ready to find out if this idea is worth pursuing?
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/tools/product-idea-assessor">Assess an idea</ButtonLink>
            {collection ? (
              <ButtonLink href={`/collections/${collection.slug}`} variant="secondary">
                See the five steps
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
