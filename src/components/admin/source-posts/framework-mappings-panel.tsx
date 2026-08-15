"use client";

import { useState, useTransition } from "react";
import {
  addFrameworkMappingAction,
  createFrameworkCandidateFromSuggestionAction,
  removeFrameworkMappingAction,
} from "@/server/actions/admin-source-posts";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { AdminFrameworkLink } from "@/server/admin/source-posts";
import type { ContributionType, SourceUseType, SuggestedFrameworkMapping } from "@/lib/source-mapping/schema";

const CONTRIBUTION_TYPES: ContributionType[] = ["primary_method", "supporting_method", "example", "evidence", "background"];
const USE_TYPES: SourceUseType[] = ["guide", "template", "tool"];

type Props = {
  sourcePostId: string;
  assessmentId: string | null;
  existingLinks: AdminFrameworkLink[];
  suggestedFrameworks: SuggestedFrameworkMapping[];
  frameworks: { id: string; name: string; slug: string }[];
  linkedFrameworkIds: string[];
};

export function FrameworkMappingsPanel({
  sourcePostId,
  assessmentId,
  existingLinks,
  suggestedFrameworks,
  frameworks,
  linkedFrameworkIds,
}: Props) {
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const [manualFrameworkId, setManualFrameworkId] = useState(frameworks[0]?.id ?? "");
  const [manualContribution, setManualContribution] = useState<ContributionType>("supporting_method");
  const [manualUses, setManualUses] = useState<SourceUseType[]>(["template"]);

  const [candidateName, setCandidateName] = useState("");
  const [candidateOutcome, setCandidateOutcome] = useState("");
  const [candidateOpen, setCandidateOpen] = useState(false);

  function toggleManualUse(use: SourceUseType) {
    setManualUses((prev) => (prev.includes(use) ? prev.filter((u) => u !== use) : [...prev, use]));
  }

  function acceptSuggestion(suggestion: SuggestedFrameworkMapping) {
    if (!suggestion.frameworkId) return;
    setMessage(null);
    startTransition(async () => {
      const result = await addFrameworkMappingAction({
        sourcePostId,
        frameworkId: suggestion.frameworkId!,
        sourceAssessmentId: assessmentId,
        contributionType: suggestion.contributionType,
        outputUses: suggestion.outputUses,
        mappingOrigin: "accepted_suggestion",
      });
      setMessage(
        result.status === "success" ? { kind: "success", text: "Mapping added." } : { kind: "error", text: result.message },
      );
    });
  }

  function addManual() {
    if (!manualFrameworkId || manualUses.length === 0) return;
    setMessage(null);
    startTransition(async () => {
      const result = await addFrameworkMappingAction({
        sourcePostId,
        frameworkId: manualFrameworkId,
        sourceAssessmentId: assessmentId,
        contributionType: manualContribution,
        outputUses: manualUses,
        mappingOrigin: "manual",
      });
      setMessage(
        result.status === "success" ? { kind: "success", text: "Mapping added." } : { kind: "error", text: result.message },
      );
    });
  }

  function remove(frameworkId: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await removeFrameworkMappingAction({ sourcePostId, frameworkId });
      setMessage(
        result.status === "success" ? { kind: "success", text: "Mapping removed." } : { kind: "error", text: result.message },
      );
    });
  }

  function createCandidate() {
    if (!candidateName.trim() || !candidateOutcome.trim()) return;
    setMessage(null);
    startTransition(async () => {
      const result = await createFrameworkCandidateFromSuggestionAction({
        sourcePostId,
        sourceAssessmentId: assessmentId,
        name: candidateName.trim(),
        outcomeStatement: candidateOutcome.trim(),
        sourceNote: `Created from A Bit Gamey source post "${sourcePostId}".`,
        outputUses: manualUses.length > 0 ? manualUses : ["template"],
      });
      if (result.status === "success") {
        setMessage({ kind: "success", text: "Framework candidate created (status: candidate, not published)." });
        setCandidateOpen(false);
        setCandidateName("");
        setCandidateOutcome("");
      } else {
        setMessage({ kind: "error", text: result.message });
      }
    });
  }

  const unlinkedFrameworks = frameworks.filter((f) => !linkedFrameworkIds.includes(f.id));

  return (
    <div className="space-y-5">
      {existingLinks.length > 0 ? (
        <ul className="space-y-2">
          {existingLinks.map((link) => (
            <li key={link.frameworkId} className="flex items-center justify-between rounded-md border border-ink-200 p-3 text-sm">
              <div>
                <span className="font-medium text-ink-900">{link.frameworkName}</span>{" "}
                <span className="text-ink-500">
                  · {link.contributionType} · {link.outputUses.join(", ")} · {link.mappingOrigin}
                </span>
              </div>
              <Button type="button" variant="ghost" disabled={isPending} onClick={() => remove(link.frameworkId)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-500">No framework mappings yet.</p>
      )}

      {suggestedFrameworks.filter((s) => s.frameworkId && !linkedFrameworkIds.includes(s.frameworkId)).length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-ink-700">Suggested frameworks</h3>
          {suggestedFrameworks
            .filter((s) => s.frameworkId && !linkedFrameworkIds.includes(s.frameworkId))
            .map((suggestion) => {
              const framework = frameworks.find((f) => f.id === suggestion.frameworkId);
              return (
                <div key={suggestion.frameworkId} className="flex items-center justify-between rounded-md bg-paper-raised p-3 text-sm">
                  <div>
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">Suggested</span>{" "}
                    <span className="font-medium text-ink-900">{framework?.name ?? suggestion.frameworkId}</span>{" "}
                    <span className="text-ink-500">
                      · {suggestion.contributionType} · confidence {Math.round(suggestion.confidence * 100)}%
                    </span>
                    <p className="text-ink-500">{suggestion.rationale}</p>
                  </div>
                  <Button type="button" variant="secondary" disabled={isPending} onClick={() => acceptSuggestion(suggestion)}>
                    Accept
                  </Button>
                </div>
              );
            })}
        </div>
      ) : null}

      <div className="space-y-2 rounded-md border border-ink-200 p-3">
        <h3 className="text-sm font-medium text-ink-700">Add a framework mapping</h3>
        <div className="flex flex-wrap items-end gap-2">
          <Select aria-label="Framework" value={manualFrameworkId} onChange={(e) => setManualFrameworkId(e.target.value)} className="w-auto min-w-48">
            {unlinkedFrameworks.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Contribution type"
            value={manualContribution}
            onChange={(e) => setManualContribution(e.target.value as ContributionType)}
            className="w-auto min-w-40"
          >
            {CONTRIBUTION_TYPES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          {USE_TYPES.map((use) => (
            <label key={use} className="flex items-center gap-1 text-sm text-ink-900">
              <input type="checkbox" checked={manualUses.includes(use)} onChange={() => toggleManualUse(use)} />
              {use}
            </label>
          ))}
          <Button type="button" variant="secondary" disabled={isPending || !manualFrameworkId} onClick={addManual}>
            Add
          </Button>
        </div>
      </div>

      <div className="space-y-2 rounded-md border border-ink-200 p-3">
        {candidateOpen ? (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-ink-700">Create framework candidate from this post</h3>
            <Input aria-label="Framework name" placeholder="Framework name" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} />
            <Input
              aria-label="Outcome statement"
              placeholder="Outcome statement"
              value={candidateOutcome}
              onChange={(e) => setCandidateOutcome(e.target.value)}
            />
            <div className="flex gap-2">
              <Button type="button" variant="secondary" disabled={isPending} onClick={createCandidate}>
                Create candidate
              </Button>
              <Button type="button" variant="ghost" onClick={() => setCandidateOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button type="button" variant="ghost" onClick={() => setCandidateOpen(true)}>
            Create framework candidate from suggestion
          </Button>
        )}
      </div>

      {message ? (
        <p role="status" className={message.kind === "error" ? "text-sm text-red-700" : "text-sm text-brand-700"}>
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
