import type { Metadata } from "next";
import Link from "next/link";
import { getStages } from "@/server/queries";

export const metadata: Metadata = {
  title: "Journey stages",
  description: "Browse templates by the decision-making stage you've reached.",
};

export default async function StagesIndexPage() {
  const stages = await getStages();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-ink-900">Journey stages</h1>
        <p className="mt-2 max-w-2xl text-ink-500">Find templates for wherever you are in the decision-making journey.</p>
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stages.map((stage) => (
          <li key={stage.slug}>
            <Link
              href={`/templates/stages/${stage.slug}`}
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
