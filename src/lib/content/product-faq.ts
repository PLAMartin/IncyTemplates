import type { Product } from "@/types/catalogue";

export type ProductFaqEntry = { question: string; answer: string };

/**
 * The data model (spec §14) has no per-product FAQ field — FAQ content
 * would come from an admin-authored field that doesn't exist yet. Rather
 * than fabricate specific questions and answers, this derives a short, wholly
 * accurate set of questions from fields that genuinely exist on the product
 * (licence, formats, access type) so the FAQ section is real content, not
 * placeholder or invented copy. This intentionally does not answer
 * commerce/refund specifics beyond pointing at the (not-yet-approved) legal
 * pages, since no refund policy is approved yet — see the legal pages'
 * "pending legal review" heading.
 */
export function buildProductFaq(product: Product): ProductFaqEntry[] {
  const entries: ProductFaqEntry[] = [];

  entries.push({
    question: "What formats are included?",
    answer:
      product.formats.length > 0
        ? `This template is provided as ${formatList(product.formats)}.`
        : "Formats for this template haven't been confirmed yet.",
  });

  if (product.licence) {
    entries.push({
      question: "What can I do with this template once I have it?",
      answer: [
        product.licence.commercial_use_allowed ? "Commercial use is allowed." : "Commercial use is not included in this licence.",
        product.licence.client_work_allowed ? "Use on client work is allowed." : "Use on client work is not included in this licence.",
        product.licence.redistribution_allowed
          ? "Redistribution of the template itself is allowed."
          : "Redistributing or reselling the template itself is not allowed.",
      ].join(" "),
    });
  }

  entries.push({
    question: product.access_type === "free" ? "Is this really free?" : "What happens after I buy this?",
    answer:
      product.access_type === "free"
        ? "Yes — this is a free template. Checkout and instant downloads are being built; join the waitlist above and we'll email you the moment it's ready."
        : "Checkout isn't live yet. Join the waitlist above with your email and we'll notify you the moment you can buy and download it.",
  });

  entries.push({
    question: "What's the refund policy?",
    answer:
      "Our refund policy is still pending legal review and isn't approved for launch yet — see the refund policy page for the current status.",
  });

  return entries;
}

function formatList(formats: string[]): string {
  const labels = formats.map((f) => (f === "pdf" ? "PDF" : f === "markdown" ? "Markdown" : f));
  if (labels.length === 1) return labels[0]!;
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}
