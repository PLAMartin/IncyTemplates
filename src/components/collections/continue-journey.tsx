"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { useCollectionProgress, type CollectionProgress } from "@/lib/progress/collection-progress";
import type { Collection } from "@/types/catalogue";

const OUTPUT_TYPE_LABEL: Record<CollectionProgress["last_output_type"], string> = {
  guide: "Guide",
  template: "Template",
  tool: "Tool",
};

/**
 * Spec v9 §9.3: "Show only when real local... progress exists" and "derived from real user
 * activity, not inferred/fabricated completion." Reads `localStorage` client-side only — there
 * is deliberately no server-rendered fallback, so this renders nothing until mount (a returning
 * visitor sees it appear a beat after paint, not a flash of wrong content or a hydration
 * mismatch). Always links to the family page (`/products/[slug]`), never a guessed exact
 * Guide/Template/Tool URL — a Template's slug doesn't match its framework's slug, so the only
 * link this component can construct correctly for every case is the family page, which lets the
 * visitor pick the right depth themselves.
 */
export function ContinueJourney({ collection }: { collection: Collection }) {
  // `useSyncExternalStore`'s server snapshot is always null (no localStorage server-side), so
  // the first client render matches SSR exactly (renders nothing) before "upgrading" to the
  // real value — no hydration mismatch, no manual useEffect/setState needed.
  const progress = useCollectionProgress();

  if (!progress || progress.collection_slug !== collection.slug) return null;

  const members = [...collection.members].sort((a, b) => a.stepOrder - b.stepOrder);
  const completed = new Set(progress.completed_framework_slugs);
  const completedMembers = members.filter((m) => completed.has(m.framework.slug));
  const lastCompleted = [...completedMembers].sort((a, b) => b.stepOrder - a.stepOrder)[0];
  const nextMember = lastCompleted ? members.find((m) => m.stepOrder === lastCompleted.stepOrder + 1) : undefined;

  if (lastCompleted && !nextMember) {
    return (
      <section className="rounded-md border border-brand-500 bg-brand-100 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Continue your product journey</p>
        <h2 className="mt-2 font-serif text-xl font-semibold text-ink-900">
          You&apos;ve worked through all five steps of {collection.name}.
        </h2>
        <p className="mt-2 text-sm text-ink-700">
          Revisit any step whenever the product changes, or come back to a saved run in your account.
        </p>
      </section>
    );
  }

  if (lastCompleted && nextMember) {
    return (
      <section className="rounded-md border border-brand-500 bg-brand-100 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Continue your product journey</p>
        <h2 className="mt-2 font-serif text-xl font-semibold text-ink-900">
          You completed {lastCompleted.stepLabel}. Next: {nextMember.stepLabel}.
        </h2>
        <ButtonLink href={`/products/${nextMember.framework.slug}`} className="mt-4">
          Continue: {nextMember.stepLabel}
        </ButtonLink>
      </section>
    );
  }

  const lastVisited = members.find((m) => m.framework.slug === progress.last_framework_slug);
  if (lastVisited) {
    return (
      <section className="rounded-md border border-ink-200 bg-paper-raised p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Continue where you left off</p>
        <h2 className="mt-2 font-serif text-xl font-semibold text-ink-900">
          {lastVisited.stepLabel} — {OUTPUT_TYPE_LABEL[progress.last_output_type]}
        </h2>
        <Link
          href={`/products/${lastVisited.framework.slug}`}
          className="mt-3 inline-block font-medium text-brand-600 hover:text-brand-700"
        >
          Continue with {lastVisited.framework.name}
        </Link>
      </section>
    );
  }

  return null;
}
