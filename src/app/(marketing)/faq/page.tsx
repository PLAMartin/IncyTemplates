import type { Metadata } from "next";
import { company } from "@/config/site";
import { canonicalUrl } from "@/lib/seo/canonical";
import { faqJsonLd } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/content/json-ld";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Incy Templates.",
  alternates: { canonical: canonicalUrl("/faq") },
};

const QUESTIONS = [
  {
    question: "Are the free templates really free?",
    answer:
      "Yes. Every template marked \"Free\" has no price and doesn't require an account to access. We're still building the download flow, so right now you can join a waitlist and we'll email you as soon as it's ready.",
  },
  {
    question: "What formats do templates come in?",
    answer:
      "Most templates include a Markdown edition (readable as plain text and suitable for AI agents) and a PDF example. Some templates also offer Notion or spreadsheet formats — check the \"Included formats\" section on each product page.",
  },
  {
    question: "What does 'AI-agent-ready' mean?",
    answer:
      "It means the template includes a Markdown edition structured specifically so an AI coding or writing agent can work from it directly — with explicit sections for required inputs, information the agent must not invent, and acceptance criteria — rather than a document written only for a human reader.",
  },
  {
    question: "Can I use a purchased template for client work?",
    answer:
      "Under our Standard Personal & Commercial Use licence, yes — client work and commercial use are both allowed. Redistributing or reselling the template itself is not. See the licence terms page for the full detail once it's approved for launch.",
  },
  {
    question: "Is checkout available yet?",
    answer:
      "Not yet. This is a read-only preview of the catalogue while we build the purchase and download flow. Product and bundle pages show real prices and let you join a waitlist for when checkout goes live.",
  },
  {
    question: "Do I need an account to browse?",
    answer: "No. Browsing, searching and reading every template and guide on this site requires no account.",
  },
  {
    question: "What's the Copy–Improve–Differentiate method?",
    answer:
      "It's how we classify an idea — Copy, Improve or Differentiate — to work out how much evidence you need before committing to it. Read the full explanation in the Product Idea Assessor guide.",
  },
  {
    question: "How do I get in touch?",
    answer: `Email ${company.supportEmail} — see the contact page for details.`,
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={faqJsonLd(QUESTIONS)} />
      <h1 className="font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">Frequently asked questions</h1>
      <dl className="mt-8 divide-y divide-ink-200 border-y border-ink-200">
        {QUESTIONS.map((item) => (
          <div key={item.question} className="py-4">
            <dt className="font-semibold text-ink-900">{item.question}</dt>
            <dd className="mt-1 text-ink-700">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
