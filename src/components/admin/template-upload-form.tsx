"use client";

import { useId, useRef, useState, useTransition } from "react";
import { replaceTemplateFileAction } from "@/server/actions/admin-templates";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

const FILE_ROLES = ["template", "example", "instructions", "facilitator_guide", "preview", "cover", "bonus"] as const;
const FILE_FORMATS = [
  "pdf",
  "docx",
  "xlsx",
  "pptx",
  "markdown",
  "notion",
  "miro",
  "google_docs",
  "google_sheets",
  "zip",
  "png",
  "jpg",
  "webp",
  "other",
] as const;

export function TemplateUploadForm({ productId, suggestedNextVersion }: { productId: string; suggestedNextVersion: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const previewId = useId();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("productId", productId);
    formData.set("isPublicPreview", String(formData.get("isPublicPreview") === "on"));

    setMessage(null);
    startTransition(async () => {
      const result = await replaceTemplateFileAction(formData);
      if (result.status === "success") {
        setMessage({ kind: "success", text: "New version created." });
        formRef.current?.reset();
      } else {
        setMessage({ kind: "error", text: result.message });
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 rounded-md border border-ink-200 bg-paper-raised p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Version">
          {(fieldProps) => <Input {...fieldProps} name="version" defaultValue={suggestedNextVersion} required />}
        </FormField>
        <FormField label="Display name">
          {(fieldProps) => <Input {...fieldProps} name="displayName" placeholder="e.g. Worksheet (PDF)" required />}
        </FormField>
        <FormField label="File role">
          {(fieldProps) => (
            <Select {...fieldProps} name="fileRole" defaultValue="template">
              {FILE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField label="File format">
          {(fieldProps) => (
            <Select {...fieldProps} name="fileFormat" defaultValue="pdf">
              {FILE_FORMATS.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </Select>
          )}
        </FormField>
      </div>
      <FormField label="Release notes (optional)">
        {(fieldProps) => <Input {...fieldProps} name="releaseNotes" />}
      </FormField>
      <div className="flex items-center gap-2">
        <input id={previewId} type="checkbox" name="isPublicPreview" className="size-4 rounded border-ink-300" />
        <label htmlFor={previewId} className="text-sm text-ink-700">
          Publicly previewable (e.g. a completed example, not the paid deliverable)
        </label>
      </div>
      <FormField label="File" hint="Max 25MB.">
        {(fieldProps) => <input {...fieldProps} type="file" name="file" required className="text-sm text-ink-700" />}
      </FormField>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Uploading…" : "Create new version"}
        </Button>
        {message ? (
          <span role="status" className={message.kind === "error" ? "text-sm text-red-700" : "text-sm text-brand-700"}>
            {message.text}
          </span>
        ) : null}
      </div>
    </form>
  );
}
