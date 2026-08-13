import type { GeneratedVisualCandidate, VisualGenerationRequest } from "../types";

/**
 * Provider registry contract (spec v6 §12.7). `"test"` is this repo's renamed `MockVisualGenerationProvider`
 * (was tagged `"mock"` in v5); `"openai"` is the new v6 adapter. The type stays a superset
 * (`| string`) per spec so a future provider doesn't require touching every call site's type.
 */
export type VisualProviderKey = "openai" | "test" | string;

export type VisualQualityProfile = "draft" | "standard" | "high";
export type VisualOutputProfile = "family_landscape" | "square" | "portrait";

export type VisualGenerationOptions = {
  provider: VisualProviderKey;
  candidateCount: number;
  qualityProfile?: VisualQualityProfile;
  outputProfile?: VisualOutputProfile;
  referenceFileIds?: string[];
};

export type VisualProviderCapabilities = {
  textToImage: boolean;
  imageEdit: boolean;
  referenceImages: boolean;
  transparentBackground?: boolean;
};

export interface VisualGenerationProvider {
  key: VisualProviderKey;
  capabilities(): VisualProviderCapabilities;
  generate(request: VisualGenerationRequest, options: VisualGenerationOptions): Promise<GeneratedVisualCandidate[]>;
}

/**
 * Stable error categories a provider adapter must map its own errors onto (spec §12.7). Callers
 * (the admin generate flow, job-lifecycle bookkeeping) branch on `category`, never on a raw
 * provider error string/status code, since those are provider-specific and can change without
 * notice or contain unsafe-to-persist detail.
 */
export type VisualProviderErrorCategory =
  | "rate_limited"
  | "safety_blocked"
  | "invalid_request"
  | "timeout"
  | "provider_unavailable"
  | "unknown";

/**
 * `message` is always a safe, generic, category-based string suitable for persisting in
 * `it_visual_generation_jobs.error_message_safe` or showing an Editor — never the raw provider
 * error text, which can echo back prompt content. The raw error is attached as `cause` only for
 * server-side (non-persisted) diagnostics.
 */
export class VisualGenerationError extends Error {
  readonly category: VisualProviderErrorCategory;

  constructor(category: VisualProviderErrorCategory, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "VisualGenerationError";
    this.category = category;
  }
}
