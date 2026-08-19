"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCollectionAction, updateCollectionAction } from "@/server/actions/admin-collections";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

export type CollectionFormValues = {
  name: string;
  slug: string;
  headline: string;
  shortDescription: string;
  displayOrder: number;
  isCore: boolean;
  seoTitle: string;
  seoDescription: string;
};

type Props = { mode: "create" } | { mode: "edit"; collectionId: string; initial: CollectionFormValues };

const EMPTY: CollectionFormValues = {
  name: "",
  slug: "",
  headline: "",
  shortDescription: "",
  displayOrder: 0,
  isCore: false,
  seoTitle: "",
  seoDescription: "",
};

/**
 * Create/edit form for a Collection's own fields (spec v9 §14.3.1) — member management lives in
 * `CollectionMembersEditor` on the same admin page, not here, since members are a separate
 * add/remove/reorder workflow rather than part of this record's own save.
 */
export function CollectionForm(props: Props) {
  const router = useRouter();
  const [values, setValues] = useState<CollectionFormValues>(props.mode === "edit" ? props.initial : EMPTY);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setMessage(null);
    const payload = {
      name: values.name,
      slug: values.slug,
      headline: values.headline || undefined,
      shortDescription: values.shortDescription,
      displayOrder: values.displayOrder,
      isCore: values.isCore,
      seoTitle: values.seoTitle || undefined,
      seoDescription: values.seoDescription || undefined,
    };
    startTransition(async () => {
      if (props.mode === "create") {
        const result = await createCollectionAction(payload);
        if (result.status === "success") {
          router.push(`/admin/collections/${result.id}`);
        } else {
          setMessage({ kind: "error", text: result.message });
        }
        return;
      }
      const result = await updateCollectionAction(props.collectionId, payload);
      if (result.status === "success") {
        setMessage({ kind: "success", text: "Saved." });
      } else {
        setMessage({ kind: "error", text: result.message });
      }
    });
  }

  return (
    <div className="space-y-4 rounded-md border border-ink-200 p-4">
      <FormField label="Name">
        {(fieldProps) => <Input {...fieldProps} value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} />}
      </FormField>
      <FormField label="Slug" hint="Lowercase letters, numbers and hyphens only.">
        {(fieldProps) => <Input {...fieldProps} value={values.slug} onChange={(e) => setValues((v) => ({ ...v, slug: e.target.value }))} />}
      </FormField>
      <FormField label="Headline / promise" hint="Required before this Collection can be published.">
        {(fieldProps) => (
          <Input {...fieldProps} value={values.headline} onChange={(e) => setValues((v) => ({ ...v, headline: e.target.value }))} />
        )}
      </FormField>
      <FormField label="Short description">
        {(fieldProps) => (
          <Textarea
            {...fieldProps}
            value={values.shortDescription}
            onChange={(e) => setValues((v) => ({ ...v, shortDescription: e.target.value }))}
          />
        )}
      </FormField>
      <FormField label="Display order">
        {(fieldProps) => (
          <Input
            {...fieldProps}
            type="number"
            value={values.displayOrder}
            onChange={(e) => setValues((v) => ({ ...v, displayOrder: Number(e.target.value) }))}
            className="w-32"
          />
        )}
      </FormField>
      <div className="flex items-center gap-2">
        <input
          id="collection-is-core"
          type="checkbox"
          checked={values.isCore}
          onChange={(e) => setValues((v) => ({ ...v, isCore: e.target.checked }))}
          className="size-4 rounded border-ink-300"
        />
        <label htmlFor="collection-is-core" className="text-sm text-ink-900">
          Active core Collection (only one should normally be core during the curated launch)
        </label>
      </div>
      <FormField label="SEO title (optional)">
        {(fieldProps) => (
          <Input {...fieldProps} value={values.seoTitle} onChange={(e) => setValues((v) => ({ ...v, seoTitle: e.target.value }))} />
        )}
      </FormField>
      <FormField label="SEO description (optional)">
        {(fieldProps) => (
          <Textarea
            {...fieldProps}
            value={values.seoDescription}
            onChange={(e) => setValues((v) => ({ ...v, seoDescription: e.target.value }))}
          />
        )}
      </FormField>
      <div className="flex items-center gap-3">
        <Button type="button" disabled={isPending} onClick={handleSave}>
          {isPending ? "Saving…" : props.mode === "create" ? "Create collection" : "Save"}
        </Button>
        {message ? (
          <span role="status" className={message.kind === "error" ? "text-sm text-red-700" : "text-sm text-brand-700"}>
            {message.text}
          </span>
        ) : null}
      </div>
    </div>
  );
}
