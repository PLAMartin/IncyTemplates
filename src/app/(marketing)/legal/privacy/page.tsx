import type { Metadata } from "next";
import { company } from "@/config/site";
import { canonicalUrl } from "@/lib/seo/canonical";
import { LegalPage } from "@/components/content/legal-page";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "How we handle personal data (pending legal review).",
  alternates: { canonical: canonicalUrl("/legal/privacy") },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy notice">
      <p>
        {company.legalName} ({company.country}) will act as data controller for personal data collected through
        this website once that processing begins in earnest.
      </p>
      <h2>What we currently collect</h2>
      <p>
        Right now, the only personal data this site collects from a visitor is an email address voluntarily
        submitted through a &ldquo;join waitlist&rdquo; form on a product or bundle page, used solely to notify you when that
        item becomes available.
      </p>
      <h2>What this notice will cover</h2>
      <ul>
        <li>What personal data is collected and why (lawful basis for each purpose).</li>
        <li>How marketing consent is recorded and how to withdraw it.</li>
        <li>How long data is retained.</li>
        <li>Your rights, including access, correction, deletion and data export.</li>
        <li>Any third-party processors used (e.g. hosting, email delivery, payments once live).</li>
        <li>How to contact us about a privacy concern.</li>
      </ul>
      <p>This page will be replaced with an approved privacy notice before the site processes personal data at scale.</p>
    </LegalPage>
  );
}
