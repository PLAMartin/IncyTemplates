import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export const Select = forwardRef<HTMLSelectElement, ComponentPropsWithoutRef<"select">>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "min-h-11 w-full rounded-md border border-ink-200 bg-paper-raised px-3 text-sm text-ink-900",
        "focus-visible:outline-2 focus-visible:outline-focus-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Select.displayName = "Select";
