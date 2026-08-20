import { describe, expect, it, beforeEach } from "vitest";
import { setAnalyticsConsent, resetAnalyticsConsent } from "@/lib/analytics/consent";

const STORAGE_KEY = "it_analytics_consent_v1";

beforeEach(() => {
  window.localStorage.clear();
});

describe("analytics consent (spec v9 §25.1 persistent cookie preferences)", () => {
  it("stores nothing until a choice is made", () => {
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("setAnalyticsConsent('granted') persists the choice", () => {
    setAnalyticsConsent("granted");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("granted");
  });

  it("setAnalyticsConsent('denied') persists the choice", () => {
    setAnalyticsConsent("denied");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("denied");
  });

  it("resetAnalyticsConsent clears a prior choice so the banner can re-ask", () => {
    setAnalyticsConsent("granted");
    resetAnalyticsConsent();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("dispatches a same-tab change event so subscribers update without a storage event", () => {
    let fired = false;
    window.addEventListener("it-consent-changed", () => {
      fired = true;
    });
    setAnalyticsConsent("granted");
    expect(fired).toBe(true);
  });
});
