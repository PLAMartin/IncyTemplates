import type { Metadata } from "next";
import { getAllGuides } from "@/lib/mdx/guides";
import { GuideCard } from "@/components/content/guide-card";
import { canonicalUrl } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: "Guides",
  description: "Practical guides on evaluating ideas, running customer research and defining products.",
  alternates: { canonical: canonicalUrl("/guides") },
};

export default async function GuidesPage() {
  const guides = await getAllGuides();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-ink-900">Guides</h1>
        <p className="mt-2 max-w-2xl text-ink-500">
          Practical, specific writing on evaluating ideas, running customer research and defining products — the
          thinking behind the templates, not just the templates themselves.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <GuideCard key={guide.slug} guide={guide} />
        ))}
      </div>
    </div>
  );
}
