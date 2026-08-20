"use client";

import { resetAnalyticsConsent } from "@/lib/analytics/consent";

/** The persistent "settings" control spec §25.1 requires alongside accept/reject — re-shows the banner. */
export function CookiePreferencesLink() {
  return (
    <button
      type="button"
      onClick={() => resetAnalyticsConsent()}
      className="text-sm text-ink-500 underline decoration-dotted hover:text-ink-900"
    >
      Cookie preferences
    </button>
  );
}
