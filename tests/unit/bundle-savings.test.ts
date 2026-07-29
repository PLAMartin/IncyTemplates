import { describe, expect, it } from "vitest";
import { calculateBundleSaving, formatMinorUnits } from "@/lib/money/bundle-savings";

describe("calculateBundleSaving", () => {
  it("calculates a genuine saving", () => {
    const result = calculateBundleSaving([900, 900, 900], 2000);
    expect(result.combinedPriceMinor).toBe(2700);
    expect(result.bundlePriceMinor).toBe(2000);
    expect(result.savingMinor).toBe(700);
    expect(result.hasSaving).toBe(true);
    expect(result.savingPercent).toBeCloseTo(700 / 2700);
  });

  it("never reports a negative saving when the bundle costs more than its parts", () => {
    const result = calculateBundleSaving([500, 500], 2000);
    expect(result.savingMinor).toBe(0);
    expect(result.hasSaving).toBe(false);
  });

  it("reports no saving when there is nothing to compare against", () => {
    const result = calculateBundleSaving([], 0);
    expect(result.combinedPriceMinor).toBe(0);
    expect(result.hasSaving).toBe(false);
    expect(result.savingPercent).toBe(0);
  });

  it("treats an equal price as no saving, not a fabricated one", () => {
    const result = calculateBundleSaving([1000, 1000], 2000);
    expect(result.savingMinor).toBe(0);
    expect(result.hasSaving).toBe(false);
  });

  it("includes free (0-price) items in the combined total without special-casing", () => {
    const result = calculateBundleSaving([0, 900, 900], 1000);
    expect(result.combinedPriceMinor).toBe(1800);
    expect(result.savingMinor).toBe(800);
  });
});

describe("formatMinorUnits", () => {
  it("formats GBP minor units as a currency string", () => {
    expect(formatMinorUnits(3900)).toBe("£39.00");
  });

  it("formats zero", () => {
    expect(formatMinorUnits(0)).toBe("£0.00");
  });
});
