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
        This site uses one optional cookie category: analytics, via Google Analytics 4. Nothing optional is set
        until you accept it, and no analytics cookie is set at all unless GA4 is actually configured for this
        environment.
      </p>
      <h2>Strictly necessary</h2>
      <p>
        A single local preference — your accept/reject choice itself — is stored in your browser so we don&apos;t
        ask again every visit. This isn&apos;t a tracking cookie and has no opt-out, the same way remembering a
        theme preference wouldn&apos;t.
      </p>
      <h2>Optional: analytics</h2>
      <p>
        If accepted, Google Analytics 4 records anonymous, aggregate usage — which pages and product families are
        viewed, and high-level actions like starting a Tool or completing a Template — to help us understand what&apos;s
        useful. We never send analytics your email address, name, anything you write into a Tool or Template, or any
        other personal or free-text content.
      </p>
      <h2>Your choice</h2>
      <ul>
        <li>A banner asks you to accept or reject analytics cookies the first time you visit — rejecting is exactly as easy as accepting.</li>
        <li>You can change your mind at any time via the &ldquo;Cookie preferences&rdquo; link in the site footer.</li>
      </ul>
    </LegalPage>
  );
}
