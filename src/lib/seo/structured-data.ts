import { company, site } from "@/config/site";
import { canonicalUrl } from "./canonical";
import type { Guide, Product } from "@/types/catalogue";

/**
 * JSON-LD structured-data builders (spec §26.2/26.3). No fabricated
 * ratings/reviews are added anywhere in this file, per spec §26.3's
 * explicit instruction. Consumers render the return value inside
 * `<script type="application/ld+json">{JSON.stringify(...)}</script>`.
 */

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.tradingName,
    legalName: company.legalName,
    url: site.url,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${site.url}/templates?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

/**
 * Availability is deliberately `PreOrder` rather than `InStock`: this phase
 * has no working checkout or free-download flow (Phase 2/3 of the spec),
 * so every product/bundle page shows a waitlist CTA, not an immediate
 * purchase or download. `InStock` would overstate what a visitor can
 * actually do today.
 */
export function productJsonLd(product: Product, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description,
    sku: product.id,
    brand: { "@type": "Brand", name: site.name },
    url: canonicalUrl(path),
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency_code,
      price: ((product.price_minor ?? 0) / 100).toFixed(2),
      availability: "https://schema.org/PreOrder",
      url: canonicalUrl(path),
    },
  };
}

export function articleJsonLd(guide: Guide, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.summary,
    author: { "@type": "Person", name: guide.author },
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    url: canonicalUrl(path),
  };
}

export type FaqQuestion = { question: string; answer: string };

export function faqJsonLd(questions: FaqQuestion[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };
}
