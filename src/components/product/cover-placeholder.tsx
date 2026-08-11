import { cn } from "@/lib/utils/cn";
import type { ProductType } from "@/types/catalogue";

/**
 * No real cover/preview images exist yet (spec §17 Storage buckets and the
 * admin upload flow are out of scope this phase). Rather than a generic
 * icon-in-a-box, every product/bundle shows a bespoke "workshop stamp" —
 * a small circular mark + background texture per output type, drawn from
 * the same document/workshop identity as the rest of the site (see
 * docs/decisions/0002-visual-identity-direction.md) so the catalogue reads
 * as designed rather than as a placeholder waiting to be replaced.
 */

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function GuideMark() {
  return (
    <svg {...ICON_PROPS} className="size-[1em]" aria-hidden>
      <path d="M12 6.4c-1.7-1.2-3.9-1.7-5.75-1.4v11.4c1.85-.3 4.05.2 5.75 1.4 1.7-1.2 3.9-1.7 5.75-1.4V5c-1.85-.3-4.05.2-5.75 1.4Z" />
      <path d="M12 6.4v11.4" />
      <path d="M10.4 4.6 12 6.4l1.6-1.8" />
    </svg>
  );
}

function TemplateMark() {
  return (
    <svg {...ICON_PROPS} className="size-[1em]" aria-hidden>
      <path d="M6.75 3.5h7.5l3 3v13.5a.5.5 0 0 1-.5.5H6.75a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5Z" />
      <path d="M14.25 3.5v3h3" />
      <path d="M9 12.75h6" strokeDasharray="1.6 2.1" />
      <path d="M9 16h4.25" strokeDasharray="1.6 2.1" />
    </svg>
  );
}

function ToolMark() {
  return (
    <svg {...ICON_PROPS} className="size-[1em]" aria-hidden>
      <circle cx="12" cy="13.25" r="6.75" />
      <path d="M12 13.25 15.75 9.7" />
      <circle cx="12" cy="13.25" r="1" fill="currentColor" stroke="none" />
      <path d="M8.25 5.85 9.1 7.2" />
      <path d="M15.75 5.85 14.9 7.2" />
    </svg>
  );
}

function BundleMark() {
  return (
    <svg {...ICON_PROPS} className="size-[1em]" aria-hidden>
      <rect x="4.25" y="9" width="9.5" height="12" rx="1" transform="rotate(-9 9 15)" />
      <rect x="6.75" y="7" width="9.5" height="12" rx="1" transform="rotate(4 11.5 13)" />
      <rect x="9.25" y="5.25" width="9.5" height="12" rx="1" />
    </svg>
  );
}

const PRODUCT_TYPE_CONFIG: Record<
  ProductType,
  { Mark: typeof GuideMark; label: string; pattern: string }
> = {
  guide: {
    Mark: GuideMark,
    label: "Guide",
    pattern:
      "repeating-linear-gradient(to bottom, var(--color-brand-500) 0, var(--color-brand-500) 1px, transparent 1px, transparent 15px)",
  },
  template: {
    Mark: TemplateMark,
    label: "Template",
    pattern: "radial-gradient(var(--color-brand-500) 1px, transparent 1.4px)",
  },
  tool: {
    Mark: ToolMark,
    label: "Tool",
    pattern:
      "repeating-conic-gradient(from 0deg, var(--color-brand-500) 0deg 1deg, transparent 1deg 12deg)",
  },
  bundle: {
    Mark: BundleMark,
    label: "Bundle",
    pattern:
      "repeating-linear-gradient(45deg, var(--color-brand-500) 0, var(--color-brand-500) 1px, transparent 1px, transparent 13px), repeating-linear-gradient(-45deg, var(--color-brand-500) 0, var(--color-brand-500) 1px, transparent 1px, transparent 13px)",
  },
};

export function CoverPlaceholder({
  name,
  productType = "template",
  className,
}: {
  name: string;
  productType?: ProductType;
  className?: string;
}) {
  const { Mark, label, pattern } = PRODUCT_TYPE_CONFIG[productType];
  const isTool = productType === "tool";

  return (
    <div
      className={cn(
        "relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-md border border-ink-200 bg-brand-100 [container-type:inline-size]",
        className,
      )}
      role="img"
      aria-label={`${label} — ${name}`}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage: pattern,
          backgroundSize: productType === "template" ? "14px 14px" : undefined,
          backgroundPosition: isTool ? "center 38%" : undefined,
        }}
      />
      <div
        className="relative flex size-[2.35em] flex-col items-center justify-center gap-[0.1em] rounded-full border border-brand-500/40 text-brand-700"
        style={{ fontSize: "clamp(1.7rem, 13cqw, 4rem)" }}
      >
        <div className="pointer-events-none absolute inset-[8%] rounded-full border border-dashed border-brand-500/35" aria-hidden />
        <Mark />
        <span className="relative font-serif text-[0.275em] font-semibold uppercase tracking-[0.14em] text-brand-700/80">
          {label}
        </span>
      </div>
    </div>
  );
}
