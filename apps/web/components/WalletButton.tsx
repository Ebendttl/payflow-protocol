"use client";

import React from 'react';
import { useWalletStore } from '../lib/store/walletStore.js';
import { Wallet, LogOut } from 'lucide-react';

export default function WalletButton() {
  const { address, isConnecting, connect, disconnect, hasFreighter, checkFreighter } = useWalletStore();

  React.useEffect(() => {
    checkFreighter();
  }, [checkFreighter]);

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!hasFreighter) {
    return (
      <a
        href="https://www.freighter.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="glass glass-hover px-4 py-2 rounded-lg text-sm text-accent-amber transition duration-200"
      >
        Install Freighter
      </a>
    );
  }

  if (address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs bg-dark-700 border border-dark-600 px-3 py-1.5 rounded-md font-mono text-teal-300">
          {truncateAddress(address)}
        </span>
        <button
          onClick={disconnect}
          className="glass glass-hover p-2 rounded-lg text-accent-rose transition duration-200"
          title="Disconnect wallet"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-purple px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-lg transition duration-200 disabled:opacity-50"
    >
      <Wallet size={16} />
      {isConnecting ? 'Connecting...' : 'Connect Freighter'}
    </button>
  );
}
