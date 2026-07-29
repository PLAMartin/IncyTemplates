import Link from "next/link";

/**
 * Real, crawlable pagination — plain `<Link>`s with `?page=N` query params
 * baked in, not JS-only "load more" buttons (spec §10.2: "Pagination or
 * crawlable page-based navigation").
 */
export function Pagination({
  basePath,
  searchParams,
  page,
  pageSize,
  total,
}: {
  basePath: string;
  searchParams: URLSearchParams;
  page: number;
  pageSize: number;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  function hrefFor(targetPage: number): string {
    const params = new URLSearchParams(searchParams.toString());
    if (targetPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(targetPage));
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <nav aria-label="Catalogue pagination" className="flex items-center justify-center gap-2 pt-4">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className="min-h-11 rounded-md border border-ink-200 px-3 py-2 text-sm hover:bg-ink-100">
          Previous
        </Link>
      ) : (
        <span aria-hidden className="min-h-11 rounded-md border border-ink-100 px-3 py-2 text-sm text-ink-300">
          Previous
        </span>
      )}
      <span className="px-2 text-sm text-ink-700" aria-current="page">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className="min-h-11 rounded-md border border-ink-200 px-3 py-2 text-sm hover:bg-ink-100">
          Next
        </Link>
      ) : (
        <span aria-hidden className="min-h-11 rounded-md border border-ink-100 px-3 py-2 text-sm text-ink-300">
          Next
        </span>
      )}
    </nav>
  );
}
