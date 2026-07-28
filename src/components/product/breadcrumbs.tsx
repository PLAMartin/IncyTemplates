import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbTrailItem = { name: string; href: string };

/** Visible breadcrumb trail. Pair with `breadcrumbJsonLd` for the structured-data equivalent. */
export function Breadcrumbs({ items }: { items: BreadcrumbTrailItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-ink-500">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1">
              {index > 0 ? <ChevronRight aria-hidden className="size-3.5" /> : null}
              {isLast ? (
                <span aria-current="page" className="font-medium text-ink-900">
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-ink-900">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
