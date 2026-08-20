"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAnalyticsConsent, setAnalyticsConsent } from "@/lib/analytics/consent";

/**
 * Spec §25.1: "persistent cookie preferences; and equally accessible accept/reject/settings
 * controls." Renders only while consent is undetermined — Accept and Reject are the same size,
 * same style weight, and one tab-stop apart, so rejecting costs exactly as much attention as
 * accepting. See CookiePreferencesLink (site footer) for the "settings" half: a persistent way
 * to bring this back after a first choice.
 */
export function CookieConsentBanner() {
  const consent = useAnalyticsConsent();
  if (consent !== "undetermined") return null;

  return (
    <div
      role="region"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-200 bg-paper-raised p-4 shadow-lg sm:p-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-700">
          We&apos;d like to use optional analytics cookies to understand how the site is used —
          nothing personal, and rejecting is just as easy as accepting. See our{" "}
          <Link href="/legal/cookies" className="underline hover:text-ink-900">
            cookie notice
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="secondary" onClick={() => setAnalyticsConsent("denied")}>
            Reject
          </Button>
          <Button type="button" onClick={() => setAnalyticsConsent("granted")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
