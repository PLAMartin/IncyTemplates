import type { Metadata } from "next";
import Link from "next/link";
import { company } from "@/config/site";
import { canonicalUrl } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: "Help",
  description: "Get help using Incy Templates.",
  alternates: { canonical: canonicalUrl("/help") },
};

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">Help</h1>
      <p className="mt-4 text-lg text-ink-700">A few places to start, depending on what you need.</p>

      <div className="mt-10 space-y-6">
        <div className="rounded-md border border-ink-200 bg-paper-raised p-5">
          <h2 className="font-semibold text-ink-900">Common questions</h2>
          <p className="mt-1 text-sm text-ink-500">
            Most questions about formats, licensing and how the catalogue works are answered on our{" "}
            <Link href="/faq" className="underline">
              FAQ page
            </Link>
            .
          </p>
        </div>
        <div className="rounded-md border border-ink-200 bg-paper-raised p-5">
          <h2 className="font-semibold text-ink-900">Using a specific template</h2>
          <p className="mt-1 text-sm text-ink-500">
            Every template page includes plain-English instructions and, where relevant, a completed example. Start
            with the{" "}
            <Link href="/how-it-works" className="underline">
              how it works
            </Link>{" "}
            page for the general approach.
          </p>
        </div>
        <div className="rounded-md border border-ink-200 bg-paper-raised p-5">
          <h2 className="font-semibold text-ink-900">Still stuck?</h2>
          <p className="mt-1 text-sm text-ink-500">
            Email{" "}
            <a href={`mailto:${company.supportEmail}`} className="underline">
              {company.supportEmail}
            </a>{" "}
            or visit our{" "}
            <Link href="/contact" className="underline">
              contact page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
