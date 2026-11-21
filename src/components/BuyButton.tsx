"use client";

/* Interactive buy button with wallet balance validation, lazy minting simulation, and transaction confirmation. */

import { useState } from "react";
import Link from "next/link";
import { useWallet, getExplorerUrl } from "@/lib/wallet";
import { formatTez, usdFromMutez } from "@/lib/currency";
import { recordClientPurchase, generateTezosOpHash, isAssetPurchasedBy } from "@/lib/purchases";
import type { WorkView } from "@/lib/repo";

export function BuyButton({
  work,
  soldOut,
  usdRate,
}: {
  work: WorkView;
  soldOut: boolean;
  usdRate: number;
}) {
  const { address, network, balanceMutez, isConnected, connect } = useWallet();

  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const alreadyOwned = isConnected && address ? isAssetPurchasedBy(work.id, address) : false;

  const handleBuy = async () => {
    setError(null);

    /* 1. Wallet connection check */
    if (!isConnected || !address) {
      const ok = await connect("dev");
      if (!ok) {
        setError("Please connect your wallet first.");
        return;
      }
    }

    const currentAddr = address || "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb";

    /* 2. Balance pre-flight check */
    if (balanceMutez < work.priceMutez) {
      setError(`Insufficient tez balance. Required: ${formatTez(work.priceMutez)}, Available: ${formatTez(balanceMutez)}`);
      return;
    }

    /* 3. Execute on-chain transaction & lazy-minting voucher */
    setIsProcessing(true);
    try {
      /* Simulate network confirmation time */
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const hash = generateTezosOpHash();
      setTxHash(hash);

      /* Record in local holdings store */
      recordClientPurchase({
        id: work.id,
        name: work.name,
        category: work.category,
        priceMutez: work.priceMutez,
        txHash: hash,
        buyerAddress: currentAddr,
        purchasedAt: new Date().toISOString(),
        edition: Math.min(work.owners + 1, work.editions || 1),
      });

      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Transaction rejected or failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (work.restricted) {
    return (
      <div style={{ marginTop: 12 }}>
        <button className="btn btn-primary btn-lg btn-block" disabled>
          Held back from sale
        </button>
        <p className="field-hint" style={{ marginTop: 8 }}>
          Held back from sale until the legal review of property-linked tokens is complete.
        </p>
      </div>
    );
  }

  if (soldOut) {
    return (
      <div style={{ marginTop: 12 }}>
        <button className="btn btn-primary btn-lg btn-block" disabled>
          Sold out
        </button>
        <p className="field-hint" style={{ marginTop: 8 }}>
          Every edition has been placed. Resale opens with the marketplace.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 12 }}>
      {alreadyOwned ? (
        <div style={{ background: "var(--panel-2)", padding: 14, borderRadius: 12, border: "1px solid var(--line-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--sig-green)", fontWeight: 600, fontSize: 13 }}>
            <span>✓</span> You own this asset in your portfolio
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <Link href="/dashboard" className="btn btn-sm btn-ghost" style={{ fontSize: 12 }}>
              View in Dashboard ↗
            </Link>
          </div>
        </div>
      ) : (
        <>
          <button
            type="button"
            className="btn btn-primary btn-lg btn-block"
            disabled={isProcessing}
            onClick={handleBuy}
          >
            {isProcessing ? "Confirming on Tezos…" : isConnected ? `Buy with tez (${formatTez(work.priceMutez)})` : "Connect wallet to buy"}
          </button>

          {error && (
            <p style={{ color: "var(--sig-red)", fontSize: 12, marginTop: 8 }}>
              {error}
            </p>
          )}

          <p className="field-hint" style={{ marginTop: 8 }}>
            {isConnected
              ? `Purchasing opens an on-chain transaction on Tezos ${network}. Lazy-minted upon settlement.`
              : "Connect your Tezos wallet to execute the purchase."}
          </p>
        </>
      )}

      {/* Confirmation Modal */}
      {isSuccess && txHash && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line-2)",
              borderRadius: 20,
              maxWidth: 460,
              width: "100%",
              padding: 24,
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background: "rgba(100, 255, 120, 0.15)",
                  color: "var(--sig-green)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 24,
                  margin: "0 auto 12px",
                }}
              >
                ✓
              </div>
              <h2 style={{ fontSize: 20, marginBottom: 4 }}>Purchase Confirmed!</h2>
              <p style={{ color: "var(--ink-3)", fontSize: 13, margin: 0 }}>
                {work.name} is now registered to your wallet.
              </p>
            </div>

            <div
              style={{
                background: "var(--panel-2)",
                padding: 14,
                borderRadius: 12,
                fontSize: 13,
                marginBottom: 20,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="label">Total Paid:</span>
                <b>{formatTez(work.priceMutez)} ({usdFromMutez(work.priceMutez, usdRate)})</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="label">Operation:</span>
                <a
                  href={getExplorerUrl(txHash, network)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono"
                  style={{ color: "var(--sig-green)", textDecoration: "underline", fontSize: 12 }}
                >
                  {txHash.slice(0, 10)}…{txHash.slice(-6)} ↗
                </a>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="label">Owner:</span>
                <span className="mono" style={{ fontSize: 12 }}>
                  {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Connected Wallet"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Link
                href="/dashboard"
                className="btn btn-primary"
                style={{ flex: 1, textAlign: "center", textDecoration: "none" }}
              >
                Go to Dashboard
              </Link>
              <button
                type="button"
                className="btn"
                style={{ flex: 1 }}
                onClick={() => setIsSuccess(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
