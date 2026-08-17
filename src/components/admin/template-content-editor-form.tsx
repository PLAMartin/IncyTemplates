"use client";

import { useState, useTransition } from "react";
import { saveTemplateContentDraftAction, saveAndPublishTemplateContentAction } from "@/server/actions/admin-template-content";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { CommonProductCopyFields } from "@/components/admin/common-product-copy-fields";
import type { CommonProductCopy } from "@/server/admin/editorial-content";
import type { TemplateTypeCopy } from "@/server/admin/template-content";

type Props = {
  productId: string;
  initialCommon: CommonProductCopy;
  initialTemplate: TemplateTypeCopy;
};

/**
 * Spec v8 §10.11.4 — the Template's "Editorial content" section: common copy plus
 * instructions/required-inputs/completion/example/interpretation/CTA guidance. Deliberately
 * separate from `TemplateUploadForm` (file versions) below it on the same page — publishing a
 * copy-only revision must not require uploading a file, and vice versa.
 */
export function TemplateContentEditorForm({ productId, initialCommon, initialTemplate }: Props) {
  const [common, setCommon] = useState<CommonProductCopy>(initialCommon);
  const [template, setTemplate] = useState<TemplateTypeCopy>(initialTemplate);
  const [changeNote, setChangeNote] = useState("");
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave(publish: boolean) {
    setMessage(null);
    startTransition(async () => {
      const action = publish ? saveAndPublishTemplateContentAction : saveTemplateContentDraftAction;
      const result = await action({
        productId,
        common,
        instructionsMarkdown: template.instructions_markdown,
        requiredInputs: template.required_inputs || undefined,
        whatsIncluded: template.whats_included || undefined,
        exampleMarkdown: template.example_markdown || undefined,
        interpretationGuidance: template.interpretation_guidance || undefined,
        ctaCopy: template.cta_copy || undefined,
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
      <FormField label="Instructions (Markdown)" hint="How to use this template, step by step.">
        {(fieldProps) => (
          <Textarea
            {...fieldProps}
            value={template.instructions_markdown}
            onChange={(e) => setTemplate((prev) => ({ ...prev, instructions_markdown: e.target.value }))}
            className="min-h-64 font-mono text-xs"
          />
        )}
      </FormField>
      <FormField label="What you need (optional)" hint="Inputs/information the reader should gather before starting.">
        {(fieldProps) => (
          <Textarea
            {...fieldProps}
            value={template.required_inputs}
            onChange={(e) => setTemplate((prev) => ({ ...prev, required_inputs: e.target.value }))}
          />
        )}
      </FormField>
      <FormField label="What's included (optional)">
        {(fieldProps) => (
          <Textarea
            {...fieldProps}
            value={template.whats_included}
            onChange={(e) => setTemplate((prev) => ({ ...prev, whats_included: e.target.value }))}
          />
        )}
      </FormField>
      <FormField label="Worked example (optional, Markdown)">
        {(fieldProps) => (
          <Textarea
            {...fieldProps}
            value={template.example_markdown}
            onChange={(e) => setTemplate((prev) => ({ ...prev, example_markdown: e.target.value }))}
            className="min-h-48 font-mono text-xs"
          />
        )}
      </FormField>
      <FormField label="Interpretation / next-step guidance (optional)">
        {(fieldProps) => (
          <Textarea
            {...fieldProps}
            value={template.interpretation_guidance}
            onChange={(e) => setTemplate((prev) => ({ ...prev, interpretation_guidance: e.target.value }))}
          />
        )}
      </FormField>
      <FormField label="CTA copy (optional)">
        {(fieldProps) => (
          <Input
            {...fieldProps}
            value={template.cta_copy}
            onChange={(e) => setTemplate((prev) => ({ ...prev, cta_copy: e.target.value }))}
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
