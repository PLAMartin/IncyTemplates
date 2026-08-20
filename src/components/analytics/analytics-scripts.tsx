"use client";

import Script from "next/script";
import { useAnalyticsConsent } from "@/lib/analytics/consent";
import { registerAnalyticsId, ensureDataLayer } from "@/lib/analytics/track";

/**
 * Spec §25.1: "no optional tracking before consent where consent is required." The GA4 property
 * id is registered unconditionally (cheap, doesn't send anything) so `trackEvent` can lazily
 * initialise `window.dataLayer` itself if it fires first — see track.ts's `ensureDataLayer` for
 * why ordering between this component and any page's own tracking call can't be relied on.
 * `window.dataLayer`/the external gtag.js request only ever happen once consent is "granted".
 */
export function AnalyticsScripts({ measurementId }: { measurementId: string }) {
  const consent = useAnalyticsConsent();
  registerAnalyticsId(measurementId);
  if (consent !== "granted") return null;

  ensureDataLayer();

  return <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />;
}
