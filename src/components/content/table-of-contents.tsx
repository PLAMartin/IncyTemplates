import type { TocEntry } from "@/lib/mdx/toc";
import { cn } from "@/lib/utils/cn";

export function TableOfContents({ entries }: { entries: TocEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <nav aria-label="Table of contents" className="rounded-md border border-ink-200 bg-paper-raised p-4">
      <h2 className="text-sm font-semibold text-ink-900">On this page</h2>
      <ul className="mt-2 space-y-1">
        {entries.map((entry) => (
          <li key={entry.id} className={cn(entry.depth === 3 && "ml-3")}>
            <a href={`#${entry.id}`} className="text-sm text-ink-500 hover:text-brand-600">
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
