"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { Category, Stage } from "@/types/catalogue";

/**
 * Client-island filter/sort bar layered on top of `templates/page.tsx`'s
 * server-rendered initial results (spec §10.2). Every control writes
 * straight to the URL query string via `router.push`, so filter state is
 * always reflected in a shareable, crawlable URL and the server component
 * re-renders with the new `searchParams` — this component holds no filter
 * state of its own beyond the controlled inputs' immediate values.
 */
export function FilterBar({ categories, stages }: { categories: Category[]; stages: Stage[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Any filter change resets pagination — a stale `page` value could
    // otherwise point past the end of a newly narrowed result set.
    params.delete("page");
    router.push(`/templates?${params.toString()}`);
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    updateParam("q", String(formData.get("q") ?? ""));
  }

  const hasActiveFilters = ["q", "access", "category", "stage", "format", "type"].some((key) =>
    searchParams.get(key),
  );

  return (
    <div className="flex flex-col gap-4 rounded-md border border-ink-200 bg-paper-raised p-4">
      <form onSubmit={handleSearchSubmit} role="search" className="flex gap-2">
        <label htmlFor="catalogue-search" className="sr-only">
          Search templates
        </label>
        <div className="relative flex-1">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
          <input
            id="catalogue-search"
            name="q"
            type="search"
            defaultValue={searchParams.get("q") ?? ""}
            placeholder="Search templates by name, outcome or keyword"
            className="min-h-11 w-full rounded-md border border-ink-200 bg-paper py-2 pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-300 focus-visible:outline-2 focus-visible:outline-focus-ring"
          />
        </div>
        <button
          type="submit"
          className="min-h-11 rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap items-end gap-3">
        <Field label="Access">
          <select
            value={searchParams.get("access") ?? ""}
            onChange={(e) => updateParam("access", e.target.value)}
            className={selectClassName}
          >
            <option value="">All</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </Field>

        <Field label="Type">
          <select
            value={searchParams.get("type") ?? ""}
            onChange={(e) => updateParam("type", e.target.value)}
            className={selectClassName}
          >
            <option value="">All</option>
            <option value="template">Individual</option>
            <option value="bundle">Bundle</option>
          </select>
        </Field>

        <Field label="Stage">
          <select
            value={searchParams.get("stage") ?? ""}
            onChange={(e) => updateParam("stage", e.target.value)}
            className={selectClassName}
          >
            <option value="">All stages</option>
            {stages.map((stage) => (
              <option key={stage.slug} value={stage.slug}>
                {stage.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Category">
          <select
            value={searchParams.get("category") ?? ""}
            onChange={(e) => updateParam("category", e.target.value)}
            className={selectClassName}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Format">
          <select
            value={searchParams.get("format") ?? ""}
            onChange={(e) => updateParam("format", e.target.value)}
            className={selectClassName}
          >
            <option value="">All formats</option>
            <option value="markdown">Markdown</option>
            <option value="pdf">PDF</option>
            <option value="notion">Notion</option>
            <option value="xlsx">Spreadsheet</option>
          </select>
        </Field>

        <Field label="Sort">
          <select
            value={searchParams.get("sort") ?? "recommended"}
            onChange={(e) => updateParam("sort", e.target.value)}
            className={selectClassName}
          >
            <option value="recommended">Recommended</option>
            <option value="newest">Newest</option>
            <option value="popular">Most popular</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </Field>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={() => router.push("/templates")}
            className="min-h-11 rounded-md px-3 text-sm font-medium text-ink-700 underline hover:text-ink-900"
          >
            Clear all
          </button>
        ) : null}
      </div>
    </div>
  );
}

const selectClassName =
  "min-h-11 rounded-md border border-ink-200 bg-paper px-3 text-sm text-ink-900 focus-visible:outline-2 focus-visible:outline-focus-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-ink-700">
      {label}
      {children}
    </label>
  );
}
