import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { company } from "@/config/site";
import { canonicalUrl } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${company.tradingName}.`,
  alternates: { canonical: canonicalUrl("/contact") },
};

/**
 * Static contact info + mailto only (approved decision, see build plan's
 * "Decisions locked in" section) — no contact-form backend or database
 * write this phase.
 */
export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">Contact</h1>
      <p className="mt-4 text-lg text-ink-700">
        The best way to reach us right now is email — we read and reply to every message ourselves.
      </p>

      <div className="mt-8 rounded-md border border-ink-200 bg-paper-raised p-6">
        <a
          href={`mailto:${company.supportEmail}`}
          className="flex items-center gap-3 text-lg font-medium text-brand-700 hover:text-brand-900"
        >
          <Mail aria-hidden className="size-5" />
          {company.supportEmail}
        </a>
        <p className="mt-3 text-sm text-ink-500">
          For anything related to a specific template or bundle, mention its name so we can help faster.
        </p>
      </div>

      <p className="mt-8 text-sm text-ink-500">
        {company.legalName} · {company.country}
      </p>
    </div>
  );
}
