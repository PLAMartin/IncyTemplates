import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import { extractToc } from "@/lib/mdx/toc";
import {
  getAllGuides,
  getBundleBySlug,
  getFrameworkBySlug,
  getFrameworkOutputs,
  getGuideBySlug,
  getProductBySlug,
  getActiveCoreCollection,
} from "@/server/queries";
import { canonicalUrl } from "@/lib/seo/canonical";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/content/json-ld";
import { Breadcrumbs } from "@/components/product/breadcrumbs";
import { TableOfContents } from "@/components/content/table-of-contents";
import { ProductCard } from "@/components/catalogue/product-card";
import { GuideCard } from "@/components/content/guide-card";
import { RecordProgressVisit } from "@/components/collections/record-progress";
import { TrackedClick } from "@/components/analytics/tracked-click";
import type { ProductSummary } from "@/types/catalogue";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const guides = await getAllGuides();
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return {};
  const title = guide.seoTitle ?? guide.title;
  const description = guide.seoDescription ?? guide.summary;
  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(`/guides/${slug}`) },
    openGraph: { title, description, type: "article", publishedTime: guide.publishedAt, modifiedTime: guide.updatedAt },
  };
}

async function resolveRelatedProduct(slug: string): Promise<ProductSummary | null> {
  const product = await getProductBySlug(slug);
  if (product) return product;
  const bundle = await getBundleBySlug(slug);
  return bundle;
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const allGuides = await getAllGuides();
  const currentIndex = allGuides.findIndex((g) => g.slug === guide.slug);
  const nextGuide = currentIndex >= 0 ? allGuides[(currentIndex + 1) % allGuides.length] : undefined;

  const relatedSlugs = guide.relatedProducts ?? [];
  const relatedProducts = (await Promise.all(relatedSlugs.map(resolveRelatedProduct))).filter(
    (p): p is ProductSummary => Boolean(p),
  );

  const framework = guide.frameworkSlug ? await getFrameworkBySlug(guide.frameworkSlug) : null;
  const sameFamilyOutputs = framework ? (await getFrameworkOutputs(framework.id)).filter((o) => o.slug !== guide.slug) : [];

  const coreCollection = framework ? await getActiveCoreCollection() : null;
  const isCoreFamily = Boolean(coreCollection?.members.some((m) => m.framework.slug === framework?.slug));

  const toc = extractToc(guide.content);

  const path = `/guides/${slug}`;
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: guide.title, path },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <JsonLd data={articleJsonLd(guide, path)} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />

      <Breadcrumbs items={breadcrumbItems.map((b) => ({ name: b.name, href: b.path }))} />

      {isCoreFamily && coreCollection && framework ? (
        <RecordProgressVisit collectionSlug={coreCollection.slug} frameworkSlug={framework.slug} outputType="guide" />
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[3fr_1fr]">
        <article>
          <header className="mb-8">
            <h1 className="font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">{guide.title}</h1>
            <p className="mt-3 text-lg text-ink-700">{guide.summary}</p>
            <p className="mt-3 text-sm text-ink-500">
              By {guide.author} · Published{" "}
              {new Date(guide.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              {guide.updatedAt !== guide.publishedAt
                ? ` · Updated ${new Date(guide.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`
                : ""}{" "}
              · {guide.readingTimeMinutes} min read
            </p>
            {framework ? (
              <p className="mt-3 text-sm text-ink-500">
                Part of the{" "}
                <Link href={`/products/${framework.slug}`} className="font-medium text-brand-600 underline hover:text-brand-700">
                  {framework.name}
                </Link>{" "}
                family.
              </p>
            ) : null}
          </header>

          <div className="mb-8 lg:hidden">
            <TableOfContents entries={toc} />
          </div>

          <div className="guide-prose">
            <MDXRemote source={guide.content} options={{ mdxOptions: { rehypePlugins: [rehypeSlug] } }} />
          </div>

          {sameFamilyOutputs.length > 0 ? (
            <div className="mt-12 rounded-md border border-ink-200 bg-paper-raised p-6">
              <h2 className="text-lg font-semibold text-ink-900">Ready to apply this?</h2>
              <p className="mt-1 text-sm text-ink-500">Same family, different depth — pick whichever fits what you need right now.</p>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {sameFamilyOutputs.map((output) =>
                  output.product_type === "template" || output.product_type === "tool" ? (
                    <TrackedClick
                      key={output.id}
                      event={output.product_type === "template" ? "click_guide_to_template" : "click_guide_to_tool"}
                      properties={{ framework_slug: framework?.slug, product_slug: output.slug }}
                    >
                      <ProductCard product={output} />
                    </TrackedClick>
                  ) : (
                    <ProductCard key={output.id} product={output} />
                  ),
                )}
              </div>
            </div>
          ) : null}

          {relatedProducts.length > 0 ? (
            <div className="mt-12">
              <h2 className="text-lg font-semibold text-ink-900">Relevant templates</h2>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {relatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ) : null}

          {nextGuide && nextGuide.slug !== guide.slug ? (
            <div className="mt-12">
              <h2 className="text-lg font-semibold text-ink-900">Read next</h2>
              <div className="mt-3 max-w-sm">
                <GuideCard guide={nextGuide} />
              </div>
            </div>
          ) : null}

          <p className="mt-12 text-sm text-ink-500">
            Written by {guide.author}. <Link href="/about" className="underline hover:text-ink-900">More about Incy Templates.</Link>
          </p>
        </article>

        <div className="hidden lg:block">
          <div className="sticky top-6">
            <TableOfContents entries={toc} />
          </div>
        </div>
      </div>
    </div>
  );
}
