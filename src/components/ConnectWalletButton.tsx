"use client";

/* Tezos wallet connection button with support for Temple, Kukai, and Ghostnet testnet wallets. */

import { useEffect, useRef, useState } from "react";
import { useWallet, formatAddress, getExplorerUrl, type WalletType } from "@/lib/wallet";
import { formatTez } from "@/lib/currency";
import { CryptoIcon } from "./visuals/CryptoIcon";

export function ConnectWalletButton() {
  const {
    address,
    network,
    balanceMutez,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    setNetwork,
  } = useWallet();

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const box = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = async (type: WalletType) => {
    await connect(type);
    setOpen(false);
  };

  return (
    <div className="wallet-box" ref={box}>
      <button
        className="btn wallet-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={isConnected ? `Connected: ${address}` : "Connect wallet"}
        style={{
          borderColor: isConnected ? "var(--sig-green)" : undefined,
          color: isConnected ? "var(--ink)" : undefined,
          borderStyle: isConnected ? "solid" : "dashed",
        }}
      >
        {isConnected ? (
          <>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--sig-green)",
                display: "inline-block",
                marginRight: 4,
              }}
            />
            <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>
              {formatAddress(address || "")}
            </span>
            <span
              className="wallet-btn-text"
              style={{
                fontSize: 12,
                color: "var(--ink-3)",
                marginLeft: 4,
                paddingLeft: 6,
                borderLeft: "1px solid var(--line-2)",
              }}
            >
              {formatTez(balanceMutez, { symbol: false })} ꜩ
            </span>
          </>
        ) : (
          <>
            <WalletIcon />
            <span className="wallet-btn-text">
              {isConnecting ? "Connecting…" : "Connect wallet"}
            </span>
          </>
        )}
      </button>

      {open && (
        <div
          className="wallet-menu"
          role="dialog"
          aria-label="Wallet connection"
          style={{ minWidth: 280 }}
        >
          {isConnected && address ? (
            <div style={{ padding: "8px 10px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: "var(--ink-4)",
                    fontWeight: 700,
                  }}
                >
                  Connected Wallet
                </span>
                <button
                  type="button"
                  onClick={() => setNetwork(network === "ghostnet" ? "mainnet" : "ghostnet")}
                  className="btn btn-ghost"
                  style={{
                    fontSize: 10,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "rgba(100, 255, 120, 0.12)",
                    color: "var(--sig-green)",
                    fontWeight: 600,
                    textTransform: "capitalize",
                    cursor: "pointer",
                  }}
                  title="Click to toggle network"
                >
                  {network} ⇄
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "var(--panel-2)",
                  padding: "8px 12px",
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              >
                <span className="mono" style={{ fontSize: 13, color: "var(--ink)" }}>
                  {formatAddress(address)}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="btn btn-ghost"
                  style={{ fontSize: 11, padding: "4px 8px", height: "auto" }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div style={{ marginBottom: 14 }}>
                <span className="label" style={{ display: "block", marginBottom: 2 }}>
                  Balance
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CryptoIcon coin="xtz" size={18} />
                  <b style={{ fontSize: 16 }}>{formatTez(balanceMutez, { symbol: false })} ꜩ</b>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  paddingTop: 8,
                  borderTop: "1px solid var(--line)",
                }}
              >
                <a
                  href={getExplorerUrl(address, network)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                  style={{ flex: 1, fontSize: 12, textAlign: "center", textDecoration: "none" }}
                >
                  View on TzKT ↗
                </a>
                <button
                  type="button"
                  onClick={disconnect}
                  className="btn"
                  style={{ flex: 1, fontSize: 12, color: "var(--sig-red)" }}
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: "4px 6px" }}>
              <div style={{ padding: "6px 8px 10px" }}>
                <b style={{ display: "block", fontSize: 14, marginBottom: 4 }}>
                  Connect Tezos Wallet
                </b>
                <p style={{ fontSize: 12, color: "var(--ink-3)", margin: 0, lineHeight: 1.4 }}>
                  Select your wallet to mint and buy assets with tez.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button
                  type="button"
                  onClick={() => handleConnect("dev")}
                  className="btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    textAlign: "left",
                  }}
                >
                  <div>
                    <b style={{ display: "block", fontSize: 13 }}>Ghostnet Test Wallet</b>
                    <small style={{ color: "var(--ink-4)", fontSize: 11 }}>Instant testnet connection (125 ꜩ)</small>
                  </div>
                  <CryptoIcon coin="xtz" size={20} />
                </button>

                <button
                  type="button"
                  onClick={() => handleConnect("temple")}
                  className="btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    textAlign: "left",
                  }}
                >
                  <div>
                    <b style={{ display: "block", fontSize: 13 }}>Temple Wallet</b>
                    <small style={{ color: "var(--ink-4)", fontSize: 11 }}>Browser extension</small>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--ink-4)" }}>Tezos</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleConnect("kukai")}
                  className="btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    textAlign: "left",
                  }}
                >
                  <div>
                    <b style={{ display: "block", fontSize: 13 }}>Kukai Wallet</b>
                    <small style={{ color: "var(--ink-4)", fontSize: 11 }}>Direct web wallet</small>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--ink-4)" }}>Direct</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WalletIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1" />
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M16 13.5h2" />
    </svg>
  );
}
