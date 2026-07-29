import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { canonicalUrl } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: "How it works",
  description: "How to find, use and get the most out of an Incy Templates template.",
  alternates: { canonical: canonicalUrl("/how-it-works") },
};

const STEPS = [
  {
    title: "1. Choose",
    body: "Start from the decision you're facing — browse by journey stage or category, or search by keyword — rather than hunting for a specific file format. Every template's page tells you who it's for, what it produces, and roughly how long it takes.",
  },
  {
    title: "2. Complete",
    body: "Each template comes with plain-English instructions and, for anything non-trivial, a completed example so you can see what 'done' looks like before you start. Suitable templates also include a Markdown edition built specifically for use with AI agents.",
  },
  {
    title: "3. Decide",
    body: "A good template doesn't just get filled in — it leads somewhere. Templates that support a decision (like the Proven–Better–New Assessment) are structured to end in a stated conclusion, not just a completed worksheet.",
  },
  {
    title: "4. Continue",
    body: "Related templates and guides are linked from every page, so the natural next step — the next template for your next decision — is never more than a click away.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">How it works</h1>
      <p className="mt-4 text-lg text-ink-700">
        Four steps, from finding the right template to acting on what it tells you.
      </p>
      <div className="mt-10 space-y-8">
        {STEPS.map((step) => (
          <div key={step.title}>
            <h2 className="text-lg font-semibold text-ink-900">{step.title}</h2>
            <p className="mt-2 text-ink-700">{step.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <ButtonLink href="/templates">Browse templates</ButtonLink>
      </div>
    </div>
  );
}
