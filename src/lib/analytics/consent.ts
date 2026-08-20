import { useSyncExternalStore } from "react";

const STORAGE_KEY = "it_analytics_consent_v1";
const CHANGE_EVENT = "it-consent-changed";

export type ConsentStatus = "granted" | "denied" | "undetermined";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

let cachedRaw: string | null | undefined;
let cachedValue: ConsentStatus = "undetermined";

function readRaw(): ConsentStatus {
  if (!isBrowser()) return "undetermined";
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  cachedValue = raw === "granted" || raw === "denied" ? raw : "undetermined";
  return cachedValue;
}

function subscribe(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getServerSnapshot(): ConsentStatus {
  return "undetermined";
}

/**
 * Spec v9 §25.1: persistent, revisitable cookie preferences. `useSyncExternalStore` (not
 * useEffect/useState — see collection-progress.ts for why the naive version fails this repo's
 * react-hooks/set-state-in-effect lint) so the GA4 loader and the consent banner both react
 * immediately to a same-tab choice, not just a cross-tab `storage` event.
 */
export function useAnalyticsConsent(): ConsentStatus {
  return useSyncExternalStore(subscribe, readRaw, getServerSnapshot);
}

/**
 * A plain (non-hook) read of the current consent, for `trackEvent` to check at the moment an
 * event actually happens. Deliberately not the hook above: `useSyncExternalStore` renders
 * `getServerSnapshot` ("undetermined") on the very first client pass to match SSR, then
 * re-syncs to the real value in a second pass — found during Phase 5 verification to run *after*
 * some sibling components' own mount effects, which silently dropped their first event on every
 * fresh page load even with consent already granted. A plain synchronous localStorage read has
 * no such two-pass delay.
 */
export function getStoredConsent(): ConsentStatus {
  return readRaw();
}

export function setAnalyticsConsent(status: "granted" | "denied"): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, status);
  } catch {
    return;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Re-shows the consent banner so a visitor can change their mind (spec §25.1 "settings" control). */
export function resetAnalyticsConsent(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
