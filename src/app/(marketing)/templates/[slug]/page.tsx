import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFeaturedBundle, getProductBySlug, getRelatedProducts } from "@/server/queries";
import { canonicalUrl } from "@/lib/seo/canonical";
import { productJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/structured-data";
import { buildProductFaq } from "@/lib/content/product-faq";
import { formatMinorUnits } from "@/lib/money/bundle-savings";
import { JsonLd } from "@/components/content/json-ld";
import { Breadcrumbs } from "@/components/product/breadcrumbs";
import { CoverPlaceholder } from "@/components/product/cover-placeholder";
import { AccessBadge } from "@/components/ui/badge";
import { QualityStandardList } from "@/components/product/quality-standard-list";
import { FaqList } from "@/components/product/faq-list";
import { WaitlistForm } from "@/components/product/waitlist-form";
import { ProductCard } from "@/components/catalogue/product-card";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const title = product.seo_title ?? product.name;
  const description = product.seo_description ?? product.short_description;
  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(`/templates/${slug}`) },
    openGraph: { title, description, type: "website" },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, featuredBundle] = await Promise.all([
    getRelatedProducts(product.id, 4),
    getFeaturedBundle(),
  ]);

  const bundleUpgrade =
    featuredBundle && featuredBundle.categories.some((c) => product.categories.some((pc) => pc.slug === c.slug))
      ? featuredBundle
      : null;

  const faqEntries = buildProductFaq(product);
  const exampleFile = product.files.find((f) => f.file_role === "example");
  const instructionsFile = product.files.find((f) => f.file_role === "instructions" || f.file_role === "facilitator_guide");

  const waitlistLabel =
    product.access_type === "free"
      ? "Notify me when this launches free"
      : `Join the waitlist for ${formatMinorUnits(product.price_minor ?? 0, product.currency_code)}`;

  const path = `/templates/${slug}`;
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Templates", path: "/templates" },
    { name: product.name, path },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <JsonLd data={productJsonLd(product, path)} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />
      {faqEntries.length > 0 ? <JsonLd data={faqJsonLd(faqEntries.map((e) => ({ question: e.question, answer: e.answer })))} /> : null}

      <Breadcrumbs items={breadcrumbItems.map((b) => ({ name: b.name, href: b.path }))} />

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-10">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <AccessBadge state={product.access_type === "free" ? "free" : "paid"} />
              {product.skill_level ? <span className="text-xs text-ink-500">Skill level: {product.skill_level}</span> : null}
            </div>
            <h1 className="mt-3 font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">{product.name}</h1>
            {product.outcome_statement ? (
              <p className="mt-3 text-lg text-ink-700">{product.outcome_statement}</p>
            ) : null}
            <p className="mt-2 text-ink-500">{product.short_description}</p>
          </div>

          <CoverPlaceholder name={product.name} productType={product.product_type} className="max-w-xl" />

          <dl className="grid grid-cols-2 gap-4 rounded-md border border-ink-200 bg-paper-raised p-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-ink-500">Version</dt>
              <dd className="font-medium text-ink-900">{product.current_version ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Last updated</dt>
              <dd className="font-medium text-ink-900">
                {product.published_at ? new Date(product.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-ink-500">Completion time</dt>
              <dd className="font-medium text-ink-900">
                {product.completion_minutes_min ? `${product.completion_minutes_min}–${product.completion_minutes_max} min` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-ink-500">Formats</dt>
              <dd className="font-medium text-ink-900">{product.formats.join(", ") || "—"}</dd>
            </div>
          </dl>

          {product.full_description ? (
            <div>
              <h2 className="text-lg font-semibold text-ink-900">About this template</h2>
              <p className="mt-2 text-ink-700">{product.full_description}</p>
            </div>
          ) : null}

          {product.target_audience ? (
            <div>
              <h2 className="text-lg font-semibold text-ink-900">Who it&apos;s for</h2>
              <p className="mt-2 text-ink-700">{product.target_audience}</p>
            </div>
          ) : null}

          {(product.when_to_use || product.when_not_to_use) ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {product.when_to_use ? (
                <div>
                  <h2 className="text-base font-semibold text-ink-900">When to use it</h2>
                  <p className="mt-2 text-sm text-ink-700">{product.when_to_use}</p>
                </div>
              ) : null}
              {product.when_not_to_use ? (
                <div>
                  <h2 className="text-base font-semibold text-ink-900">When not to use it</h2>
                  <p className="mt-2 text-sm text-ink-700">{product.when_not_to_use}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          {product.files.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold text-ink-900">What&apos;s included</h2>
              <ul className="mt-2 space-y-1">
                {product.files.map((file) => (
                  <li key={file.id} className="text-sm text-ink-700">
                    {file.display_name} <span className="text-ink-500">({file.file_format})</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <h2 className="text-lg font-semibold text-ink-900">Preview</h2>
            <p className="mt-2 text-sm text-ink-500">
              Preview images aren&apos;t available yet for this template — the placeholder cover above stands in until
              real previews are added.
            </p>
          </div>

          {exampleFile ? (
            <div>
              <h2 className="text-lg font-semibold text-ink-900">Completed example</h2>
              <p className="mt-2 text-sm text-ink-700">
                Includes a completed example (&ldquo;{exampleFile.display_name}&rdquo;) so you can see what a finished
                version looks like before you start.
              </p>
            </div>
          ) : null}

          {instructionsFile ? (
            <div>
              <h2 className="text-lg font-semibold text-ink-900">Step-by-step instructions</h2>
              <p className="mt-2 text-sm text-ink-700">
                Written instructions are included (&ldquo;{instructionsFile.display_name}&rdquo;) to walk you through
                each step.
              </p>
            </div>
          ) : null}

          <QualityStandardList qualityStandard={product.quality_standard} />

          {product.licence ? (
            <div>
              <h2 className="text-lg font-semibold text-ink-900">Licence</h2>
              <p className="mt-2 text-sm text-ink-700">{product.licence.summary}</p>
              <p className="mt-1 text-xs text-ink-500">
                <a href="/legal/licences" className="underline hover:text-ink-900">
                  Read the full licence terms
                </a>
              </p>
            </div>
          ) : null}

          <FaqList entries={faqEntries} />

          {bundleUpgrade ? (
            <div className="rounded-md border border-amber-500 bg-amber-100 p-4">
              <p className="text-sm font-medium text-amber-700">
                This template is also included in the {bundleUpgrade.name} bundle.
              </p>
              <a href={`/bundles/${bundleUpgrade.slug}`} className="mt-1 inline-block text-sm underline text-amber-700">
                See the bundle and save
              </a>
            </div>
          ) : null}

          {related.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold text-ink-900">Related templates</h2>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {related.map((r) => (
                  <ProductCard key={r.id} product={r} />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="h-fit space-y-4 rounded-md border border-ink-200 bg-paper-raised p-6">
          <div>
            <p className="text-2xl font-semibold text-ink-900">
              {product.access_type === "free" ? "Free" : formatMinorUnits(product.price_minor ?? 0, product.currency_code)}
            </p>
            <p className="mt-1 text-sm text-ink-500">
              Checkout isn&apos;t live yet — join the waitlist and we&apos;ll email you the moment it is.
            </p>
          </div>
          <WaitlistForm productId={product.id} label={waitlistLabel} source="product-page" />
        </aside>
      </div>
    </div>
  );
}
