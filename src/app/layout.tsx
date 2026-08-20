import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { site } from "@/config/site";
import { clientEnv } from "@/lib/env/client";
import { AnalyticsScripts } from "@/components/analytics/analytics-scripts";
import { CookieConsentBanner } from "@/components/analytics/cookie-consent-banner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.tagline,
  openGraph: {
    siteName: site.name,
    type: "website",
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
  },
};

/**
 * Route-group layouts (e.g. (marketing)/layout.tsx) own their header/footer
 * chrome and are responsible for wrapping their content in
 * `<main id="main-content">` so the skip link below has a target on every
 * page, including ones outside the marketing group (e.g. /admin).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable} h-full antialiased`}>
      <body className="flex min-h-screen flex-col">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
        {clientEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            {process.env.NODE_ENV === "production" && (
              <AnalyticsScripts measurementId={clientEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
            )}
            <CookieConsentBanner />
          </>
        )}
      </body>
    </html>
  );
}
