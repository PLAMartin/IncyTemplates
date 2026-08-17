import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import type { CommonProductCopy } from "@/server/admin/editorial-content";

type Props = {
  values: CommonProductCopy;
  onChange: (patch: Partial<CommonProductCopy>) => void;
};

/**
 * Spec v8 §10.11.2's common product-copy fields, shared verbatim across the Guide, Template
 * and Tool admin editors (composition, not one implementation per type). Slug/price/Stripe
 * IDs/tool_key stay out of ordinary editorial fields per spec — this section never renders them.
 */
export function CommonProductCopyFields({ values, onChange }: Props) {
  return (
    <div className="space-y-4 rounded-md border border-ink-200 p-4">
      <h3 className="text-sm font-semibold text-ink-900">Editorial content — common copy</h3>
      <FormField label="Name">
        {(fieldProps) => <Input {...fieldProps} value={values.name} onChange={(e) => onChange({ name: e.target.value })} />}
      </FormField>
      <FormField label="Short description" hint="Shown on catalogue cards and search results.">
        {(fieldProps) => (
          <Textarea
            {...fieldProps}
            value={values.short_description}
            onChange={(e) => onChange({ short_description: e.target.value })}
          />
        )}
      </FormField>
      <FormField label="Full description (optional)">
        {(fieldProps) => (
          <Textarea
            {...fieldProps}
            value={values.full_description}
            onChange={(e) => onChange({ full_description: e.target.value })}
          />
        )}
      </FormField>
      <FormField label="Outcome statement (optional)">
        {(fieldProps) => (
          <Input
            {...fieldProps}
            value={values.outcome_statement}
            onChange={(e) => onChange({ outcome_statement: e.target.value })}
          />
        )}
      </FormField>
      <FormField label="Target audience (optional)">
        {(fieldProps) => (
          <Input {...fieldProps} value={values.target_audience} onChange={(e) => onChange({ target_audience: e.target.value })} />
        )}
      </FormField>
      <FormField label="When to use (optional)">
        {(fieldProps) => (
          <Textarea {...fieldProps} value={values.when_to_use} onChange={(e) => onChange({ when_to_use: e.target.value })} />
        )}
      </FormField>
      <FormField label="When not to use (optional)">
        {(fieldProps) => (
          <Textarea
            {...fieldProps}
            value={values.when_not_to_use}
            onChange={(e) => onChange({ when_not_to_use: e.target.value })}
          />
        )}
      </FormField>
      <FormField label="SEO title (optional)">
        {(fieldProps) => <Input {...fieldProps} value={values.seo_title} onChange={(e) => onChange({ seo_title: e.target.value })} />}
      </FormField>
      <FormField label="SEO description (optional)">
        {(fieldProps) => (
          <Textarea {...fieldProps} value={values.seo_description} onChange={(e) => onChange({ seo_description: e.target.value })} />
        )}
      </FormField>
    </div>
  );
}
