"use client";

import Script from "next/script";
import { registerAnalyticsId, ensureDataLayer } from "@/lib/analytics/track";

export function AnalyticsScripts({ measurementId }: { measurementId: string }) {
  registerAnalyticsId(measurementId);
  ensureDataLayer();

  return <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />;
}
