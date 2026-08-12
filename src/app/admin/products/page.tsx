import type { Metadata } from "next";
import Link from "next/link";
import { listProductsForAdmin } from "@/server/admin/products";
import { VisibilityForm } from "@/components/admin/visibility-form";

export const metadata: Metadata = {
  title: "Products — Admin",
  robots: { index: false, follow: false },
};

const TYPE_EDIT_HREF: Record<string, (id: string) => string | null> = {
  guide: (id) => `/admin/guides/${id}`,
  template: () => null,
  tool: () => null,
  bundle: () => null,
};

export default async function AdminProductsPage() {
  const products = await listProductsForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink-900">Products</h1>
        <p className="mt-1 text-ink-500">
          {products.length} output{products.length === 1 ? "" : "s"} across every type. Visibility changes require
          the Admin role and are recorded in the audit log — hidden removes an output from every visitor surface,
          unlisted keeps direct links working but drops it from browse/search/sitemap.
        </p>
      </div>
      <div className="overflow-x-auto rounded-md border border-ink-200">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-ink-200 bg-paper-raised text-ink-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Name
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Type
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Visibility
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {products.map((product) => {
              const editHref = TYPE_EDIT_HREF[product.product_type]?.(product.id) ?? null;
              return (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    {editHref ? (
                      <Link href={editHref} className="font-medium text-brand-600 hover:text-brand-700">
                        {product.name}
                      </Link>
                    ) : (
                      <span className="font-medium text-ink-900">{product.name}</span>
                    )}
                    <div className="text-xs text-ink-500">/{product.slug}</div>
                  </td>
                  <td className="px-4 py-3 capitalize text-ink-700">{product.product_type}</td>
                  <td className="px-4 py-3 text-ink-700">{product.status}</td>
                  <td className="px-4 py-3">
                    <VisibilityForm entityId={product.id} kind="product" currentVisibility={product.public_visibility} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
