import type { GeneratedVisualCandidate, VisualGenerationRequest } from "../types";
import type { VisualGenerationOptions, VisualGenerationProvider, VisualProviderCapabilities } from "./types";

/**
 * Always-available placeholder provider (spec v6 §12.7 `test-provider.ts`, was
 * `MockVisualGenerationProvider`/provider `"mock"` in v5's single-provider build). This is the
 * default `VISUAL_GENERATION_PROVIDER` in this repo's `.env` — see
 * docs/decisions/0050-openai-visual-provider.md — since no live `OPENAI_API_KEY` exists yet, and
 * stays selectable afterwards for tests/CI so nothing here ever requires network access or a key.
 *
 * Returns a flat SVG placeholder per candidate — a real, decodable image (not a stub error), so
 * the staging/selection/approval UI has something genuine to render regardless of which real
 * provider is or isn't configured.
 */
export class TestVisualGenerationProvider implements VisualGenerationProvider {
  readonly key = "test" as const;

  capabilities(): VisualProviderCapabilities {
    return { textToImage: true, imageEdit: false, referenceImages: false, transparentBackground: false };
  }

  async generate(request: VisualGenerationRequest, options: VisualGenerationOptions): Promise<GeneratedVisualCandidate[]> {
    const candidates: GeneratedVisualCandidate[] = [];
    for (let i = 0; i < options.candidateCount; i += 1) {
      const svg = renderPlaceholderSvg(request, i);
      candidates.push({
        bytes: new TextEncoder().encode(svg),
        mimeType: "image/svg+xml",
        provider: "test",
        model: "placeholder-v1",
        metadata: { candidateIndex: i, assetType: request.assetType, recipeKey: request.recipe.recipeKey },
      });
    }
    return candidates;
  }
}

function renderPlaceholderSvg(request: VisualGenerationRequest, index: number): string {
  const label = escapeXml(request.brief.objective || request.brief.subject || request.assetType);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f4f1e9"/>
  <rect x="24" y="24" width="1152" height="582" rx="16" fill="none" stroke="#b3ada2" stroke-width="2" stroke-dasharray="8 8"/>
  <text x="600" y="300" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#3a3733">Test candidate ${index + 1}</text>
  <text x="600" y="340" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#6b665f">${label}</text>
</svg>`;
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      default:
        return "&quot;";
    }
  });
}
