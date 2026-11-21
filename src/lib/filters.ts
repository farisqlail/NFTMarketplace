/* Reusable catalog filtering utilities for price brackets and asset availability. */

export type PriceRange = "all" | "under-25" | "25-100" | "over-100";

export const PRICE_RANGES: { id: PriceRange; label: string }[] = [
  { id: "all", label: "All Prices" },
  { id: "under-25", label: "< 25 ꜩ" },
  { id: "25-100", label: "25 – 100 ꜩ" },
  { id: "over-100", label: "> 100 ꜩ" },
];

export function matchesPriceRange(priceMutez: number, range: PriceRange): boolean {
  const tez = priceMutez / 1_000_000;
  switch (range) {
    case "under-25":
      return tez < 25;
    case "25-100":
      return tez >= 25 && tez <= 100;
    case "over-100":
      return tez > 100;
    case "all":
    default:
      return true;
  }
}

export function isAvailable(owners: number, editions: number): boolean {
  if (editions <= 0) return true;
  return owners < editions;
}
