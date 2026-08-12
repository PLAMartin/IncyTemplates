"use client";

import { useState, useTransition } from "react";
import { saveToolCopyDraftAction, saveAndPublishToolCopyAction } from "@/server/actions/admin-tool-copy";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import type { ToolCopySchema } from "@/lib/tools/types";

type Props = {
  toolKey: string;
  schema: ToolCopySchema;
  initialValues: Record<string, string>;
};

/**
 * Generic form driven entirely by the Tool's declared `copySchema` — one
 * Input/Textarea per field, no per-tool UI code needed. This is what makes
 * "no arbitrary code editor" (spec line 998) hold structurally: the form
 * can only ever render/save the keys the Tool itself declared, nothing a
 * database row could add.
 */
export function ToolCopyEditorForm({ toolKey, schema, initialValues }: Props) {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [changeNote, setChangeNote] = useState("");
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave(publish: boolean) {
    setMessage(null);
    startTransition(async () => {
      const action = publish ? saveAndPublishToolCopyAction : saveToolCopyDraftAction;
      const result = await action({ toolKey, contentData: values, changeNote: changeNote || undefined });
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
