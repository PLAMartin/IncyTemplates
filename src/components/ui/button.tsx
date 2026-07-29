import { type ComponentPropsWithoutRef, forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium " +
  "min-h-11 px-4 transition-colors disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary:
    "border border-ink-200 bg-paper-raised text-ink-900 hover:bg-ink-100",
  ghost: "text-ink-900 hover:bg-ink-100",
} as const;

type ButtonVariant = keyof typeof variants;

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button ref={ref} className={cn(base, variants[variant], className)} {...props} />
  ),
);
Button.displayName = "Button";

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: ButtonVariant;
};

export function ButtonLink({ className, variant = "primary", ...props }: ButtonLinkProps) {
  return <Link className={cn(base, variants[variant], className)} {...props} />;
}
