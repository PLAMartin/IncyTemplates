import { describe, expect, it } from "vitest";
import { TestVisualGenerationProvider } from "@/lib/visuals/providers/test-provider";
import type { VisualGenerationOptions } from "@/lib/visuals/providers/types";
import type { VisualGenerationRequest } from "@/lib/visuals/types";

const baseRequest: VisualGenerationRequest = {
  assetType: "family_card",
  brief: {
    objective: "Show three fragmented notes converging into one scored decision",
    subject: "Product Idea Assessor",
    assetType: "family_card",
  },
  recipe: {
    id: "11111111-1111-1111-1111-111111111111",
    recipeKey: "incytemplates-v1",
    version: 1,
    name: "IncyTemplates Visual Recipe v1",
    status: "draft",
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

const baseOptions: VisualGenerationOptions = { provider: "test", candidateCount: 3 };

describe("TestVisualGenerationProvider", () => {
  it("reports its key and capabilities", () => {
    const provider = new TestVisualGenerationProvider();
    expect(provider.key).toBe("test");
    expect(provider.capabilities()).toEqual({
      textToImage: true,
      imageEdit: false,
      referenceImages: false,
      transparentBackground: false,
    });
  });

  it("returns exactly options.candidateCount candidates", async () => {
    const provider = new TestVisualGenerationProvider();
    const candidates = await provider.generate(baseRequest, baseOptions);
    expect(candidates).toHaveLength(3);
  });

  it("returns decodable SVG bytes tagged with the test provider", async () => {
    const provider = new TestVisualGenerationProvider();
    const candidate = (await provider.generate(baseRequest, { ...baseOptions, candidateCount: 1 })).at(0)!;
    expect(candidate.provider).toBe("test");
    expect(candidate.mimeType).toBe("image/svg+xml");
    const text = new TextDecoder().decode(candidate.bytes);
    expect(text).toContain("<svg");
    expect(text).toContain(baseRequest.brief.objective);
  });

  it("escapes XML-unsafe characters in the brief objective", async () => {
    const provider = new TestVisualGenerationProvider();
    const candidate = (
      await provider.generate(
        { ...baseRequest, brief: { ...baseRequest.brief, objective: "A <script> & \"quotes\" 'here'" } },
        { ...baseOptions, candidateCount: 1 },
      )
    ).at(0)!;
    const text = new TextDecoder().decode(candidate.bytes);
    expect(text).not.toContain("<script>");
    expect(text).toContain("&lt;script&gt;");
  });

  it("returns an empty array when candidateCount is 0", async () => {
    const provider = new TestVisualGenerationProvider();
    const candidates = await provider.generate(baseRequest, { ...baseOptions, candidateCount: 0 });
    expect(candidates).toEqual([]);
  });
});
