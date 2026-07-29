import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo/canonical";
import { LegalPage } from "@/components/content/legal-page";

export const metadata: Metadata = {
  title: "Licence terms",
  description: "What a template licence covers (pending legal review).",
  alternates: { canonical: canonicalUrl("/legal/licences") },
  robots: { index: false, follow: true },
};

export default function LicencesPage() {
  return (
    <LegalPage title="Licence terms">
      <p>
        Every template and bundle is offered under a named licence, shown on its product page. The licence
        currently used across the catalogue is <strong>Standard Personal &amp; Commercial Use</strong>.
      </p>
      <h2>What that licence is intended to cover</h2>
      <ul>
        <li>What the purchaser receives — a licence to use the template, not ownership of it or exclusivity.</li>
        <li>Commercial use is allowed.</li>
        <li>Use on client work is allowed.</li>
        <li>Redistribution or resale of the template file itself is not allowed.</li>
        <li>Whether future updates to the same version line are included.</li>
        <li>That templates provide general guidance, not professional legal, tax, financial or regulated advice.</li>
      </ul>
      <p>
        Full, binding licence text (including exact permitted-use wording and any third-party attribution) is
        pending legal review and will replace this summary before checkout goes live.
      </p>
    </LegalPage>
  );
}
