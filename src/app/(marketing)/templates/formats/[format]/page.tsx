import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { searchCatalogue } from "@/server/queries";
import { parseCatalogueFilters, filtersToSearchParams, type RawSearchParams } from "@/lib/catalogue/parse-filters";
import { catalogueNoindexDecision } from "@/lib/seo/canonical";
import { CatalogueListing } from "@/components/catalogue/catalogue-listing";
import type { FileFormat } from "@/types/catalogue";

const VALID_FORMATS: readonly FileFormat[] = [
  "pdf", "docx", "xlsx", "pptx", "markdown", "notion", "miro",
  "google_docs", "google_sheets", "zip", "png", "jpg", "webp", "other",
];

const FORMAT_LABELS: Partial<Record<FileFormat, string>> = {
  markdown: "Markdown",
  notion: "Notion",
  xlsx: "Spreadsheet",
  pdf: "PDF / printable",
};

type Props = {
  params: Promise<{ format: string }>;
  searchParams: Promise<RawSearchParams>;
};

function isValidFormat(value: string): value is FileFormat {
  return (VALID_FORMATS as readonly string[]).includes(value);
}

export async function generateStaticParams() {
  return (["markdown", "notion", "xlsx", "pdf"] satisfies FileFormat[]).map((format) => ({ format }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { format } = await params;
  if (!isValidFormat(format)) return {};
  const sp = await searchParams;
  const filters = { ...parseCatalogueFilters(sp), format };
  const decision = catalogueNoindexDecision(filters);
  const label = FORMAT_LABELS[format] ?? format;
  return {
    title: `${label} templates`,
    description: `Templates available in ${label} format.`,
    alternates: { canonical: decision.canonical },
    robots: decision.noindex ? { index: false, follow: true } : undefined,
  };
}

export default async function FormatTemplatesPage({ params, searchParams }: Props) {
  const { format } = await params;
  if (!isValidFormat(format)) notFound();

  const sp = await searchParams;
  const filters = { ...parseCatalogueFilters(sp), format };
  const result = await searchCatalogue(filters);
  const label = FORMAT_LABELS[format] ?? format;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-ink-900">{label} templates</h1>
        <p className="mt-2 max-w-2xl text-ink-500">Every template available as {label}.</p>
      </div>
      <CatalogueListing
        result={result}
        basePath={`/templates/formats/${format}`}
        searchParams={filtersToSearchParams(filters)}
      />
    </div>
  );
}
