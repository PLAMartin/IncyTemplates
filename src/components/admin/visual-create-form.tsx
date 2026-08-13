"use client";

import { useId, useRef, useState, useTransition } from "react";
import { generateVisualCandidatesAction, uploadVisualCandidateAction } from "@/server/actions/admin-visuals";
import type { VisualProviderStatus } from "@/lib/visuals/providers";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

const ASSET_TYPES = ["family_card", "family_hero", "guide_diagram", "template_preview", "tool_preview", "social_og"] as const;

type Props = { frameworkId: string; recipeLabel: string | null; providerStatuses: VisualProviderStatus[] };

/**
 * Covers two of the three source paths spec §9.12 point 4 lists — "generate" (bounded, via the
 * server-side provider) and "upload" (MIME/size validated). "Render a deterministic preview" is
 * deliberately not a generic control here: it needs per-output custom illustration code (see
 * src/lib/visuals/render/product-idea-assessor-family.ts, built as a one-off script for the
 * single family that has one so far) rather than a form anyone can drive — see
 * docs/decisions/0048-admin-visuals-workspace.md's Follow-up.
 */
export function VisualCreateForm({ frameworkId, recipeLabel, providerStatuses }: Props) {
  const [source, setSource] = useState<"generate" | "upload">("generate");
  const [assetType, setAssetType] = useState<(typeof ASSET_TYPES)[number]>("family_hero");
  const [provider, setProvider] = useState<string>(
    () => providerStatuses.find((p) => p.enabled)?.key ?? providerStatuses[0]?.key ?? "test",
  );
  const [objective, setObjective] = useState("");
  const [subject, setSubject] = useState("");
  const [inputConcepts, setInputConcepts] = useState("");
  const [outcomeConcept, setOutcomeConcept] = useState("");
  const [compositionHint, setCompositionHint] = useState("");
  const [notes, setNotes] = useState("");
  const [candidateCount, setCandidateCount] = useState(3);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const sourceGenerateId = useId();
  const sourceUploadId = useId();

  function buildBrief() {
    return {
      objective,
      subject,
      inputConcepts: inputConcepts
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      outcomeConcept: outcomeConcept || undefined,
      compositionHint: compositionHint || undefined,
      assetType,
      notes: notes || undefined,
    };
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const brief = buildBrief();

    startTransition(async () => {
      if (source === "generate") {
        const result = await generateVisualCandidatesAction({
          frameworkId,
          assetType,
          brief,
          candidateCount,
          provider: provider as "test" | "openai",
        });
        if (result.status === "success") {
          setMessage({ kind: "success", text: `${candidateCount} candidate(s) generated.` });
        } else {
          setMessage({ kind: "error", text: result.message });
        }
        return;
      }

      const fileInput = formRef.current?.elements.namedItem("file") as HTMLInputElement | null;
      const file = fileInput?.files?.[0];
      if (!file) {
        setMessage({ kind: "error", text: "Choose an image to upload." });
        return;
      }
      const formData = new FormData();
      formData.set("frameworkId", frameworkId);
      formData.set("assetType", assetType);
      formData.set("brief", JSON.stringify(brief));
      formData.set("file", file);
      const result = await uploadVisualCandidateAction(formData);
      if (result.status === "success") {
        setMessage({ kind: "success", text: "Uploaded as a new candidate." });
        formRef.current?.reset();
      } else {
        setMessage({ kind: "error", text: result.message });
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 rounded-md border border-ink-200 bg-paper-raised p-4">
      <p className="text-sm text-ink-500">
        Active Visual Recipe: <span className="font-medium text-ink-900">{recipeLabel ?? "none approved yet"}</span>
      </p>

      <div className="flex items-center gap-4 text-sm">
        <label htmlFor={sourceGenerateId} className="flex items-center gap-2">
          <input
            id={sourceGenerateId}
            type="radio"
            name="source"
            checked={source === "generate"}
            onChange={() => setSource("generate")}
          />
          Generate
        </label>
        <label htmlFor={sourceUploadId} className="flex items-center gap-2">
          <input
            id={sourceUploadId}
            type="radio"
            name="source"
            checked={source === "upload"}
            onChange={() => setSource("upload")}
          />
          Upload
        </label>
      </div>

      {source === "generate" ? (
        <FormField label="Provider">
          {(fieldProps) => (
            <Select {...fieldProps} value={provider} onChange={(e) => setProvider(e.target.value)}>
              {providerStatuses.map((status) => (
                <option key={status.key} value={status.key} disabled={!status.enabled}>
                  {status.label}
                  {status.enabled ? (status.modelLabel ? ` (${status.modelLabel})` : "") : ` — ${status.disabledReason}`}
                </option>
              ))}
            </Select>
          )}
        </FormField>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Asset type">
          {(fieldProps) => (
            <Select {...fieldProps} value={assetType} onChange={(e) => setAssetType(e.target.value as typeof assetType)}>
              {ASSET_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField label="Subject">
          {(fieldProps) => <Input {...fieldProps} value={subject} onChange={(e) => setSubject(e.target.value)} required />}
        </FormField>
      </div>

      <FormField label="Objective" hint="What should the visitor understand from this image?">
        {(fieldProps) => (
          <Textarea {...fieldProps} value={objective} onChange={(e) => setObjective(e.target.value)} required className="min-h-20" />
        )}
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Input concepts" hint="Comma-separated, 0-4 short concepts.">
          {(fieldProps) => <Input {...fieldProps} value={inputConcepts} onChange={(e) => setInputConcepts(e.target.value)} />}
        </FormField>
        <FormField label="Outcome concept (optional)">
          {(fieldProps) => <Input {...fieldProps} value={outcomeConcept} onChange={(e) => setOutcomeConcept(e.target.value)} />}
        </FormField>
        <FormField label="Composition hint (optional)" hint="e.g. convergence, sequence, matrix, funnel, before/after.">
          {(fieldProps) => <Input {...fieldProps} value={compositionHint} onChange={(e) => setCompositionHint(e.target.value)} />}
        </FormField>
        {source === "generate" ? (
          <FormField label="Candidate count" hint="Bounded 1-4.">
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="number"
                min={1}
                max={4}
                value={candidateCount}
                onChange={(e) => setCandidateCount(Math.min(4, Math.max(1, Number(e.target.value) || 1)))}
              />
            )}
          </FormField>
        ) : (
          <FormField label="Image file" hint="Max 10MB.">
            {(fieldProps) => <input {...fieldProps} type="file" name="file" accept="image/*" className="text-sm text-ink-700" />}
          </FormField>
        )}
      </div>

      <FormField label="Editor notes (optional)" hint="Not automatically exposed publicly.">
        {(fieldProps) => <Input {...fieldProps} value={notes} onChange={(e) => setNotes(e.target.value)} />}
      </FormField>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Working…" : source === "generate" ? "Generate candidates" : "Upload"}
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
