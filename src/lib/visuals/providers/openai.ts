import "server-only";
import { getOpenAiClient } from "@/lib/openai/client";
import { serverEnv } from "@/lib/env/server";
import { buildVisualPrompt } from "../build-visual-prompt";
import type { GeneratedVisualCandidate, VisualGenerationRequest } from "../types";
import { mapOpenAiError } from "./openai-errors";
import { VisualGenerationError, type VisualGenerationOptions, type VisualGenerationProvider, type VisualProviderCapabilities } from "./types";

/**
 * OpenAI adapter (spec v6 §12.7). Reads OPENAI_API_KEY only via getOpenAiClient(); never fetches
 * database/user content itself -- the caller (src/server/admin/visuals.ts) is responsible for
 * everything in `request`. Reference-image/edit support is deliberately not implemented yet
 * (capabilities() reports imageEdit/referenceImages: false) -- spec §12.7 gates it behind "only
 * where the workflow genuinely benefits", and there is no live account to validate that flow
 * against yet (see docs/decisions/0050-openai-visual-provider.md).
 *
 * IMPLEMENTATION NOTE: the images.generate() call shape below (accepted `quality`/`size`
 * values, always-base64 response for GPT image models, no `response_format` param) was checked
 * against the installed `openai` npm package's own TypeScript types
 * (node_modules/openai/resources/images.d.ts) at implementation time, not against a live
 * account -- re-verify against current OpenAI documentation before the first real production
 * generation, per spec §12.7.1.
 */
export class OpenAiVisualGenerationProvider implements VisualGenerationProvider {
  readonly key = "openai" as const;

  capabilities(): VisualProviderCapabilities {
    return { textToImage: true, imageEdit: false, referenceImages: false, transparentBackground: false };
  }

  async generate(request: VisualGenerationRequest, options: VisualGenerationOptions): Promise<GeneratedVisualCandidate[]> {
    const client = getOpenAiClient();
    const prompt = buildVisualPrompt(request, options);
    const model = serverEnv.OPENAI_IMAGE_MODEL_SNAPSHOT || serverEnv.OPENAI_IMAGE_MODEL;
    const quality = qualityFor(options.qualityProfile ?? serverEnv.OPENAI_IMAGE_QUALITY_PROFILE);
    const size = sizeFor(options.outputProfile ?? serverEnv.OPENAI_IMAGE_OUTPUT_PROFILE);

    const startedAt = Date.now();
    const response = await client.images
      .generate({ prompt, model, n: options.candidateCount, quality, size })
      .catch((error: unknown) => {
        throw mapOpenAiError(error);
      });
    const latencyMs = Date.now() - startedAt;

    const images = response.data ?? [];
    if (images.length === 0) {
      throw new VisualGenerationError("unknown", "The provider returned no candidate images.");
    }

    return images.map((image) => {
      if (!image.b64_json) {
        throw new VisualGenerationError("unknown", "The provider returned an image without base64 data.");
      }
      return {
        bytes: new Uint8Array(Buffer.from(image.b64_json, "base64")),
        mimeType: mimeTypeFor(response.output_format),
        provider: this.key,
        model,
        metadata: {
          latencyMs,
          quality: response.quality ?? quality,
          size: response.size ?? size,
          outputFormat: response.output_format ?? "png",
        },
      };
    });
  }
}

function qualityFor(profile: string): "low" | "medium" | "high" {
  switch (profile) {
    case "draft":
      return "low";
    case "high":
      return "high";
    case "standard":
    default:
      return "medium";
  }
}

function sizeFor(profile: string): "1024x1024" | "1536x1024" | "1024x1536" {
  switch (profile) {
    case "square":
      return "1024x1024";
    case "portrait":
      return "1024x1536";
    case "family_landscape":
    default:
      return "1536x1024";
  }
}

function mimeTypeFor(outputFormat: string | undefined): string {
  switch (outputFormat) {
    case "webp":
      return "image/webp";
    case "jpeg":
      return "image/jpeg";
    case "png":
    default:
      return "image/png";
  }
}
