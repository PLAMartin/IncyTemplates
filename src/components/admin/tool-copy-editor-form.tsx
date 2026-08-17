"use client";

import { useState, useTransition } from "react";
import { saveToolContentDraftAction, saveAndPublishToolContentAction } from "@/server/actions/admin-tool-copy";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { CommonProductCopyFields } from "@/components/admin/common-product-copy-fields";
import type { ToolCopySchema } from "@/lib/tools/types";
import type { CommonProductCopy } from "@/server/admin/editorial-content";

type Props = {
  toolKey: string;
  productId: string | null;
  schema: ToolCopySchema;
  initialCommon: CommonProductCopy;
  initialValues: Record<string, string>;
};

/**
 * Bundles common product copy (spec v8 §10.11.2) with the Tool's declared `copySchema`
 * fields into one Save draft/Publish action, backed by two coordinated server-side writes
 * (`saveToolContentDraftAction`/`saveAndPublishToolContentAction` — see their doc comment in
 * admin-tool-copy.ts for why). The per-tool fields stay entirely schema-driven, same as
 * before: one Input/Textarea per declared key, nothing a database row could add.
 */
export function ToolCopyEditorForm({ toolKey, productId, schema, initialCommon, initialValues }: Props) {
  const [common, setCommon] = useState<CommonProductCopy>(initialCommon);
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [changeNote, setChangeNote] = useState("");
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave(publish: boolean) {
    setMessage(null);
    startTransition(async () => {
      const action = publish ? saveAndPublishToolContentAction : saveToolContentDraftAction;
      const result = await action({
        toolKey,
        productId,
        common,
        toolContentData: values,
        changeNote: changeNote || undefined,
      });
      if (result.status === "success") {
        setMessage({ kind: "success", text: publish ? "Published." : "Draft saved." });
        setChangeNote("");
      } else {
        setMessage({ kind: "error", text: result.message });
      }
    });
  }

  return (
    <div className="space-y-4">
      <CommonProductCopyFields values={common} onChange={(patch) => setCommon((prev) => ({ ...prev, ...patch }))} />
      {Object.entries(schema).map(([key, spec]) => (
        <FormField key={key} label={spec.label}>
          {(fieldProps) =>
            spec.kind === "textarea" ? (
              <Textarea
                {...fieldProps}
                value={values[key] ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={spec.defaultValue}
              />
            ) : (
              <Input
                {...fieldProps}
                value={values[key] ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={spec.defaultValue}
              />
            )
          }
        </FormField>
      ))}
      <FormField label="Change note (optional)">
        {(fieldProps) => <Input {...fieldProps} value={changeNote} onChange={(e) => setChangeNote(e.target.value)} />}
      </FormField>
      <div className="flex items-center gap-3">
        <Button type="button" variant="secondary" disabled={isPending} onClick={() => handleSave(false)}>
          {isPending ? "Saving…" : "Save draft"}
        </Button>
        <Button type="button" disabled={isPending} onClick={() => handleSave(true)}>
          {isPending ? "Publishing…" : "Publish"}
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
