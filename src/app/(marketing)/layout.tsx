import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ContentSourceBanner } from "@/components/content/content-source-banner";
import { JsonLd } from "@/components/content/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <ContentSourceBanner />
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
