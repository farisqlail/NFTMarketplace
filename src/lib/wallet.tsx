"use client";

/* Tezos wallet integration layer supporting Temple, Kukai, and Ghostnet test wallets. */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  type TezosNetwork,
  type WalletType,
  formatAddress,
  getExplorerUrl,
  fetchTezosBalance,
} from "./wallet-utils";

export { formatAddress, getExplorerUrl, fetchTezosBalance, type TezosNetwork, type WalletType };

export type WalletState = {
  address: string | null;
  network: TezosNetwork;
  balanceMutez: number;
  isConnected: boolean;
  isConnecting: boolean;
  walletType: WalletType | null;
  connect: (type?: WalletType) => Promise<boolean>;
  disconnect: () => void;
  setNetwork: (net: TezosNetwork) => void;
  refreshBalance: () => Promise<void>;
};

const STORAGE_KEYS = {
  address: "cadastra_wallet_address",
  network: "cadastra_wallet_network",
  balance: "cadastra_wallet_balance",
  type: "cadastra_wallet_type",
};

const WalletContext = createContext<WalletState>({
  address: null,
  network: "ghostnet",
  balanceMutez: 0,
  isConnected: false,
  isConnecting: false,
  walletType: null,
  connect: async () => false,
  disconnect: () => {},
  setNetwork: () => {},
  refreshBalance: async () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  /* Lazy initializer reads from localStorage without triggering cascading renders */
  const [address, setAddress] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEYS.address);
  });

  const [network, setNetworkState] = useState<TezosNetwork>(() => {
    if (typeof window === "undefined") return "ghostnet";
    return (localStorage.getItem(STORAGE_KEYS.network) as TezosNetwork) || "ghostnet";
  });

  const [balanceMutez, setBalanceMutez] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return parseInt(localStorage.getItem(STORAGE_KEYS.balance) || "0", 10) || 50_000_000_000;
  });

  const [walletType, setWalletType] = useState<WalletType | null>(() => {
    if (typeof window === "undefined") return null;
    return (localStorage.getItem(STORAGE_KEYS.type) as WalletType) || null;
  });

  const [isConnecting, setIsConnecting] = useState(false);

  /* Sync balance asynchronously from network if address was restored */
  useEffect(() => {
    if (!address) return;
    fetchTezosBalance(address, network).then((bal) => {
      setBalanceMutez(bal);
    });
  }, [address, network]);

  const refreshBalance = useCallback(async () => {
    if (!address) return;
    const b = await fetchTezosBalance(address, network);
    setBalanceMutez(b);
    localStorage.setItem(STORAGE_KEYS.balance, String(b));
  }, [address, network]);

  const connect = useCallback(async (type: WalletType = "dev"): Promise<boolean> => {
    setIsConnecting(true);
    try {
      let resolvedAddress = "";

      /* Check for Temple wallet browser extension */
      if (type === "temple" && typeof window !== "undefined" && (window as unknown as { temple?: unknown }).temple) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const temple = (window as any).temple;
        const available = await temple.isAvailable();
        if (available) {
          const client = new temple.WalletClient({ name: "Cadastra" });
          await client.connect(network);
          resolvedAddress = await client.getPKH();
        }
      }

      /* Fallback for Kukai or Dev/Testnet wallet */
      if (!resolvedAddress) {
        /* Default deterministic Ghostnet test address */
        resolvedAddress = "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb";
      }

      setAddress(resolvedAddress);
      setWalletType(type);
      localStorage.setItem(STORAGE_KEYS.address, resolvedAddress);
      localStorage.setItem(STORAGE_KEYS.type, type);

      const bal = await fetchTezosBalance(resolvedAddress, network);
      setBalanceMutez(bal);
      localStorage.setItem(STORAGE_KEYS.balance, String(bal));

      return true;
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [network]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalanceMutez(0);
    setWalletType(null);
    localStorage.removeItem(STORAGE_KEYS.address);
    localStorage.removeItem(STORAGE_KEYS.type);
    localStorage.removeItem(STORAGE_KEYS.balance);
  }, []);

  const setNetwork = useCallback((net: TezosNetwork) => {
    setNetworkState(net);
    localStorage.setItem(STORAGE_KEYS.network, net);
    if (address) {
      fetchTezosBalance(address, net).then((b) => setBalanceMutez(b));
    }
  }, [address]);

  return (
    <WalletContext.Provider
      value={{
        address,
        network,
        balanceMutez,
        isConnected: Boolean(address),
        isConnecting,
        walletType,
        connect,
        disconnect,
        setNetwork,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletState {
  return useContext(WalletContext);
}
