import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/server/queries";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse templates by category.",
};

export default async function CategoriesIndexPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-ink-900">Categories</h1>
        <p className="mt-2 max-w-2xl text-ink-500">Browse templates by category.</p>
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/templates/categories/${category.slug}`}
              className="block rounded-md border border-ink-200 bg-paper-raised p-4 hover:border-brand-500 focus-visible:outline-2 focus-visible:outline-focus-ring"
            >
              <h2 className="font-semibold text-ink-900">{category.name}</h2>
              {category.description ? <p className="mt-1 text-sm text-ink-500">{category.description}</p> : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
