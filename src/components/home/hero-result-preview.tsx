/**
 * Homepage hero signature visual: a static, illustrative rendition of a real Product Idea
 * Assessor result (copy and badge colours match `ToolResultSummary`'s actual
 * `READINESS_COPY`/labels) rather than the generic `CoverPlaceholder` tiles used elsewhere
 * in the catalogue. Purely decorative — the real interactive result lives at
 * /tools/product-idea-assessor — so the whole thing is `aria-hidden` from its caller.
 */
export function HeroResultPreview() {
  return (
    <div className="relative">
      <div aria-hidden className="absolute -right-3 -top-3 h-full w-full rounded-lg border border-ink-200 bg-brand-100" />
      <div className="relative rounded-lg border border-ink-200 bg-paper-raised p-6 shadow-lg shadow-ink-900/5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Product Idea Assessor · Tool</p>
        <h2 className="mt-3 font-serif text-xl font-semibold text-ink-900">Your result: Improve</h2>
        <span className="mt-3 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
          Gather more evidence first
        </span>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm text-ink-500">
            <span>Evidence quality score</span>
            <span className="font-semibold text-ink-900">62/100</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-ink-100">
            <div className="h-2 rounded-full bg-brand-600" style={{ width: "62%" }} />
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-semibold text-ink-900">Strongest</dt>
            <dd className="mt-1 text-ink-500">Problem evidence</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-900">Weakest</dt>
            <dd className="mt-1 text-ink-500">Differentiation clarity</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
