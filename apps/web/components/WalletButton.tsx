"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useWalletStore } from '../lib/store/walletStore';
import { Wallet, LogOut, Loader2, ChevronDown, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import WalletOptionButton from './ui/WalletOptionButton';

export default function WalletButton() {
  const { publicKey, isConnected, isConnecting, walletType, connectionError, connect, disconnect } = useWalletStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (connectionError) {
      setLocalError(connectionError);
    }
  }, [connectionError]);

  const handleConnect = async (type: 'freighter' | 'lobstr') => {
    setDropdownOpen(false);
    setLocalError(null);
    const toastId = toast.loading(`Connecting to ${type === 'lobstr' ? 'LOBSTR' : 'Freighter'}...`);
    try {
      await connect(type);
      toast.success(`Wallet connected successfully!`, { id: toastId });
    } catch (err: any) {
      const msg = err?.message || String(err);
      setLocalError(msg);
      toast.error(`Connection failed: ${msg}`, { id: toastId });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.success("Wallet disconnected");
  };

  if (isConnected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-dark-700/80 border border-white/10 px-3 py-1.5 rounded-xl">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] uppercase tracking-wider font-bold text-dark-400">
            {walletType === 'lobstr' ? 'LOBSTR' : 'Freighter'}
          </span>
          <span className="h-3 w-[1px] bg-dark-600" />
          <span className="font-mono text-xs text-primary font-semibold">
            {truncate(publicKey)}
          </span>
        </div>
        <button
          onClick={handleDisconnect}
          className="p-2.5 rounded-xl border border-white/5 bg-transparent hover:bg-white/5 text-rose-500 transition duration-150"
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
        type="button"
        onClick={() => { setLocalError(null); setDropdownOpen(!dropdownOpen); }}
        disabled={isConnecting}
        className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-dark-800 hover:bg-dark-700 border border-white/10 rounded-xl transition duration-150 disabled:opacity-50"
      >
        {isConnecting ? <Loader2 size={14} className="animate-spin text-primary" /> : <Wallet size={14} className="text-primary" />}
        {isConnecting ? 'Connecting…' : 'Connect Wallet'}
        {!isConnecting && <ChevronDown size={12} className={`transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`} />}
      </button>

      {dropdownOpen && !isConnecting && (
        <div className="absolute right-0 mt-2 w-[220px] bg-dark-900 border border-white/10 rounded-xl p-2 z-[9999] shadow-lg shadow-black/40">
          <p className="text-[10px] font-bold text-dark-500 uppercase tracking-wider px-3 py-1.5">Select Wallet</p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1">
              <WalletOptionButton
                onClick={() => handleConnect('freighter')}
                label="Freighter Wallet"
                isConnecting={false}
              />
              {walletType === 'freighter' && <Check size={14} className="text-primary shrink-0 ml-1.5" />}
            </div>
            <div className="flex items-center justify-between px-1">
              <WalletOptionButton
                onClick={() => handleConnect('lobstr')}
                label="LOBSTR Wallet"
                isConnecting={false}
              />
              {walletType === 'lobstr' && <Check size={14} className="text-primary shrink-0 ml-1.5" />}
            </div>
          </div>
        </div>
      )}

      {localError && !isConnecting && (
        <div className="absolute right-0 mt-2 w-[288px] bg-rose-950/90 border border-rose-500/30 rounded-xl p-3 flex gap-2.5 z-[9999]">
          <AlertTriangle size={14} className="text-rose-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-rose-300 leading-relaxed break-words">{localError}</p>
            <button
              onClick={() => setLocalError(null)}
              className="text-[10px] text-rose-400 hover:text-rose-300 underline mt-1.5"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
