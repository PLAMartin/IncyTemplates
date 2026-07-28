import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo/canonical";
import { LegalPage } from "@/components/content/legal-page";

export const metadata: Metadata = {
  title: "Cookie notice",
  description: "How we use cookies (pending legal review).",
  alternates: { canonical: canonicalUrl("/legal/cookies") },
  robots: { index: false, follow: true },
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie notice">
      <p>
        This site does not currently set analytics or marketing cookies — no analytics provider or consent manager
        is wired up yet.
      </p>
      <h2>What this notice will cover</h2>
      <ul>
        <li>Which cookies are strictly necessary versus optional.</li>
        <li>What Google Analytics 4 (or a privacy-focused alternative) collects, once enabled.</li>
        <li>How to accept or reject non-essential cookies, with rejecting made as easy as accepting.</li>
        <li>How to change your cookie preferences at any time via a persistent cookie-settings link.</li>
      </ul>
      <p>Cookie consent controls will be added, and this notice finalised, before any non-essential tracking is enabled.</p>
    </LegalPage>
  );
}
