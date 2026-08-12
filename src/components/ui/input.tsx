import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Minimal form primitives for the admin UI — this repo had none before
 * (only hand-rolled inline `<input>`s in marketing forms like
 * waitlist-form.tsx). Same token system (`paper-raised`, `ink-*`,
 * `focus-ring`) and sizing (`min-h-11`) as those, just factored out since
 * admin screens need many fields per page.
 */
export const Input = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<"input">>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "min-h-11 w-full rounded-md border border-ink-200 bg-paper-raised px-3 text-sm text-ink-900",
        "placeholder:text-ink-300 focus-visible:outline-2 focus-visible:outline-focus-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
