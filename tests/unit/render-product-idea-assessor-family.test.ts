import { describe, expect, it } from "vitest";
import { renderProductIdeaAssessorFamilySvg } from "@/lib/visuals/render/product-idea-assessor-family";

describe("renderProductIdeaAssessorFamilySvg", () => {
  it("is deterministic — identical output on repeated calls", () => {
    expect(renderProductIdeaAssessorFamilySvg()).toBe(renderProductIdeaAssessorFamilySvg());
  });

  it("produces a well-formed SVG with a 4:3 viewBox", () => {
    const svg = renderProductIdeaAssessorFamilySvg();
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 800 600"/);
    expect(svg.trim().endsWith("</svg>")).toBe(true);
  });

  it("contains no <text> elements — purely iconographic, per spec §11.9", () => {
    const svg = renderProductIdeaAssessorFamilySvg();
    expect(svg).not.toContain("<text");
  });

  it("draws three note cards converging into one result card", () => {
    const svg = renderProductIdeaAssessorFamilySvg();
    expect(svg.match(/rx="14"/g)).toHaveLength(3);
    expect(svg).toContain('rx="20"');
    expect(svg.match(/<path d="M\d+,\d+ Q/g)).toHaveLength(2);
  });
});
