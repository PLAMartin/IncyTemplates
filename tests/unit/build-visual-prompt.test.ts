import { describe, expect, it } from "vitest";
import { buildVisualPrompt } from "@/lib/visuals/build-visual-prompt";
import type { VisualGenerationOptions } from "@/lib/visuals/providers/types";
import type { VisualGenerationRequest } from "@/lib/visuals/types";

const baseRequest: VisualGenerationRequest = {
  assetType: "family_card",
  brief: {
    objective: "Show three fragmented notes converging into one scored decision",
    subject: "Product Idea Assessor",
    inputConcepts: ["Copy", "Improve", "Differentiate"],
    outcomeConcept: "Readiness score",
    compositionHint: "convergence",
    allowedShortLabels: ["Score"],
    forbiddenContent: ["logos", "real screenshots"],
    assetType: "family_card",
    notes: "Keep it calm, not busy.",
  },
  recipe: {
    id: "11111111-1111-1111-1111-111111111111",
    recipeKey: "incytemplates-v1",
    version: 1,
    name: "IncyTemplates Visual Recipe v1",
    status: "approved",
    configData: {
      backgroundToken: "--color-paper",
      primaryToken: "--color-ink-900",
      structuralAccentToken: "--color-brand-500",
      supportingAccentTokens: ["--color-accent-amber-500"],
      surfaceTokens: ["--color-brand-100"],
      style: ["flat 2D"],
      avoid: ["photorealism"],
    },
    promptTemplate: null,
  },
};

const baseOptions: VisualGenerationOptions = { provider: "test", candidateCount: 2 };

describe("buildVisualPrompt", () => {
  it("includes recipe style/avoid guidance when no promptTemplate is set", () => {
    const prompt = buildVisualPrompt(baseRequest, baseOptions);
    expect(prompt).toContain("flat 2D");
    expect(prompt).toContain("Avoid: photorealism");
  });

  it("prefers an explicit recipe.promptTemplate over synthesised guidance", () => {
    const request = { ...baseRequest, recipe: { ...baseRequest.recipe, promptTemplate: "Use the exact house style." } };
    const prompt = buildVisualPrompt(request, baseOptions);
    expect(prompt).toContain("Use the exact house style.");
    expect(prompt).not.toContain("Avoid: photorealism");
  });

  it("includes brief objective, input concepts and outcome concept", () => {
    const prompt = buildVisualPrompt(baseRequest, baseOptions);
    expect(prompt).toContain(baseRequest.brief.objective);
    expect(prompt).toContain("Copy, Improve, Differentiate");
    expect(prompt).toContain("Readiness score");
  });

  it("includes allowed short labels and forbidden content constraints", () => {
    const prompt = buildVisualPrompt(baseRequest, baseOptions);
    expect(prompt).toContain("Score");
    expect(prompt).toContain("logos, real screenshots");
  });

  it("includes output-profile guidance for each profile", () => {
    expect(buildVisualPrompt(baseRequest, { ...baseOptions, outputProfile: "square" })).toContain("square frame");
    expect(buildVisualPrompt(baseRequest, { ...baseOptions, outputProfile: "portrait" })).toContain("portrait frame");
    expect(buildVisualPrompt(baseRequest, { ...baseOptions, outputProfile: "family_landscape" })).toContain("landscape frame");
  });

  it("always ends with the no-long-text/no-logo reminder", () => {
    const prompt = buildVisualPrompt(baseRequest, baseOptions);
    expect(prompt).toContain("Do not include long paragraphs of text, brand logos");
  });
});
