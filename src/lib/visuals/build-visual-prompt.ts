import type { VisualAssetType, VisualGenerationRequest } from "./types";
import type { VisualGenerationOptions } from "./providers/types";

/**
 * Assembles the final generation prompt from a Visual Recipe + Visual Brief (spec v6 §12.7.2),
 * in the spec's exact order: recipe instructions, asset-type/composition requirements, brief
 * concepts, allowed labels, forbidden content, output-profile guidance, then a fixed reminder.
 * Editors never hand-write a full art-direction prompt (spec §11.7) -- this is the only place
 * that happens.
 *
 * Pure function, used for every provider (including "test"), so `prompt_snapshot` is populated
 * consistently regardless of which provider actually consumed it.
 */
export function buildVisualPrompt(request: VisualGenerationRequest, options: VisualGenerationOptions): string {
  const sections: string[] = [
    recipeInstructions(request),
    assetTypeGuidance(request.assetType),
    briefConcepts(request),
    allowedLabelsGuidance(request),
    forbiddenContentGuidance(request),
    outputProfileGuidance(options),
    "Do not include long paragraphs of text, brand logos, or an invented product interface — keep any text short and let the surrounding page supply headings and detail.",
  ];
  return sections.filter((section) => section.length > 0).join("\n\n");
}

function recipeInstructions(request: VisualGenerationRequest): string {
  const { recipe } = request;
  if (recipe.promptTemplate) return recipe.promptTemplate;

  const { configData } = recipe;
  const parts = [
    `Visual style: ${configData.style.join(", ")}.`,
    configData.avoid.length > 0 ? `Avoid: ${configData.avoid.join(", ")}.` : "",
    `Background token: ${configData.backgroundToken}; primary token: ${configData.primaryToken}; structural accent token: ${configData.structuralAccentToken}.`,
    configData.supportingAccentTokens.length > 0
      ? `Supporting accent tokens: ${configData.supportingAccentTokens.join(", ")}.`
      : "",
    configData.surfaceTokens.length > 0 ? `Surface tokens: ${configData.surfaceTokens.join(", ")}.` : "",
  ].filter(Boolean);
  return `Recipe "${recipe.name}" v${recipe.version}: ${parts.join(" ")}`;
}

const ASSET_TYPE_GUIDANCE: Record<VisualAssetType, string> = {
  family_card:
    "Compose a simple catalogue-card concept illustration: one dominant idea, generous whitespace, legible at small size.",
  family_hero:
    "Compose a larger family-page illustration in the same visual language as the catalogue card, with room to breathe.",
  guide_diagram: "Compose a clear conceptual diagram explaining one method or concept, not a decorative scene.",
  template_preview:
    "This asset type is normally a real rendered preview of the Template rather than a generated illustration; only generate here if an editor has explicitly chosen an illustrative substitute.",
  tool_preview:
    "This asset type is normally a real captured preview of the Tool interface/result rather than a generated illustration; only generate here if an editor has explicitly chosen an illustrative substitute.",
  social_og:
    "Compose a simple background/concept image suitable for a social share card; typography will be composed separately, not inside this image.",
};

function assetTypeGuidance(assetType: VisualAssetType): string {
  return ASSET_TYPE_GUIDANCE[assetType] ?? "";
}

function briefConcepts(request: VisualGenerationRequest): string {
  const { brief } = request;
  const lines = [
    `Objective: ${brief.objective}`,
    `Subject: ${brief.subject}`,
    brief.inputConcepts && brief.inputConcepts.length > 0 ? `Input concepts: ${brief.inputConcepts.join(", ")}` : "",
    brief.processConcept ? `Process/transformation: ${brief.processConcept}` : "",
    brief.outcomeConcept ? `Outcome: ${brief.outcomeConcept}` : "",
    brief.compositionHint ? `Composition: ${brief.compositionHint}` : "",
    brief.notes ? `Editor notes: ${brief.notes}` : "",
  ].filter(Boolean);
  return lines.join("\n");
}

function allowedLabelsGuidance(request: VisualGenerationRequest): string {
  const labels = request.brief.allowedShortLabels;
  if (!labels || labels.length === 0) return "";
  return `Short labels that may appear in the image, if any: ${labels.join(", ")}.`;
}

function forbiddenContentGuidance(request: VisualGenerationRequest): string {
  const forbidden = request.brief.forbiddenContent;
  if (!forbidden || forbidden.length === 0) return "";
  return `Do not include: ${forbidden.join(", ")}.`;
}

function outputProfileGuidance(options: VisualGenerationOptions): string {
  switch (options.outputProfile) {
    case "square":
      return "Compose for a square frame with balanced whitespace on all sides.";
    case "portrait":
      return "Compose for a portrait frame with safe whitespace top and bottom.";
    case "family_landscape":
    default:
      return "Compose for a landscape frame with safe whitespace on all sides so the image crops cleanly at catalogue-card and hero sizes.";
  }
}
