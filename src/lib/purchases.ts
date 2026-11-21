/* Reusable purchase registry for managing collected Tezos NFT assets. */

export type PurchasedAsset = {
  id: string;            /* Token ID e.g. TL-0417 */
  name: string;
  category: string;
  priceMutez: number;
  txHash: string;        /* Tezos operation hash e.g. op... */
  buyerAddress: string;  /* tz1... */
  purchasedAt: string;   /* ISO timestamp */
  edition: number;
};

const PURCHASES_STORAGE_KEY = "cadastra_client_purchases";

export function getClientPurchases(address?: string): PurchasedAsset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PURCHASES_STORAGE_KEY);
    const all: PurchasedAsset[] = raw ? JSON.parse(raw) : [];
    if (!address) return all;
    return all.filter((item) => item.buyerAddress.toLowerCase() === address.toLowerCase());
  } catch {
    return [];
  }
}

export function recordClientPurchase(purchase: PurchasedAsset): void {
  if (typeof window === "undefined") return;
  try {
    const all = getClientPurchases();
    const updated = [purchase, ...all.filter((p) => !(p.id === purchase.id && p.buyerAddress === purchase.buyerAddress))];
    localStorage.setItem(PURCHASES_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("cadastra:purchase_completed", { detail: purchase }));
  } catch {
    /* Ignore storage quotas */
  }
}

export function isAssetPurchasedBy(id: string, address?: string): boolean {
  if (!address || typeof window === "undefined") return false;
  const purchases = getClientPurchases(address);
  return purchases.some((p) => p.id === id);
}

/* Generates a deterministic mock Tezos operation hash for testing or Ghostnet simulation */
export function generateTezosOpHash(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let hash = "op";
  for (let i = 0; i < 49; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}
