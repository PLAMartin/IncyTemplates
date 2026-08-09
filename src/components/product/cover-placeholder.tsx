import { BookOpen, FileText, Layers, Wrench } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ProductType } from "@/types/catalogue";

const PRODUCT_TYPE_ICONS: Record<ProductType, typeof FileText> = {
  guide: BookOpen,
  template: FileText,
  tool: Wrench,
  bundle: Layers,
};

/**
 * No real cover/preview images exist yet (spec §17 Storage buckets and the
 * admin upload flow are out of scope this phase). Rather than render a
 * broken `<img>` or a fabricated screenshot, every product/bundle shows
 * this designed placeholder: pattern + icon + name, so the catalogue still
 * reads as intentional rather than broken.
 */
export function CoverPlaceholder({
  name,
  productType = "template",
  className,
}: {
  name: string;
  productType?: ProductType;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-md border border-ink-200 bg-brand-100",
        className,
      )}
      role="img"
      aria-label={`Placeholder cover for ${name}`}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, var(--color-brand-500) 0, var(--color-brand-500) 1px, transparent 1px, transparent 16px)",
        }}
      />
      <div className="relative flex flex-col items-center gap-2 px-4 text-center">
        {(() => {
          const Icon = PRODUCT_TYPE_ICONS[productType];
          return <Icon aria-hidden className="size-8 text-brand-700" />;
        })()}
        <span className="text-sm font-medium text-brand-900">{name}</span>
      </div>
    </div>
  );
}
