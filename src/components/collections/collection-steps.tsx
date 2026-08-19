import Link from "next/link";
import type { Collection } from "@/types/catalogue";

/**
 * The five-step "Start a Product" journey (spec v9 §3.4/§10.1) — one connected system, not a
 * grid of unrelated cards. Used on the homepage, `/products` and the Collection page itself so
 * the visual language stays identical everywhere a visitor meets it.
 */
export function CollectionSteps({ collection, className }: { collection: Collection; className?: string }) {
  const members = [...collection.members].sort((a, b) => a.stepOrder - b.stepOrder);

  return (
    <ol className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 ${className ?? ""}`}>
      {members.map((member, index) => (
        <li key={member.framework.slug} className="flex flex-col">
          <Link
            href={`/products/${member.framework.slug}`}
            className="group flex h-full flex-col gap-2 rounded-md border border-ink-200 bg-paper-raised p-4 transition-colors hover:border-brand-500 focus-visible:outline-2 focus-visible:outline-focus-ring"
          >
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {member.stepOrder}
            </span>
            <h3 className="text-sm font-semibold text-ink-900 group-hover:text-brand-700">{member.stepLabel}</h3>
            <p className="text-xs font-medium text-ink-500">{member.framework.name}</p>
            <p className="mt-auto text-xs text-ink-500">{member.framework.short_description}</p>
          </Link>
          {index < members.length - 1 && member.transitionCopy ? (
            <p className="mt-2 hidden text-center text-xs text-ink-400 lg:block" aria-hidden>
              ↓ {member.transitionCopy}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/** Compact inline version for a family page's "Part of Start a Product" context badge. */
export function CollectionStepBadge({ collection, frameworkSlug }: { collection: Collection; frameworkSlug: string }) {
  const member = collection.members.find((m) => m.framework.slug === frameworkSlug);
  if (!member) return null;
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="inline-flex items-center gap-2 rounded-full border border-brand-500 bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-500 hover:text-white"
    >
      {collection.name} · Step {member.stepOrder} of {collection.members.length}
    </Link>
  );
}
