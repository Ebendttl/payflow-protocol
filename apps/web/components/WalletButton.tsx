"use client";

import React from 'react';
import { useWalletStore } from '../lib/store/walletStore';
import { Wallet, LogOut, Loader2 } from 'lucide-react';

// TODO(issue): #M1 — Implement full wallet connect CTA with network badge and balance display
export default function WalletButton() {
  const { publicKey, isConnected, isConnecting, connect, disconnect } = useWalletStore();

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (isConnected && publicKey) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs bg-dark-700 border border-dark-600 px-3 py-1.5 rounded-md font-mono text-teal-300">
          {truncate(publicKey)}
        </span>
        <button
          onClick={disconnect}
          className="glass glass-hover p-2 rounded-lg text-accent-rose transition duration-200"
          title="Disconnect wallet"
          aria-label="Disconnect wallet"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <button
      id="wallet-connect-btn"
      onClick={connect}
      disabled={isConnecting}
      className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-purple px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-lg transition duration-200 disabled:opacity-50"
    >
      {isConnecting ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
      {isConnecting ? 'Connecting…' : 'Connect Freighter'}
    </button>
  );
}
