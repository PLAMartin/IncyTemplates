import type { Metadata } from "next";
import { company } from "@/config/site";
import { canonicalUrl } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: "Accessibility statement",
  description: `${company.tradingName}'s accessibility statement and how to report an issue.`,
  alternates: { canonical: canonicalUrl("/accessibility") },
};

export default function AccessibilityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">Accessibility statement</h1>
      <div className="guide-prose mt-6">
        <p>
          {company.tradingName} is committed to making this website usable by as many people as possible, including
          people using assistive technology such as screen readers, screen magnifiers, speech recognition software,
          or keyboard-only navigation.
        </p>
        <h2>Our target standard</h2>
        <p>
          We are working towards conformance with the Web Content Accessibility Guidelines (WCAG) 2.2 at Level AA.
          This is our ongoing target, not a claim of full conformance today — the site is under active development
          and we expect to find and fix issues as we go.
        </p>
        <h2>What we&apos;ve built in</h2>
        <ul>
          <li>A skip-to-content link on every page.</li>
          <li>Keyboard-operable navigation, including the mobile menu.</li>
          <li>Visible focus indicators throughout, not just browser defaults.</li>
          <li>Labelled form controls with associated error text.</li>
          <li>Semantic landmarks and heading structure on every page.</li>
          <li>Support for reduced-motion preferences.</li>
          <li>A minimum 44×44px touch target for interactive controls.</li>
        </ul>
        <h2>Known limitations</h2>
        <p>
          As a young product, some pages haven&apos;t yet had a full manual accessibility review (screen-reader
          testing, 200%/400% zoom, and mobile reflow testing) — automated checks catch a useful subset of issues but
          don&apos;t replace that manual pass, which is planned before public launch.
        </p>
        <h2>Reporting an issue</h2>
        <p>
          If you encounter an accessibility barrier anywhere on this site, please tell us — email{" "}
          <a href={`mailto:${company.supportEmail}`}>{company.supportEmail}</a> with the page URL and a description
          of the issue, and we&apos;ll do our best to fix it and get back to you.
        </p>
      </div>
    </div>
  );
}
