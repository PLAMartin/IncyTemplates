import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBundleBySlug } from "@/server/queries";
import { getAllGuides } from "@/lib/mdx/guides";
import { calculateBundleSaving, formatMinorUnits } from "@/lib/money/bundle-savings";
import { canonicalUrl } from "@/lib/seo/canonical";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/content/json-ld";
import { Breadcrumbs } from "@/components/product/breadcrumbs";
import { CoverPlaceholder } from "@/components/product/cover-placeholder";
import { AccessBadge } from "@/components/ui/badge";
import { QualityStandardList } from "@/components/product/quality-standard-list";
import { WaitlistForm } from "@/components/product/waitlist-form";
import { GuideCard } from "@/components/content/guide-card";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await getBundleBySlug(slug);
  if (!bundle) return {};
  const title = bundle.seo_title ?? bundle.name;
  const description = bundle.seo_description ?? bundle.short_description;
  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(`/bundles/${slug}`) },
    openGraph: { title, description, type: "website" },
  };
}

export default async function BundlePage({ params }: Props) {
  const { slug } = await params;
  const bundle = await getBundleBySlug(slug);
  if (!bundle) notFound();

  const [guides] = await Promise.all([getAllGuides()]);
  const relatedGuide = guides.find((g) => g.relatedProducts?.includes(bundle.slug));

  const itemPrices = bundle.bundle_items.map((item) => item.product.price_minor ?? 0);
  const saving = calculateBundleSaving(itemPrices, bundle.price_minor ?? 0);

  const waitlistLabel = `Join the waitlist for ${formatMinorUnits(bundle.price_minor ?? 0, bundle.currency_code)}`;

  const path = `/bundles/${slug}`;
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Bundles", path: "/bundles" },
    { name: bundle.name, path },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <JsonLd data={productJsonLd(bundle, path)} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />

      <Breadcrumbs items={breadcrumbItems.map((b) => ({ name: b.name, href: b.path }))} />

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-10">
          <div>
            <AccessBadge state="paid" />
            <h1 className="mt-3 font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">{bundle.name}</h1>
            {bundle.outcome_statement ? <p className="mt-3 text-lg text-ink-700">{bundle.outcome_statement}</p> : null}
            <p className="mt-2 text-ink-500">{bundle.short_description}</p>
          </div>

          <CoverPlaceholder name={bundle.name} productType="bundle" className="max-w-xl" />

          {bundle.full_description ? (
            <div>
              <h2 className="text-lg font-semibold text-ink-900">About this bundle</h2>
              <p className="mt-2 text-ink-700">{bundle.full_description}</p>
            </div>
          ) : null}

          <div>
            <h2 className="text-lg font-semibold text-ink-900">What&apos;s included, in recommended order</h2>
            <ol className="mt-3 space-y-3">
              {bundle.bundle_items
                .slice()
                .sort((a, b) => a.display_order - b.display_order)
                .map((item, index) => (
                  <li key={item.product.id} className="flex items-start gap-3 rounded-md border border-ink-200 bg-paper-raised p-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-900">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-ink-900">{item.product.name}</p>
                      <p className="text-sm text-ink-500">{item.product.short_description}</p>
                    </div>
                  </li>
                ))}
            </ol>
          </div>

          {bundle.when_to_use || bundle.when_not_to_use ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {bundle.when_to_use ? (
                <div>
                  <h2 className="text-base font-semibold text-ink-900">When to use it</h2>
                  <p className="mt-2 text-sm text-ink-700">{bundle.when_to_use}</p>
                </div>
              ) : null}
              {bundle.when_not_to_use ? (
                <div>
                  <h2 className="text-base font-semibold text-ink-900">When not to use it</h2>
                  <p className="mt-2 text-sm text-ink-700">{bundle.when_not_to_use}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          <QualityStandardList qualityStandard={bundle.quality_standard} />

          {bundle.licence ? (
            <div>
              <h2 className="text-lg font-semibold text-ink-900">Licence</h2>
              <p className="mt-2 text-sm text-ink-700">{bundle.licence.summary}</p>
              <p className="mt-1 text-xs text-ink-500">
                <Link href="/legal/licences" className="underline hover:text-ink-900">
                  Read the full licence terms
                </Link>
              </p>
            </div>
          ) : null}

          {relatedGuide ? (
            <div>
              <h2 className="text-lg font-semibold text-ink-900">Related guide</h2>
              <div className="mt-3 max-w-sm">
                <GuideCard guide={relatedGuide} />
              </div>
            </div>
          ) : null}
        </div>

        <aside className="h-fit space-y-4 rounded-md border border-ink-200 bg-paper-raised p-6">
          <div>
            <p className="text-2xl font-semibold text-ink-900">
              {formatMinorUnits(bundle.price_minor ?? 0, bundle.currency_code)}
            </p>
            {saving.hasSaving ? (
              <p className="mt-1 text-sm text-brand-700">
                Save {formatMinorUnits(saving.savingMinor, bundle.currency_code)} ({Math.round(saving.savingPercent * 100)}%)
                versus buying each template separately (
                {formatMinorUnits(saving.combinedPriceMinor, bundle.currency_code)} combined).
              </p>
            ) : null}
            <p className="mt-2 text-sm text-ink-500">
              Checkout isn&apos;t live yet — join the waitlist and we&apos;ll email you the moment it is.
            </p>
          </div>
          <WaitlistForm productId={bundle.id} label={waitlistLabel} source="bundle-page" />
        </aside>
      </div>
    </div>
  );
}
