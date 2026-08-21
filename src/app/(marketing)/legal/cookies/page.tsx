import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo/canonical";
import { LegalPage } from "@/components/content/legal-page";

export const metadata: Metadata = {
  title: "Cookie notice",
  description: "Which cookies this site uses, and how to accept, reject or change your preference.",
  alternates: { canonical: canonicalUrl("/legal/cookies") },
  robots: { index: false, follow: true },
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie notice">
      <p>
        This site uses Google Analytics 4. No analytics cookie is set at all unless GA4 is actually configured for
        this environment.
      </p>
      <h2>Analytics</h2>
      <p>
        Google Analytics 4 records anonymous, aggregate usage — which pages and product families are viewed, and
        high-level actions like starting a Tool or completing a Template — to help us understand what&apos;s useful.
        We never send analytics your email address, name, anything you write into a Tool or Template, or any other
        personal or free-text content.
      </p>
    </LegalPage>
  );
}
