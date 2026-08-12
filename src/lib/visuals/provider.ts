import type { GeneratedVisualCandidate, VisualGenerationProvider, VisualGenerationRequest } from "./types";

/**
 * No production image-generation provider is selected yet (spec §44 item 25: "Select the
 * production image-generation provider ... the architecture must remain provider-neutral").
 * This mock satisfies the `VisualGenerationProvider` interface so the rest of the pipeline
 * (staging, selection, approval, publish, derivative generation) can be built and tested
 * against it now, matching spec §45's explicit allowance: "a mocked/no-op provider is
 * acceptable in the first milestone if production generation is deferred." Swapping in a real
 * provider later means implementing this interface again, not changing any calling code.
 *
 * Returns a flat SVG placeholder per candidate — a real, decodable image (not a stub error),
 * so the staging/selection/approval UI has something genuine to render while no real provider
 * is wired up.
 */
export class MockVisualGenerationProvider implements VisualGenerationProvider {
  async generate(request: VisualGenerationRequest): Promise<GeneratedVisualCandidate[]> {
    const candidates: GeneratedVisualCandidate[] = [];
    for (let i = 0; i < request.candidateCount; i += 1) {
      const svg = renderPlaceholderSvg(request, i);
      candidates.push({
        bytes: new TextEncoder().encode(svg),
        mimeType: "image/svg+xml",
        provider: "mock",
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
  <text x="600" y="300" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#3a3733">Mock candidate ${index + 1}</text>
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
