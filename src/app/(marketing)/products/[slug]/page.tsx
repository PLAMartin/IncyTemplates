import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getFrameworkBySlug,
  getFrameworkOutputs,
  getFrameworks,
  getFrameworkTeasers,
  getFrameworkVisual,
  getActiveCoreCollection,
} from "@/server/queries";
import { canonicalUrl } from "@/lib/seo/canonical";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/content/json-ld";
import { Breadcrumbs } from "@/components/product/breadcrumbs";
import { AccessBadge } from "@/components/ui/badge";
import { ProductCard } from "@/components/catalogue/product-card";
import { FrameworkCard } from "@/components/framework/framework-card";
import { CollectionStepBadge } from "@/components/collections/collection-steps";
import type { ProductSummary } from "@/types/catalogue";

type Props = { params: Promise<{ slug: string }> };

const OUTPUT_TYPE_COPY: Record<ProductSummary["product_type"], { heading: string; role: string }> = {
  guide: { heading: "Guide", role: "Learn how" },
  template: { heading: "Template", role: "Do it yourself" },
  tool: { heading: "Tool", role: "Do it interactively" },
  bundle: { heading: "Bundle", role: "The complete family, bundled" },
};

export async function generateStaticParams() {
  const frameworks = await getFrameworks();
  return frameworks.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const framework = await getFrameworkBySlug(slug);
  if (!framework) return {};
  return {
    title: framework.seo_title ?? framework.name,
    description: framework.seo_description ?? framework.short_description,
    alternates: { canonical: canonicalUrl(`/products/${slug}`) },
  };
}

export default async function FrameworkPage({ params }: Props) {
  const { slug } = await params;
  const framework = await getFrameworkBySlug(slug);

  const path = `/products/${slug}`;
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
  ];

  if (!framework) {
    // Not published (yet) — might still be one of the public "Coming soon" draft-flagship
    // teasers, in which case it gets a minimal in-development state rather than a 404.
    // Only the narrow teaser fields are ever read here — no problem/method/priority data.
    const teasers = await getFrameworkTeasers();
    const teaser = teasers.find((t) => t.slug === slug);
    if (!teaser) notFound();

    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Breadcrumbs items={[...breadcrumbItems, { name: teaser.name, path }].map((b) => ({ name: b.name, href: b.path }))} />
        <div className="mt-6">
          <AccessBadge state="coming-soon" />
          <h1 className="mt-3 font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">{teaser.name}</h1>
          <p className="mt-3 text-lg text-ink-700">{teaser.short_description}</p>
          <p className="mt-6 text-ink-500">
            This product family is still in development — its Guide, Template and Tool aren&apos;t published yet.
            Check back soon, or start with{" "}
            <Link href="/products/product-idea-assessor" className="underline hover:text-ink-900">
              Product Idea Assessor
            </Link>{" "}
            in the meantime.
          </p>
        </div>
      </div>
    );
  }

  const [outputs, nextStepTeasers, heroVisual, coreCollection] = await Promise.all([
    getFrameworkOutputs(framework.id),
    framework.next_step_framework_slug ? getFrameworkTeasers() : Promise.resolve([]),
    getFrameworkVisual(framework.id, "family_hero"),
    getActiveCoreCollection(),
  ]);
  // Absence must never block the rest of the page (spec §44 item 29) — heroVisual/heroVariant
  // are simply null until a visual is published for this family.
  const heroVariant = heroVisual?.variants.find((v) => v.variantKey === "hero_lg") ?? heroVisual?.variants[0];

  const nextStep = nextStepTeasers.find((t) => t.slug === framework.next_step_framework_slug);
  const recommendedStart = outputs.find((o) => o.product_type !== "bundle") ?? outputs[0];
  const outputsByType = outputs.reduce<Partial<Record<ProductSummary["product_type"], ProductSummary[]>>>(
    (acc, output) => {
      (acc[output.product_type] ??= []).push(output);
      return acc;
    },
    {},
  );

  breadcrumbItems.push({ name: framework.name, path });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />
      <Breadcrumbs items={breadcrumbItems.map((b) => ({ name: b.name, href: b.path }))} />

      <div className={`mt-6 ${heroVariant ? "grid grid-cols-1 items-center gap-8 lg:grid-cols-[3fr_2fr]" : ""}`}>
        <div className="max-w-3xl">
          {coreCollection ? (
            <div className="mb-2">
              <CollectionStepBadge collection={coreCollection} frameworkSlug={framework.slug} />
            </div>
          ) : null}
          {framework.journey_stage ? (
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              {framework.journey_stage.name}
            </span>
          ) : null}
          <h1 className="mt-2 font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">{framework.name}</h1>
          <p className="mt-3 text-lg text-ink-700">{framework.outcome_statement}</p>
          {framework.problem_statement ? <p className="mt-3 text-ink-500">{framework.problem_statement}</p> : null}
        </div>
        {heroVariant ? (
          // Plain <img>, not next/image: the source is SVG from Supabase Storage, and
          // enabling SVG through next/image's optimizer means opting into
          // dangerouslyAllowSVG + a CSP tradeoff project-wide (relevant once uploaded, not
          // just rendered, visuals exist) — a decision to make deliberately, not as a side
          // effect of this proof pass. Explicit width/height still avoids layout shift.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroVariant.url}
            alt={heroVisual?.decorative ? "" : (heroVisual?.altText ?? "")}
            width={heroVariant.width}
            height={heroVariant.height}
            className="w-full max-w-md rounded-lg"
          />
        ) : null}
      </div>

      {(framework.when_to_use || framework.when_not_to_use) ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {framework.when_to_use ? (
            <div>
              <h2 className="text-base font-semibold text-ink-900">When to use it</h2>
              <p className="mt-2 text-sm text-ink-700">{framework.when_to_use}</p>
            </div>
          ) : null}
          {framework.when_not_to_use ? (
            <div>
              <h2 className="text-base font-semibold text-ink-900">When not to use it</h2>
              <p className="mt-2 text-sm text-ink-700">{framework.when_not_to_use}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {framework.method_summary ? (
        <div className="mt-8 max-w-3xl">
          <h2 className="text-lg font-semibold text-ink-900">The method</h2>
          <p className="mt-2 text-ink-700">{framework.method_summary}</p>
        </div>
      ) : null}

      <div className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-2xl font-semibold text-ink-900">Ways to use this</h2>
          {recommendedStart ? (
            <span className="text-sm text-ink-500">
              Recommended starting point: <strong className="text-ink-900">{recommendedStart.name}</strong>
            </span>
          ) : null}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {(["guide", "template", "tool"] as const).map((type) => {
            const items = outputsByType[type];
            if (!items || items.length === 0) return null;
            const copy = OUTPUT_TYPE_COPY[type];
            return (
              <div key={type}>
                <h3 className="text-sm font-semibold text-ink-900">
                  {copy.heading} — <span className="font-normal text-ink-500">{copy.role}</span>
                </h3>
                <div className="mt-3 space-y-3">
                  {items.map((item) => (
                    <ProductCard key={item.id} product={item} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {outputsByType.bundle?.length ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {outputsByType.bundle.map((bundle) => (
              <ProductCard key={bundle.id} product={bundle} />
            ))}
          </div>
        ) : null}
      </div>

      {framework.source_note ? (
        <div className="mt-10 max-w-3xl rounded-md border border-ink-200 bg-paper-raised p-4">
          <h2 className="text-sm font-semibold text-ink-900">Source</h2>
          <p className="mt-1 text-sm text-ink-500">{framework.source_note}</p>
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
