import type { Metadata } from "next";
import { company } from "@/config/site";
import { canonicalUrl } from "@/lib/seo/canonical";
import { LegalPage } from "@/components/content/legal-page";

export const metadata: Metadata = {
  title: "Terms",
  description: "Website and sale terms (pending legal review).",
  alternates: { canonical: canonicalUrl("/legal/terms") },
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms">
      <p>
        These terms govern use of this website and any purchase made through it, operated by {company.legalName}{" "}
        ({company.country}).
      </p>
      <h2>What these terms will cover</h2>
      <ul>
        <li>Acceptance of terms by using the site or making a purchase.</li>
        <li>What a purchase entitles you to (a licence to use a digital template, not a transfer of ownership).</li>
        <li>Account and access rules once accounts exist.</li>
        <li>Acceptable use of the site and of purchased templates.</li>
        <li>Limitation of liability and disclaimers.</li>
        <li>Governing law and jurisdiction.</li>
      </ul>
      <p>
        Checkout is not live yet, so no purchase terms are currently in effect. This page will be replaced with
        approved terms of sale before any real transaction can take place.
      </p>
    </LegalPage>
  );
}
