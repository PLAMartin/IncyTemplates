import { useId } from "react";
import { cn } from "@/lib/utils/cn";

type FormFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: (fieldProps: { id: string; "aria-describedby"?: string; "aria-invalid"?: true }) => React.ReactNode;
};

/**
 * Label/hint/error wiring for one field, following the `useId()` +
 * `aria-describedby` pattern already used in waitlist-form.tsx /
 * view-form.tsx. `children` is a render prop so the caller can drop in
 * `Input`/`Textarea`/`Select` (or a custom control) and still get correctly
 * wired `id`/`aria-*` props without repeating the plumbing everywhere.
 */
export function FormField({ label, hint, error, className, children }: FormFieldProps) {
  const fieldId = useId();
  const hintId = useId();
  const errorId = useId();

  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-1", className)}>
      <label htmlFor={fieldId} className="block text-sm font-medium text-ink-900">
        {label}
      </label>
      {children({ id: fieldId, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {hint ? (
        <p id={hintId} className="text-xs text-ink-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
