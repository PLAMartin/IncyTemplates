import { type ReactNode } from "react";
import { Gift, Tag, CircleCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Spec §11.4: meaning must not be conveyed by colour alone. Every access
 * state pairs a distinct icon + label with its colour, so it still reads
 * correctly for colour-blind users or in forced-colours mode.
 */
export type AccessBadgeState = "free" | "paid" | "owned" | "coming-soon";

const stateConfig: Record<AccessBadgeState, { label: string; icon: ReactNode; className: string }> = {
  free: {
    label: "Free",
    icon: <Gift aria-hidden className="size-3.5" />,
    className: "bg-brand-100 text-brand-900",
  },
  paid: {
    label: "Paid",
    icon: <Tag aria-hidden className="size-3.5" />,
    className: "bg-ink-100 text-ink-900",
  },
  owned: {
    label: "Owned",
    icon: <CircleCheck aria-hidden className="size-3.5" />,
    className: "bg-amber-100 text-amber-700",
  },
  "coming-soon": {
    label: "Coming soon",
    icon: <Clock aria-hidden className="size-3.5" />,
    className: "bg-ink-100 text-ink-500",
  },
};

export function AccessBadge({ state, className }: { state: AccessBadgeState; className?: string }) {
  const config = stateConfig[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
