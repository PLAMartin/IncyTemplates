import "server-only";
import { hasOpenAiConfig } from "@/lib/openai/client";
import { serverEnv } from "@/lib/env/server";
import { OpenAiVisualGenerationProvider } from "./openai";
import { TestVisualGenerationProvider } from "./test-provider";
import type { VisualGenerationProvider, VisualProviderKey } from "./types";

export type VisualProviderStatus = {
  key: VisualProviderKey;
  label: string;
  enabled: boolean;
  modelLabel: string | null;
  /** Non-secret reason the provider is unavailable, shown next to a disabled option in the admin UI. */
  disabledReason: string | null;
};

/**
 * Non-secret provider status for the admin dropdown (spec v6 §35.2's `GET
 * /api/admin/visuals/providers`, served as a plain server-side call per §35.1's "Server Actions
 * may replace internal endpoints where cleaner" -- every other admin-visuals read in this repo
 * already works this way, see src/app/admin/visuals/[frameworkId]/page.tsx). Never returns
 * OPENAI_API_KEY or any other secret.
 */
export function listVisualProviderStatuses(): VisualProviderStatus[] {
  const openAiEnabled = serverEnv.VISUAL_GENERATION_ENABLED && hasOpenAiConfig();
  return [
    { key: "test", label: "Test (placeholder)", enabled: true, modelLabel: "placeholder-v1", disabledReason: null },
    {
      key: "openai",
      label: "OpenAI",
      enabled: openAiEnabled,
      modelLabel: serverEnv.OPENAI_IMAGE_MODEL_SNAPSHOT || serverEnv.OPENAI_IMAGE_MODEL,
      disabledReason: openAiEnabled
        ? null
        : !serverEnv.VISUAL_GENERATION_ENABLED
          ? "Visual generation is disabled."
          : "Not configured (no OPENAI_API_KEY).",
    },
  ];
}

/**
 * Resolves a provider instance, or throws a clear config error. Deliberately does NOT fall back
 * to the test provider when the requested provider is unconfigured -- an Editor who explicitly
 * picks OpenAI should see a config error, not placeholder SVGs that look like real output (see
 * docs/decisions/0050-openai-visual-provider.md).
 */
export function resolveVisualGenerationProvider(key: VisualProviderKey): VisualGenerationProvider {
  if (key === "test") return new TestVisualGenerationProvider();
  if (key === "openai") {
    if (!serverEnv.VISUAL_GENERATION_ENABLED) {
      throw new Error("Visual generation is disabled (VISUAL_GENERATION_ENABLED=false).");
    }
    if (!hasOpenAiConfig()) {
      throw new Error("OpenAI provider is not configured: OPENAI_API_KEY is not set.");
    }
    return new OpenAiVisualGenerationProvider();
  }
  throw new Error(`Unknown visual generation provider: ${key}`);
}

/** Reads the deployment-configured default provider (VISUAL_GENERATION_PROVIDER, spec §34). */
export function resolveDefaultVisualGenerationProvider(): VisualProviderKey {
  return serverEnv.VISUAL_GENERATION_PROVIDER;
}

export type { VisualGenerationOptions, VisualGenerationProvider, VisualProviderCapabilities, VisualProviderKey } from "./types";
export { VisualGenerationError } from "./types";
