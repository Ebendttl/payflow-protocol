"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useWalletStore } from '../lib/store/walletStore';
import { Wallet, LogOut, Loader2, ChevronDown, Check, AlertTriangle } from 'lucide-react';

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
    try {
      await connect(type);
    } catch (err: any) {
      setLocalError(err?.message || String(err));
    }
  };

  if (isConnected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-dark-700/80 border border-dark-600 px-3 py-1.5 rounded-lg">
          <span style={{ height: '6px', width: '6px', borderRadius: '50%', background: '#10B981' }} />
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#6B7280' }}>
            {walletType === 'lobstr' ? 'LOBSTR' : 'Freighter'}
          </span>
          <span style={{ height: '12px', width: '1px', background: '#374151' }} />
          <span className="font-mono" style={{ fontSize: '12px', color: '#0D9488', fontWeight: 600 }}>
            {truncate(publicKey)}
          </span>
        </div>
        <button
          onClick={disconnect}
          style={{ cursor: 'pointer', padding: '8px', borderRadius: '8px', color: '#F43F5E', background: 'transparent', border: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          title="Disconnect wallet"
          aria-label="Disconnect wallet"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        id="wallet-connect-btn"
        type="button"
        onClick={() => { setLocalError(null); setDropdownOpen(!dropdownOpen); }}
        disabled={isConnecting}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#F0EEE9',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '10px',
          transition: 'border-color 0.15s, background 0.15s',
          opacity: isConnecting ? 0.5 : 1,
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'transparent'; }}
      >
        {isConnecting ? <Loader2 size={15} className="animate-spin" /> : <Wallet size={15} />}
        {isConnecting ? 'Connecting…' : 'Connect Wallet'}
        {!isConnecting && <ChevronDown size={13} style={{ transition: 'transform 0.15s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />}
      </button>

      {dropdownOpen && !isConnecting && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '8px',
            width: '220px',
            background: '#111827',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '6px',
            zIndex: 9999,
          }}
        >
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '8px 12px 4px' }}>Select Wallet</p>
          <button
            type="button"
            onClick={() => handleConnect('freighter')}
            style={{ cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', fontSize: '13px', fontWeight: 500, color: '#fff', background: 'transparent', border: 'none', borderRadius: '8px', textAlign: 'left' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ height: '8px', width: '8px', borderRadius: '50%', background: '#0D9488', flexShrink: 0 }} />
              <span>Freighter Wallet</span>
            </div>
            {walletType === 'freighter' && <Check size={12} style={{ color: '#0D9488' }} />}
          </button>
          <button
            type="button"
            onClick={() => handleConnect('lobstr')}
            style={{ cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', fontSize: '13px', fontWeight: 500, color: '#fff', background: 'transparent', border: 'none', borderRadius: '8px', textAlign: 'left' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ height: '8px', width: '8px', borderRadius: '50%', background: '#0D9488', flexShrink: 0 }} />
              <span>LOBSTR Wallet</span>
            </div>
            {walletType === 'lobstr' && <Check size={12} style={{ color: '#0D9488' }} />}
          </button>
        </div>
      )}

      {localError && !isConnecting && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '8px',
            width: '288px',
            background: 'rgba(76, 5, 25, 0.9)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            zIndex: 9999,
          }}
        >
          <AlertTriangle size={14} style={{ color: '#fb7185', marginTop: '2px', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '11px', color: '#fda4af', lineHeight: 1.4, wordBreak: 'break-word' }}>{localError}</p>
            <button
              onClick={() => setLocalError(null)}
              style={{ cursor: 'pointer', fontSize: '10px', color: '#fb7185', background: 'none', border: 'none', textDecoration: 'underline', marginTop: '4px', padding: 0 }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
