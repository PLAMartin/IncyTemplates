import { describe, expect, it } from "vitest";
import { scoreProductNamingSystem } from "@/lib/tools/product-naming-system/scoring";
import type { ProductNamingSystemInput } from "@/lib/tools/product-naming-system/schema";

const baseInput = (overrides: Partial<ProductNamingSystemInput> = {}): ProductNamingSystemInput => ({
  nameAMemorability: "medium",
  nameAClarity: "medium",
  nameADistinctiveness: "medium",
  nameAAvailability: "fully_available",
  nameBMemorability: "medium",
  nameBClarity: "medium",
  nameBDistinctiveness: "medium",
  nameBAvailability: "fully_available",
  ...overrides,
});

describe("scoreProductNamingSystem — score boundary conditions", () => {
  it("all-high scores 100 and all-low scores 20 (plain average of the three ratings)", () => {
    const result = scoreProductNamingSystem(
      baseInput({
        nameAMemorability: "high",
        nameAClarity: "high",
        nameADistinctiveness: "high",
        nameBMemorability: "low",
        nameBClarity: "low",
        nameBDistinctiveness: "low",
      }),
    );
    expect(result.nameAScore).toBe(100);
    expect(result.nameBScore).toBe(20);
  });

  it("a clear score gap recommends the stronger name when both are usable", () => {
    const result = scoreProductNamingSystem(
      baseInput({
        nameAMemorability: "high",
        nameAClarity: "high",
        nameADistinctiveness: "high",
        nameBMemorability: "low",
        nameBClarity: "low",
        nameBDistinctiveness: "low",
      }),
    );
    expect(result.recommendation).toBe("name_a");
    expect(result.guidance).toContain("100");
    expect(result.guidance).toContain("20");
  });

  it("the same gap in reverse recommends name B", () => {
    const result = scoreProductNamingSystem(
      baseInput({
        nameAMemorability: "low",
        nameAClarity: "low",
        nameADistinctiveness: "low",
        nameBMemorability: "high",
        nameBClarity: "high",
        nameBDistinctiveness: "high",
      }),
    );
    expect(result.recommendation).toBe("name_b");
  });

  it("equal scores from different rating combinations are too close to call", () => {
    // Both average to 73 (round((100+60+60)/3) and round((60+100+60)/3)) via different
    // individual ratings — the comparison operates on the derived score, not raw equality.
    const result = scoreProductNamingSystem(
      baseInput({
        nameAMemorability: "high",
        nameAClarity: "medium",
        nameADistinctiveness: "medium",
        nameBMemorability: "medium",
        nameBClarity: "high",
        nameBDistinctiveness: "medium",
      }),
    );
    expect(result.nameAScore).toBe(result.nameBScore);
    expect(result.recommendation).toBe("too_close_to_call");
  });
});

describe("scoreProductNamingSystem — availability is a hard gate, not a weighted input", () => {
  it("a strictly stronger name loses if it's taken everywhere", () => {
    const result = scoreProductNamingSystem(
      baseInput({
        nameAMemorability: "high",
        nameAClarity: "high",
        nameADistinctiveness: "high",
        nameAAvailability: "taken_everywhere",
        nameBMemorability: "low",
        nameBClarity: "low",
        nameBDistinctiveness: "low",
        nameBAvailability: "fully_available",
      }),
    );
    expect(result.nameAScore).toBeGreaterThan(result.nameBScore);
    expect(result.nameAUsable).toBe(false);
    expect(result.recommendation).toBe("name_b");
    expect(result.guidance.toLowerCase()).toContain("wins by default");
  });

  it("both names taken everywhere is 'neither usable', regardless of scores", () => {
    const result = scoreProductNamingSystem(baseInput({ nameAAvailability: "taken_everywhere", nameBAvailability: "taken_everywhere" }));
    expect(result.recommendation).toBe("neither_usable");
  });

  it("availability never changes the score number itself, only the recommendation", () => {
    const available = scoreProductNamingSystem(baseInput({ nameAAvailability: "fully_available" }));
    const taken = scoreProductNamingSystem(baseInput({ nameAAvailability: "taken_everywhere" }));
    expect(available.nameAScore).toBe(taken.nameAScore);
  });

  it("partially_available counts as usable, same as fully_available", () => {
    const result = scoreProductNamingSystem(
      baseInput({
        nameAMemorability: "high",
        nameAClarity: "high",
        nameADistinctiveness: "high",
        nameAAvailability: "partially_available",
      }),
    );
    expect(result.nameAUsable).toBe(true);
    expect(result.recommendation).toBe("name_a");
  });
});

describe("scoreProductNamingSystem — determinism", () => {
  it("the same input always produces the same result", () => {
    const input = baseInput({ nameAMemorability: "high", nameBAvailability: "taken_everywhere" });
    expect(scoreProductNamingSystem(input)).toEqual(scoreProductNamingSystem(input));
  });
});
