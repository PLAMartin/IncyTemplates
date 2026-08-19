"use client";

import { useEffect } from "react";
import { recordCompletion, recordVisit, type OutputType } from "@/lib/progress/collection-progress";

type Props = { collectionSlug: string; frameworkSlug: string; outputType: OutputType };

/** Mount on a Guide/Template/Tool page for a Core Collection family to record "where you are" — never completion. */
export function RecordProgressVisit({ collectionSlug, frameworkSlug, outputType }: Props) {
  useEffect(() => {
    recordVisit({ collectionSlug, frameworkSlug, outputType });
  }, [collectionSlug, frameworkSlug, outputType]);
  return null;
}

/** Mount only where a concrete completion actually just happened (a Tool result, a real Template view). */
export function RecordProgressCompletion({ collectionSlug, frameworkSlug, outputType }: Props) {
  useEffect(() => {
    recordCompletion({ collectionSlug, frameworkSlug, outputType });
  }, [collectionSlug, frameworkSlug, outputType]);
  return null;
}
