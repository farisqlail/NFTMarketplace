"use client";

/* Client portfolio combining verified on-chain purchases with account seed holdings. */

import { useEffect, useState } from "react";
import Image from "next/image";
import { formatTez, usdFromMutez } from "@/lib/currency";
import type { WorkView } from "@/lib/repo";
import { assetSrc } from "@/lib/media";
import { rngFrom } from "@/lib/hash";
import { useWallet, getExplorerUrl } from "@/lib/wallet";
import { getClientPurchases, type PurchasedAsset } from "@/lib/purchases";

export function ClientHoldings({ seed, works, usdRate }: { seed: number; works: WorkView[]; usdRate: number }) {
  const { address, network } = useWallet();
  const [purchases, setPurchases] = useState<PurchasedAsset[]>(() => getClientPurchases(address || undefined));

  useEffect(() => {
    const handlePurchase = () => {
      setPurchases(getClientPurchases(address || undefined));
    };

    window.addEventListener("cadastra:purchase_completed", handlePurchase);
    return () => window.removeEventListener("cadastra:purchase_completed", handlePurchase);
  }, [address]);

  const rnd = rngFrom(seed);
  const live = works.filter((d) => d.status === "Live");

  /* Base seed holdings */
  const baseHoldings = live
    .map((d) => ({ d, r: rnd() }))
    .sort((a, b) => a.r - b.r)
    .slice(0, 4)
    .map(({ d }, i) => ({ design: d, units: 1 + Math.floor(rngFrom(seed + i)() * 4), txHash: null as string | null }));

  /* On-chain purchased assets */
  const purchasedHoldings = purchases
    .map((p) => {
      const work = works.find((w) => w.id === p.id);
      if (!work) return null;
      return {
        design: work,
        units: 1,
        txHash: p.txHash,
      };
    })
    .filter(Boolean) as { design: WorkView; units: number; txHash: string | null }[];

  /* Combine without duplicate tokens, placing real purchases on top */
  const combined = [
    ...purchasedHoldings,
    ...baseHoldings.filter((b) => !purchasedHoldings.some((p) => p.design.id === b.design.id)),
  ];

  const totalValue = combined.reduce((s, h) => s + h.design.priceMutez * h.units, 0);

  return (
    <>
      <div className="panel-head">
        <div className="chart-title">
          <b>Your holdings</b>
        </div>
        <span className="label">{combined.length} positions</span>
      </div>
      <div className="panel-body" style={{ paddingBottom: 6 }}>
        <p className="chart-figure">{formatTez(totalValue)}</p>
        <p className="label" style={{ letterSpacing: ".1em" }}>
          Portfolio value · {usdFromMutez(totalValue, usdRate)}
        </p>
      </div>
      <table className="rank">
        <thead>
          <tr>
            <th>Asset</th>
            <th className="n">Units</th>
            <th className="n">Value</th>
          </tr>
        </thead>
        <tbody>
          {combined.map((h) => (
            <tr key={h.design.id}>
              <td>
                <span className="rank-name">
                  <Image src={assetSrc(h.design.id)} alt="" width={34} height={34} className="rank-thumb" unoptimized />
                  <span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                      {h.design.name}
                      {h.txHash && (
                        <a
                          href={getExplorerUrl(h.txHash, network)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: 10,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: "rgba(100, 255, 120, 0.12)",
                            color: "var(--sig-green)",
                            textDecoration: "none",
                            fontWeight: 600,
                          }}
                        >
                          On-Chain ↗
                        </a>
                      )}
                    </span>
                    <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>
                      {h.design.id} · {h.design.category}
                    </span>
                  </span>
                </span>
              </td>
              <td className="n">{h.units}</td>
              <td className="n">{formatTez(h.design.priceMutez * h.units)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
