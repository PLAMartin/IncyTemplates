import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { canonicalUrl } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: "The Proven–Better–New method",
  description:
    "How the Proven–Better–New method classifies an idea so you know how much evidence you need before you commit to it.",
  alternates: { canonical: canonicalUrl("/methods/proven-better-new") },
};

export default function ProvenBetterNewPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">The Proven–Better–New method</h1>
      <p className="mt-4 text-lg text-ink-700">
        Every idea needs evidence before you commit real time or money to it — but not the same amount. The
        Proven–Better–New method is how we classify an idea before deciding how hard to push on validating it, and
        it runs through the Proven–Better–New Assessment template and both of our idea-validation bundles.
      </p>

      <div className="guide-prose mt-10">
        <h2>Proven</h2>
        <p>
          A Proven idea applies a model that already demonstrably works — somewhere, for someone — to a new context:
          a new geography, a new niche, a new customer segment. The core mechanism isn&apos;t in question; what&apos;s
          untested is whether it transfers to your specific situation. A subscription box model that works well in
          the US, applied to a new category in the UK, is Proven. A booking system for a type of service that
          already books appointments online everywhere except your target industry is Proven.
        </p>
        <p>
          Proven ideas need the least validation, but &ldquo;least&rdquo; doesn&apos;t mean none. You still need to
          confirm the specific transfer holds: that your target customers behave similarly to the customers the
          model already works for, and that nothing about your context breaks the mechanism. A handful of
          conversations confirming local fit is often enough.
        </p>

        <h2>Better</h2>
        <p>
          A Better idea takes an existing, working approach and improves on a specific, articulable weakness — it&apos;s
          faster, cheaper, simpler, or removes a known point of friction, but the underlying customer behaviour is
          already established. People already do the thing your product helps them do; you&apos;re proposing a better
          way to do it, not a new behaviour altogether.
        </p>
        <p>
          Better ideas need evidence on two fronts: that the weakness you&apos;ve identified in the existing approach is
          real and painful (not just annoying to you personally), and that your specific improvement actually
          resolves it for people who aren&apos;t you. It&apos;s common to be right about the weakness and wrong about
          whether your fix is the one people actually want — so test both separately if you can.
        </p>

        <h2>New</h2>
        <p>
          A New idea asks people to adopt a genuinely new behaviour — not a better version of something they already
          do, but something they don&apos;t currently do at all, even in a clumsy or manual form. This is the highest-risk
          category, and it&apos;s also the one founders most often misclassify as Better because the discomfort of
          admitting &ldquo;nobody is currently doing this, even badly&rdquo; is real.
        </p>
        <p>
          The single most useful test for a New idea is to go looking for the manual, ugly, ad hoc version of the
          behaviour you&apos;re proposing. If people are already cobbling together spreadsheets, WhatsApp groups or
          paper processes to approximate what your product would do, that&apos;s a strong signal the underlying need is
          real, even though no polished solution exists yet. If you can&apos;t find any trace of people trying to solve
          this problem for themselves, that&apos;s important information too — it doesn&apos;t mean the idea is wrong, but it
          does mean you need considerably more evidence before committing serious time to it.
        </p>

        <h2>Using the classification</h2>
        <p>
          The point of classifying isn&apos;t to file your idea into a category and move on — it&apos;s to calibrate how much
          scepticism to apply to yourself before you commit. Proven ideas can move quickly with light validation.
          Better ideas need you to confirm both the problem and your specific fix. New ideas deserve real, patient
          evidence-gathering before significant investment, because the base rate of &ldquo;asking people to do
          something new&rdquo; actually working out is lower than founders like to believe.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/templates/proven-better-new-assessment">Try the free assessment</ButtonLink>
        <Link
          href="/bundles/idea-validation-pack"
          className="inline-flex min-h-11 items-center rounded-md border border-ink-200 px-4 text-sm font-medium text-ink-900 hover:bg-ink-100"
        >
          See the Idea Validation Pack
        </Link>
      </div>
    </div>
  );
}
