import { ProductCard } from "@/components/catalogue/product-card";
import { CatalogueEmptyState } from "@/components/catalogue/empty-state";
import { Pagination } from "@/components/catalogue/pagination";
import type { CatalogueResult } from "@/types/catalogue";

/**
 * Shared result grid + pagination, reused by `/templates`, `/templates/free`,
 * `/templates/paid`, `/templates/formats/[format]`, `/templates/stages/[stage]`
 * and `/templates/categories/[category]` — each page handles its own
 * filters/metadata/canonical logic and passes the resulting `CatalogueResult`
 * in here so the actual grid markup exists in exactly one place.
 */
export function CatalogueListing({
  result,
  basePath,
  searchParams,
}: {
  result: CatalogueResult;
  basePath: string;
  searchParams: URLSearchParams;
}) {
  if (result.items.length === 0) {
    return <CatalogueEmptyState />;
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-500">
        {result.total} template{result.total === 1 ? "" : "s"}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Pagination
        basePath={basePath}
        searchParams={searchParams}
        page={result.page}
        pageSize={result.pageSize}
        total={result.total}
      />
    </div>
  );
}
