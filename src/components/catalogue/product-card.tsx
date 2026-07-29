import Link from "next/link";
import { CoverPlaceholder } from "@/components/product/cover-placeholder";
import { AccessBadge } from "@/components/ui/badge";
import { formatMinorUnits } from "@/lib/money/bundle-savings";
import type { ProductSummary } from "@/types/catalogue";

export function productHref(product: Pick<ProductSummary, "product_type" | "slug">): string {
  return product.product_type === "bundle" ? `/bundles/${product.slug}` : `/templates/${product.slug}`;
}

export function ProductCard({ product }: { product: ProductSummary }) {
  const href = productHref(product);
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-md border border-ink-200 bg-paper-raised p-3 transition-colors hover:border-brand-500 focus-visible:outline-2 focus-visible:outline-focus-ring"
    >
      <CoverPlaceholder name={product.name} productType={product.product_type} />
      <div className="flex items-center justify-between gap-2">
        <AccessBadge state={product.access_type === "free" ? "free" : "paid"} />
        {product.product_type === "bundle" ? (
          <span className="text-xs font-medium text-ink-500">Bundle · {product.formats.length} formats</span>
        ) : null}
      </div>
      <div>
        <h3 className="text-base font-semibold text-ink-900 group-hover:text-brand-700">{product.name}</h3>
        <p className="mt-1 text-sm text-ink-500">{product.short_description}</p>
      </div>
      <div className="mt-auto flex items-center justify-between text-sm text-ink-700">
        <span>
          {product.access_type === "free"
            ? "Free"
            : product.price_minor != null
              ? formatMinorUnits(product.price_minor, product.currency_code)
              : "Price on request"}
        </span>
        {product.completion_minutes_min ? (
          <span className="text-xs text-ink-500">{product.completion_minutes_min}–{product.completion_minutes_max} min</span>
        ) : null}
      </div>
    </Link>
  );
}
