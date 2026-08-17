"use client";

import { useState, useTransition } from "react";
import { saveGuideDraftAction, saveAndPublishGuideAction } from "@/server/actions/admin-guides";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { CommonProductCopyFields } from "@/components/admin/common-product-copy-fields";
import type { CommonProductCopy } from "@/server/admin/editorial-content";

type Props = {
  productId: string;
  initialCommon: CommonProductCopy;
  initialBodyMarkdown: string;
  initialAuthor: string;
};

/**
 * "Save draft" saves without publishing (repeatable — the draft row is
 * mutable, see 20260812090010_it_product_content_revisions.sql). "Publish"
 * saves the current form content, then publishes it in the same server
 * round trip via saveAndPublishGuideAction, so the public page reflects it
 * immediately.
 */
export function GuideEditorForm({ productId, initialCommon, initialBodyMarkdown, initialAuthor }: Props) {
  const [common, setCommon] = useState<CommonProductCopy>(initialCommon);
  const [bodyMarkdown, setBodyMarkdown] = useState(initialBodyMarkdown);
  const [author, setAuthor] = useState(initialAuthor);
  const [changeNote, setChangeNote] = useState("");
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave(publish: boolean) {
    setMessage(null);
    startTransition(async () => {
      const action = publish ? saveAndPublishGuideAction : saveGuideDraftAction;
      const result = await action({ productId, common, bodyMarkdown, author, changeNote: changeNote || undefined });
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
      <FormField label="Author">
        {(fieldProps) => <Input {...fieldProps} value={author} onChange={(e) => setAuthor(e.target.value)} />}
      </FormField>
      <FormField label="Body (Markdown)" hint="Rendered with the same MDX pipeline as the public page.">
        {(fieldProps) => (
          <Textarea
            {...fieldProps}
            value={bodyMarkdown}
            onChange={(e) => setBodyMarkdown(e.target.value)}
            className="min-h-96 font-mono text-xs"
          />
        )}
      </FormField>
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
