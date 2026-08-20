import { getStoredConsent } from "@/lib/analytics/consent";

type EventProperties = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

let measurementId: string | null = null;

/** Called by AnalyticsScripts once it knows the GA4 property — cheap, idempotent, safe pre-consent. */
export function registerAnalyticsId(id: string): void {
  measurementId = id;
}

/**
 * Creates `window.dataLayer` and seeds it with the `js`/`config` calls the GA4 snippet normally
 * makes, if it doesn't exist yet. Idempotent and callable from anywhere (AnalyticsScripts, or
 * lazily from trackEvent itself) — whichever runs first wins, so `config` always precedes any
 * `event` push regardless of component render/effect ordering. Returns false (no-op for the
 * caller) if the GA4 id hasn't been registered yet.
 */
export function ensureDataLayer(): boolean {
  if (typeof window === "undefined") return false;
  if (Array.isArray(window.dataLayer)) return true;
  if (!measurementId) return false;
  window.dataLayer = [];
  window.dataLayer.push(["js", new Date()]);
  window.dataLayer.push(["config", measurementId]);
  return true;
}

/**
 * Fires a GA4 custom event (spec §25.2 event names, §25.3 property allow-list) by pushing
 * directly onto `window.dataLayer` — the same array `gtag()` itself pushes onto internally
 * (`function gtag(){dataLayer.push(arguments)}`), so this works whether or not the external
 * gtag.js file has finished downloading yet: it drains whatever was already queued once loaded.
 *
 * Checks consent itself, via a plain synchronous read (see getStoredConsent's own comment for
 * why not the reactive hook) — spec §25.1: no optional tracking before consent, checked fresh at
 * the moment of the event rather than trusting some other component to have gated rendering.
 *
 * Never pass email, names, interview notes, Tool free text/results, Visual Brief content,
 * generation prompts or provider asset IDs — spec §25.3 forbids all of it.
 */
export function trackEvent(name: string, properties?: EventProperties): void {
  if (typeof window === "undefined") return;
  if (getStoredConsent() !== "granted") return;
  if (!ensureDataLayer()) return;
  window.dataLayer!.push(["event", name, properties ?? {}]);
}
