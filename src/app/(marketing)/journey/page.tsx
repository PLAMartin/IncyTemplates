import type { Metadata } from "next";
import Link from "next/link";
import { getStages } from "@/server/queries";
import { canonicalUrl } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: "The product journey",
  description: "Idea, Validate, Decide, Design, Build, Launch, Improve — find product families for wherever you are.",
  alternates: { canonical: canonicalUrl("/journey") },
};

export default async function JourneyIndexPage() {
  const stages = await getStages();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-ink-900">The product journey</h1>
        <p className="mt-2 max-w-2xl text-ink-500">
          Start from the task you&apos;re facing, not the format of the answer. These stages are a navigational aid,
          not a rigid process — jump in wherever you are.
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stages.map((stage) => (
          <li key={stage.slug}>
            <Link
              href={`/journey/${stage.slug}`}
              className="block rounded-md border border-ink-200 bg-paper-raised p-4 hover:border-brand-500 focus-visible:outline-2 focus-visible:outline-focus-ring"
            >
              <h2 className="font-semibold text-ink-900">{stage.name}</h2>
              {stage.description ? <p className="mt-1 text-sm text-ink-500">{stage.description}</p> : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
