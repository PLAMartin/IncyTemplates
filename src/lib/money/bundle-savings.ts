/**
 * Bundle saving calculation (spec §10.4: "Saving, where legally and
 * factually accurate"). Pure function, integer-minor-units in and out
 * (spec §14.1) — never do this arithmetic inline in a page component.
 */

export type BundleSaving = {
  /** Sum of each included item's own standalone price, in minor units. */
  combinedPriceMinor: number;
  /** The bundle's own selling price, in minor units. */
  bundlePriceMinor: number;
  /** combinedPriceMinor - bundlePriceMinor, floored at 0 (never negative). */
  savingMinor: number;
  /** savingMinor / combinedPriceMinor, 0 when there is nothing to save against. */
  savingPercent: number;
  /** True only when there is a genuine, factually accurate saving to show. */
  hasSaving: boolean;
};

/**
 * @param itemPricesMinor - standalone price_minor of every item included in
 *   the bundle. Free items should be passed as 0, not omitted, so the
 *   combined price stays accurate.
 * @param bundlePriceMinor - the bundle's own price_minor.
 */
export function calculateBundleSaving(
  itemPricesMinor: number[],
  bundlePriceMinor: number,
): BundleSaving {
  const combinedPriceMinor = itemPricesMinor.reduce((sum, price) => sum + price, 0);
  const rawSaving = combinedPriceMinor - bundlePriceMinor;
  const savingMinor = Math.max(0, rawSaving);
  const savingPercent = combinedPriceMinor > 0 ? savingMinor / combinedPriceMinor : 0;

  // Only claim a saving when it's genuine: the bundle must cost less than
  // the sum of its parts, and there must be a non-zero combined price to
  // save against at all. Never report a fabricated or negative saving.
  const hasSaving = savingMinor > 0 && combinedPriceMinor > 0;

  return { combinedPriceMinor, bundlePriceMinor, savingMinor, savingPercent, hasSaving };
}

/** Format minor units as a GBP-style display string, e.g. 3900 -> "£39.00". */
export function formatMinorUnits(minor: number, currencyCode = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(minor / 100);
}
