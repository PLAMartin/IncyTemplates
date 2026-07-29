import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo/canonical";
import { LegalPage } from "@/components/content/legal-page";

export const metadata: Metadata = {
  title: "Refund policy",
  description: "Our approach to refunds (pending legal review).",
  alternates: { canonical: canonicalUrl("/legal/refunds") },
  robots: { index: false, follow: true },
};

export default function RefundsPage() {
  return (
    <LegalPage title="Refund policy">
      <p>
        Checkout isn&apos;t live yet, so no purchase has been made under this policy — there is nothing to refund today.
        This page sets out what the policy will need to cover once payments are enabled.
      </p>
      <h2>What this policy will cover</h2>
      <ul>
        <li>Whether full refunds are available, and within what time window.</li>
        <li>Whether partial refunds are available and under what circumstances.</li>
        <li>What happens to your access to a template if a refund is issued.</li>
        <li>How to request a refund and how quickly we aim to respond.</li>
        <li>How this interacts with your statutory rights, which this policy cannot reduce.</li>
      </ul>
      <p>The finalised, approved refund policy will replace this page before checkout is enabled.</p>
    </LegalPage>
  );
}
