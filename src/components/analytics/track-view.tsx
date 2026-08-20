"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics/track";

type Properties = Record<string, string | number | boolean | undefined>;

/**
 * Fires a GA4 "viewed this page" event once on mount (spec §25.2's view_home/view_collection/
 * view_framework etc.) — a side effect, not state read into render, so this is the sanctioned
 * useEffect case (unlike collection-progress.ts's localStorage read, which needed
 * useSyncExternalStore instead). The `fired` ref guards against React StrictMode's dev-only
 * double effect invocation double-counting a single real page view.
 */
export function TrackView({ event, properties }: { event: string; properties?: Properties }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent(event, properties);
    // The `fired` guard makes this fire-once regardless of how often the effect re-runs, so a
    // fresh `properties` object identity on every render (harmless extra invocations, all but
    // the first are no-ops) is fine to list here rather than suppressing the lint rule.
  }, [event, properties]);
  return null;
}
