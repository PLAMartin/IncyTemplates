import { TriangleAlert } from "lucide-react";
import { company } from "@/config/site";

/**
 * Shared shell for the five placeholder legal pages (spec §43.3: "Do not
 * fabricate ... legal terms. Clearly label seed content."). Every legal
 * page uses this so the "pending review" heading and company details stay
 * consistent and config-driven rather than hand-typed on each page.
 */
export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">{title}</h1>

      <div className="mt-6 flex items-start gap-3 rounded-md border border-amber-500 bg-amber-100 p-4">
        <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-amber-700" />
        <div>
          <p className="font-semibold text-amber-700">Content pending legal review — not yet approved for launch</p>
          <p className="mt-1 text-sm text-amber-700">
            The text below is a structural placeholder, not final legal advice or a binding policy. It must be
            reviewed and approved before this site accepts real orders or personal data at scale.
          </p>
        </div>
      </div>

      <div className="guide-prose mt-8">{children}</div>

      <p className="mt-10 text-sm text-ink-500">
        {company.legalName} · {company.country}
      </p>
    </div>
  );
}
