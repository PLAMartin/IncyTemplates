import Link from "next/link";

export function CatalogueEmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-ink-200 py-16 text-center">
      <p className="text-base font-medium text-ink-900">No templates match those filters.</p>
      <p className="max-w-sm text-sm text-ink-500">
        Try removing a filter, searching a broader term, or browse the full catalogue instead.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link href="/templates" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          View all templates
        </Link>
        <Link href="/templates/free" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          Browse free templates
        </Link>
        <Link href="/guides" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          Read a guide instead
        </Link>
      </div>
    </div>
  );
}
