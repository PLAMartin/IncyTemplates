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
          {site.name} is operated by {company.legalName}, based in the {company.country}. We build practical
          product families for founders and small product teams — each one a reusable method with up to three
          ways to use it: a Guide to learn how, a Template to do it yourself, and a Tool to do it interactively.
        </p>
        <p>
          Most resource libraries optimise for volume: hundreds of generic documents that look comprehensive but
          rarely lead anywhere. We take the opposite approach. Every product family is built around a single idea
          from our product principles: it should distinguish assumptions from evidence, include at least one worked
          example, and end in a decision or a next action — not just a filled form.
        </p>
        <p>
          We&apos;re early. What you see today is a first, honest version of the product — one fully built product
          family (Product Idea Assessor), several more in development, and free and paid templates from the
          previous version of the catalogue still available underneath. Where content is still placeholder or
          pending approval, we say so directly rather than pretending it&apos;s finished.
        </p>
        <h2>What we believe</h2>
        <ul>
          <li>Outcome before format — browse by the task you&apos;re trying to complete, not the file type.</li>
          <li>Framework before output — a reusable method comes before the Guide, Template or Tool built on it.</li>
          <li>Evidence before confidence — separate what you know from what you&apos;re assuming.</li>
          <li>No dark patterns — pricing, access and email consent are always clear and separate.</li>
        </ul>
        <h2 id="source">Where this comes from</h2>
        <p>
          Some product families here start life as ideas and practical experience written up on A Bit Gamey, an
          independent newsletter. We don&apos;t republish that writing as-is — a family only exists once the
          underlying method has been distilled, tested and turned into something genuinely reusable, with an
          honest note on the source where one materially shaped the result. Not every product family has an A Bit
          Gamey origin, and we don&apos;t pretend otherwise for the ones that don&apos;t.
        </p>
      </div>
    </div>
  );
}
