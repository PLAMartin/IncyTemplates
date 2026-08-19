import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/server/queries";
import { canonicalUrl } from "@/lib/seo/canonical";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/content/json-ld";
import { Breadcrumbs } from "@/components/product/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";
import { CollectionSteps } from "@/components/collections/collection-steps";
import { ContinueJourney } from "@/components/collections/continue-journey";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  // Only the launch collection exists today; a future collection is picked up automatically
  // once seeded/published — this just avoids a live DB round trip for the one known slug.
  return [{ slug: "start-a-product" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return {};
  return {
    title: collection.seo_title ?? collection.name,
    description: collection.seo_description ?? collection.short_description,
    alternates: { canonical: canonicalUrl(`/collections/${slug}`) },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const firstStep = [...collection.members].sort((a, b) => a.stepOrder - b.stepOrder)[0];

  const path = `/collections/${slug}`;
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: collection.name, path },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />
      <Breadcrumbs items={breadcrumbItems.map((b) => ({ name: b.name, href: b.path }))} />

      <div className="mt-6 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">Collection</span>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">{collection.name}</h1>
        {collection.headline ? <p className="mt-3 text-lg text-ink-700">{collection.headline}</p> : null}
        <p className="mt-3 text-ink-500">{collection.short_description}</p>
        <p className="mt-3 text-sm text-ink-500">
          For solo founders, indie makers and small teams turning an idea into something real — start wherever fits
          what you&apos;re facing right now, or work through all five in order.
        </p>
      </div>

      <div className="mt-8 max-w-2xl">
        <ContinueJourney collection={collection} />
      </div>

      <div className="mt-10">
        <h2 className="font-serif text-xl font-semibold text-ink-900">The five steps</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-500">
          Each step combines a Guide to learn how, a Template to do it yourself, and a Tool to do it interactively.
          Use whichever fits how much time you have.
        </p>
        <CollectionSteps collection={collection} className="mt-6" />
      </div>

      <div className="mt-12 max-w-3xl rounded-md border border-ink-200 bg-paper-raised p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Worked example — Shift Swap</p>
        <h2 className="mt-2 font-serif text-xl font-semibold text-ink-900">One idea, all five steps</h2>
        <p className="mt-3 text-sm text-ink-700">
          Priya has an idea: Shift Swap, a shared, notified shift-cover board for retail and hospitality teams,
          replacing the group text everyone already relies on. She classifies it as an <strong>Improve</strong>{" "}
          idea, interviews 8 managers and 6 workers to confirm the real pain point, runs a Fake Door Test that clears her
          threshold, scopes an honest first version around her riskiest open question, and starts with the 22 people
          who already signed up rather than cold outreach. The same worked example runs through every Guide,
          Template and Tool below — look for &ldquo;Shift Swap&rdquo; as you go.
        </p>
      </div>

      {firstStep ? (
        <div className="mt-10">
          <ButtonLink href={`/products/${firstStep.framework.slug}`}>Start with {firstStep.stepLabel}</ButtonLink>
        </div>
      ) : null}
    </div>
  );
}
