import { CircleCheck } from "lucide-react";
import type { QualityStandard } from "@/types/catalogue";

const LABELS: Record<keyof QualityStandard, string> = {
  purpose: "Clear purpose",
  inputs: "Required inputs listed",
  instructions: "Plain-English instructions",
  completedExample: "Completed example included",
  thinkingPrompts: "Thinking prompts",
  evidenceFields: "Assumption/evidence distinction",
  decisionOutcome: "Leads to a decision outcome",
  nextStep: "Recommended next step",
  reviewDate: "Review date",
  aiAgentEdition: "AI-agent-ready edition",
  facilitatorEdition: "Facilitator edition",
};

/** Spec §38: Incy Quality Standard indicators. Only shows the flags that are actually true — no false claims. */
export function QualityStandardList({ qualityStandard }: { qualityStandard: QualityStandard }) {
  const activeEntries = (Object.keys(LABELS) as (keyof QualityStandard)[]).filter((key) => qualityStandard[key]);

  if (activeEntries.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-ink-900">Incy Quality Standard</h2>
      <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {activeEntries.map((key) => (
          <li key={key} className="flex items-center gap-2 text-sm text-ink-700">
            <CircleCheck aria-hidden className="size-4 shrink-0 text-brand-600" />
            {LABELS[key]}
          </li>
        ))}
      </ul>
    </div>
  );
}
