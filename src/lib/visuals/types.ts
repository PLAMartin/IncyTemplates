/**
 * Visual Asset System types (spec v5 §11.5-§11.10, §12.6, §14.13). Mirrors
 * `it_visual_asset_type`/`it_visual_source_type`/`it_visual_asset_status` (Postgres enums,
 * 20260812140000_it_visual_asset_enums.sql) as the single TypeScript source of truth, same
 * convention as `PublicVisibility` in `src/types/admin.ts` mirroring `it_public_visibility`.
 */

export type VisualAssetType =
  | "family_card"
  | "family_hero"
  | "guide_diagram"
  | "template_preview"
  | "tool_preview"
  | "social_og";

export type VisualSourceType = "generated" | "uploaded" | "rendered";

export type VisualAssetStatus = "candidate" | "selected" | "approved" | "published" | "archived" | "failed";

/**
 * Structured input to the generation service (spec §11.7). Assembled by the admin Visuals
 * workspace, never hand-written as a full art-direction prompt by an Editor.
 */
export type VisualBrief = {
  objective: string;
  subject: string;
  inputConcepts?: string[];
  processConcept?: string;
  outcomeConcept?: string;
  allowedShortLabels?: string[];
  forbiddenContent?: string[];
  compositionHint?: string;
  assetType: VisualAssetType;
  notes?: string;
};

/**
 * A recipe's `config_data` shape (spec §11.6). References named design tokens from the
 * application theme by name/CSS-variable rather than duplicating raw colour values.
 */
export type VisualRecipeConfig = {
  backgroundToken: string;
  primaryToken: string;
  structuralAccentToken: string;
  supportingAccentTokens: string[];
  surfaceTokens: string[];
  style: string[];
  avoid: string[];
};

export type VisualRecipe = {
  id: string;
  recipeKey: string;
  version: number;
  name: string;
  status: string;
  configData: VisualRecipeConfig;
  promptTemplate: string | null;
};

/**
 * Provider-neutral generation boundary (spec v6 §12.6/§12.7). Provider calls happen server-side
 * only, are never on the critical path for a public page request, and never see anything beyond
 * what's in the request below — no product/framework database access, no secrets beyond
 * whatever the concrete provider implementation holds internally.
 *
 * `candidateCount` (and provider/quality/output-profile choice) lives on
 * `VisualGenerationOptions` (`./providers/types.ts`), not here — this type is "what to draw",
 * options is "how many, how, and with which provider". See that file for the full provider
 * contract (`VisualGenerationProvider`, `VisualProviderCapabilities`, error categories).
 */
export type VisualGenerationRequest = {
  assetType: VisualAssetType;
  brief: VisualBrief;
  recipe: VisualRecipe;
};

export type GeneratedVisualCandidate = {
  bytes: Uint8Array;
  mimeType: string;
  provider: string;
  model?: string;
  providerAssetId?: string;
  metadata?: Record<string, unknown>;
};
