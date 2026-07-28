import type { Metadata } from "next";
import { company, site } from "@/config/site";
import { canonicalUrl } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.name} and ${company.legalName}.`,
  alternates: { canonical: canonicalUrl("/about") },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">About {site.name}</h1>
      <div className="guide-prose mt-6">
        <p>
          {site.name} is operated by {company.legalName}, based in the {company.country}. We make practical,
          field-tested templates that help founders and small product teams make their next important decision —
          not just fill in a document.
        </p>
        <p>
          Most template libraries optimise for volume: hundreds of generic documents that look comprehensive but
          rarely lead anywhere. We take the opposite approach. Every template on this site is built around a single
          idea from our product principles: a template should distinguish assumptions from evidence, include at
          least one completed example where it matters, and end in a decision or a next action — not just a filled
          form.
        </p>
        <p>
          We&apos;re early. The catalogue you see today is a first, honest version of the product — free and paid
          templates, organised by the decision-making stage they support, with more depth (guided completion, AI
          assistance, a proper customer library) planned for later phases. Where content on this site is still
          placeholder or pending approval, we say so directly rather than pretending it&apos;s finished.
        </p>
        <h2>What we believe</h2>
        <ul>
          <li>Outcome before format — browse by the decision you need to make, not the file type.</li>
          <li>Fewer, better templates — each one should solve a clear problem to a defined standard.</li>
          <li>Evidence before confidence — separate what you know from what you&apos;re assuming.</li>
          <li>No dark patterns — pricing, access and email consent are always clear and separate.</li>
        </ul>
      </div>
    </div>
  );
}
