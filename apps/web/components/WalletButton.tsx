"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useWalletStore } from '../lib/store/walletStore';
import { Wallet, LogOut, Loader2, ChevronDown, Check } from 'lucide-react';

export default function WalletButton() {
  const { publicKey, isConnected, isConnecting, walletType, connect, disconnect } = useWalletStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConnect = async (type: 'freighter' | 'lobstr') => {
    setDropdownOpen(false);
    try {
      await connect(type);
    } catch (err: any) {
      alert(err.message || String(err));
    }
  };

  if (isConnected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-dark-700/80 backdrop-blur-md border border-dark-600 px-3 py-1.5 rounded-lg">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xxs uppercase tracking-wider font-extrabold text-dark-400">
            {walletType === 'lobstr' ? 'LOBSTR' : 'Freighter'}
          </span>
          <span className="h-3 w-[1px] bg-dark-600" />
          <span className="text-xs font-mono text-teal-300 font-semibold">
            {truncate(publicKey)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="glass glass-hover p-2 rounded-lg text-accent-rose transition duration-200 border border-white/5"
          title="Disconnect wallet"
          aria-label="Disconnect wallet"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="wallet-connect-btn"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        disabled={isConnecting}
        className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-purple px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-lg transition duration-200 disabled:opacity-50"
      >
        {isConnecting ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
        {isConnecting ? 'Connecting…' : 'Connect Wallet'}
        <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl bg-dark-800/95 border border-white/10 shadow-2xl backdrop-blur-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-[10px] font-bold text-dark-500 uppercase tracking-wider px-3 py-2">Select Wallet</p>
          <button
            onClick={() => handleConnect('freighter')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs font-medium text-white hover:bg-white/5 transition-colors duration-150"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>Freighter Wallet</span>
            </div>
            {walletType === 'freighter' && <Check size={12} className="text-primary" />}
          </button>
          <button
            onClick={() => handleConnect('lobstr')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs font-medium text-white hover:bg-white/5 transition-colors duration-150"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span>LOBSTR Wallet</span>
            </div>
            {walletType === 'lobstr' && <Check size={12} className="text-accent" />}
          </button>
        </div>
      )}
    </div>
  );
}
