"use client";

import { useEffect } from "react";
import { recordCompletion, recordVisit, type OutputType } from "@/lib/progress/collection-progress";
import { trackEvent } from "@/lib/analytics/track";

type Props = { collectionSlug: string; frameworkSlug: string; outputType: OutputType };

const VISIT_EVENT: Record<OutputType, string> = {
  guide: "view_guide",
  template: "view_template",
  tool: "view_tool",
};

/** Mount on a Guide/Template/Tool page for a Core Collection family to record "where you are" — never completion. */
export function RecordProgressVisit({ collectionSlug, frameworkSlug, outputType }: Props) {
  useEffect(() => {
    recordVisit({ collectionSlug, frameworkSlug, outputType });
    trackEvent(VISIT_EVENT[outputType], { framework_slug: frameworkSlug, product_type: outputType });
  }, [collectionSlug, frameworkSlug, outputType]);
  return null;
}

/**
 * Mount only where a concrete completion actually just happened (a Tool result, a real Template
 * view). Also fires spec §25.2's complete_core_step alongside the more specific complete_tool/
 * complete_free_download event — same real signal, both names the funnel vocabulary expects.
 */
export function RecordProgressCompletion({ collectionSlug, frameworkSlug, outputType }: Props) {
  useEffect(() => {
    recordCompletion({ collectionSlug, frameworkSlug, outputType });
    const props = { framework_slug: frameworkSlug, product_type: outputType };
    if (outputType === "tool") {
      trackEvent("complete_tool", props);
      trackEvent("view_tool_result", props);
    } else if (outputType === "template") {
      trackEvent("complete_free_download", props);
    }
    trackEvent("complete_core_step", props);
  }, [collectionSlug, frameworkSlug, outputType]);
  return null;
}
