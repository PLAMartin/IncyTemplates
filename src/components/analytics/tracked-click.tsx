"use client";

import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics/track";

type Properties = Record<string, string | number | boolean | undefined>;

/**
 * Attaches a GA4 click event to already-rendered server JSX (e.g. a FrameworkCard/ProductCard
 * built in a Server Component) via DOM event bubbling from `children` — a Server Component
 * can't pass an onClick function prop across the client boundary, but it can pass rendered JSX
 * as `children` to a Client Component wrapper, so this listens on a non-participating
 * (`display: contents`) wrapper instead of needing the card itself to be a Client Component.
 */
export function TrackedClick({
  event,
  properties,
  children,
}: {
  event: string;
  properties?: Properties;
  children: ReactNode;
}) {
  return (
    <div className="contents" onClick={() => trackEvent(event, properties)}>
      {children}
    </div>
  );
}
