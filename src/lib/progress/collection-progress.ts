/**
 * Anonymous, privacy-safe local progress state for the active Core Collection (spec v9 §9.3,
 * §12.3.2). Deliberately the exact shape spec §9.3 gives, nothing more:
 *
 *   collection_slug
 *   last_framework_slug
 *   last_output_type
 *   completed_framework_slugs[]
 *   last_visited_at
 *
 * MUST NEVER be extended to hold Tool free text, Tool results, interview notes or any other
 * user-authored content — this is a navigation/completion signal only. Lives in `localStorage`,
 * never sent to a server; every read/write is wrapped in try/catch and no-ops outside the
 * browser or when storage is unavailable (private browsing, disabled storage) — recording
 * progress must never be allowed to break the page it's called from.
 *
 * Switching `collection_slug` resets `completed_framework_slugs`: this shape tracks one active
 * journey at a time, matching spec's own singular (not per-collection-keyed) example — there is
 * only one Collection today, and re-scoping if a second one ever launches is a deliberate future
 * change, not silent data corruption.
 */

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "it_collection_progress_v1";

export type OutputType = "guide" | "template" | "tool";

export type CollectionProgress = {
  collection_slug: string;
  last_framework_slug: string;
  last_output_type: OutputType;
  completed_framework_slugs: string[];
  last_visited_at: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCollectionProgress(value: unknown): value is CollectionProgress {
  return (
    isRecord(value) &&
    typeof value.collection_slug === "string" &&
    typeof value.last_framework_slug === "string" &&
    (value.last_output_type === "guide" || value.last_output_type === "template" || value.last_output_type === "tool") &&
    Array.isArray(value.completed_framework_slugs) &&
    value.completed_framework_slugs.every((s) => typeof s === "string") &&
    typeof value.last_visited_at === "string"
  );
}

// `readProgress`'s result is cached against the raw stored string so `useSyncExternalStore`
// (see `useCollectionProgress` below) gets a referentially-stable snapshot when nothing has
// actually changed — required to avoid an infinite re-render loop / React's "getSnapshot should
// be cached" warning, since re-parsing JSON fresh every call would otherwise return a new object
// identity on every render even when the stored value is unchanged.
let cachedRaw: string | null = null;
let cachedValue: CollectionProgress | null = null;

export function readProgress(): CollectionProgress | null {
  if (typeof window === "undefined") return null;
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    cachedValue = isCollectionProgress(parsed) ? parsed : null;
  } catch {
    cachedValue = null;
  }
  return cachedValue;
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  // The `storage` event only fires in *other* tabs/windows, not the one that wrote the value —
  // there is no same-tab "localStorage changed" browser event. That's an accepted limitation
  // here: this progress state only needs to be correct on next navigation/mount, not live-synced
  // within one open tab, so cross-tab sync is a reasonable bonus rather than the point.
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getServerSnapshot(): CollectionProgress | null {
  return null;
}

/** React-idiomatic external-store read (spec v9 §9.3) — avoids the setState-in-effect anti-pattern for reading a browser-only API into render. */
export function useCollectionProgress(): CollectionProgress | null {
  return useSyncExternalStore(subscribe, readProgress, getServerSnapshot);
}

type RecordInput = { collectionSlug: string; frameworkSlug: string; outputType: OutputType };

function priorCompletedSlugs(collectionSlug: string): string[] {
  const existing = readProgress();
  return existing && existing.collection_slug === collectionSlug ? existing.completed_framework_slugs : [];
}

function write(input: RecordInput, completedFrameworkSlugs: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const next: CollectionProgress = {
      collection_slug: input.collectionSlug,
      last_framework_slug: input.frameworkSlug,
      last_output_type: input.outputType,
      completed_framework_slugs: completedFrameworkSlugs,
      last_visited_at: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private browsing, quota, disabled) — never block the page for this.
  }
}

/** Visiting a Guide/Template/Tool page for a Core Collection family — updates "where you are", not completion. */
export function recordVisit(input: RecordInput): void {
  write(input, priorCompletedSlugs(input.collectionSlug));
}

/** A concrete, real completion signal (a Tool reaching its result, a Template successfully viewed/downloaded). */
export function recordCompletion(input: RecordInput): void {
  const completed = new Set(priorCompletedSlugs(input.collectionSlug));
  completed.add(input.frameworkSlug);
  write(input, [...completed]);
}
