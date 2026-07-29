import Link from "next/link";
import type { Guide } from "@/types/catalogue";

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="flex flex-col gap-2 rounded-md border border-ink-200 bg-paper-raised p-4 transition-colors hover:border-brand-500 focus-visible:outline-2 focus-visible:outline-focus-ring"
    >
      <span className="text-xs font-medium text-ink-500">
        {formatDate(guide.publishedAt)} · {guide.readingTimeMinutes} min read
      </span>
      <h3 className="text-base font-semibold text-ink-900">{guide.title}</h3>
      <p className="text-sm text-ink-500">{guide.summary}</p>
    </Link>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
