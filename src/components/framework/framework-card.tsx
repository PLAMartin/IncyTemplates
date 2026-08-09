import Link from "next/link";
import { AccessBadge } from "@/components/ui/badge";
import type { FrameworkTeaser } from "@/types/catalogue";

/**
 * Card for a product family (spec v3 §7.2/§10.2). Consumes the narrow `FrameworkTeaser`
 * shape, not the full `Framework` type — this is a deliberate structural guard: a listing
 * surface (homepage, /products, /journey/*) can only ever render fields that are safe to
 * show for a draft-flagship family (see `it_frameworks_teasers`), so it should be
 * structurally impossible to accidentally wire problem_statement/method_summary/
 * priority_rationale into a public card.
 */
export function FrameworkCard({ framework }: { framework: FrameworkTeaser }) {
  const isPublished = framework.status === "published";
  return (
    <Link
      href={`/products/${framework.slug}`}
      className="group flex flex-col gap-3 rounded-md border border-ink-200 bg-paper-raised p-4 transition-colors hover:border-brand-500 focus-visible:outline-2 focus-visible:outline-focus-ring"
    >
      <div className="flex items-center justify-between gap-2">
        <AccessBadge state={isPublished ? "free" : "coming-soon"} />
        {framework.journey_stage ? (
          <span className="text-xs font-medium text-ink-500">{framework.journey_stage.name}</span>
        ) : null}
      </div>
      <div>
        <h3 className="text-base font-semibold text-ink-900 group-hover:text-brand-700">{framework.name}</h3>
        <p className="mt-1 text-sm text-ink-500">{framework.short_description}</p>
      </div>
      {isPublished ? <p className="mt-auto text-sm font-medium text-ink-700">{framework.outcome_statement}</p> : null}
    </Link>
  );
}
