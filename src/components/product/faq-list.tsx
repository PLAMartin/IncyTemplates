import type { ProductFaqEntry } from "@/lib/content/product-faq";

/** Native `<details>`/`<summary>` disclosures — accessible by default, no JS required. */
export function FaqList({ entries }: { entries: ProductFaqEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <div>
      <h2 className="text-lg font-semibold text-ink-900">Frequently asked questions</h2>
      <dl className="mt-3 divide-y divide-ink-200 border-y border-ink-200">
        {entries.map((entry) => (
          <details key={entry.question} className="group py-3">
            <summary className="cursor-pointer list-none text-sm font-medium text-ink-900 marker:content-none">
              <span className="flex items-center justify-between gap-2">
                {entry.question}
                <span aria-hidden className="text-ink-500 group-open:rotate-45">+</span>
              </span>
            </summary>
            <dd className="mt-2 text-sm text-ink-500">{entry.answer}</dd>
          </details>
        ))}
      </dl>
    </div>
  );
}
