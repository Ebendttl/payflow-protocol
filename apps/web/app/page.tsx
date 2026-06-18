"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import WalletButton from '../components/WalletButton';
import { useWalletStore } from '../lib/store/walletStore';
import { ArrowRight, Activity, ShieldCheck, Cpu } from 'lucide-react';

export default function Home() {
  const { publicKey, connect, isConnecting } = useWalletStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleConnect = async (type: 'freighter' | 'lobstr') => {
    setDropdownOpen(false);
    try { await connect(type); } catch (_) {}
  };

  return (
    <div className="relative min-h-screen bg-dark-900 overflow-hidden flex flex-col justify-between">
      {/* TODO(issue): #T3 — Implement responsive mobile layouts across all pages */}
      {/* Background radial effects */}
      <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <header className="w-full glass py-4 px-6 md:px-12 flex justify-between items-center border-b border-white/5" style={{ position: 'relative', zIndex: 20 }}>
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center font-bold text-white text-lg">
            P
          </div>
          <span style={{ fontSize: '18px', letterSpacing: '-0.02em', fontWeight: 700, color: '#F0EEE9' }}>
            PayFlow
          </span>
        </div>
        <WalletButton />
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 flex-grow flex flex-col items-center justify-center text-center" style={{ position: 'relative', zIndex: 10, paddingTop: '80px', paddingBottom: '40px' }}>
        <div className="space-y-6">
          <h1 style={{ fontSize: 'clamp(48px, 6vw, 72px)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.02em', color: '#F0EEE9' }}>
            Soroban-Native<br />
            Continuous Token Flow
          </h1>
          <p style={{ fontSize: '18px', fontWeight: 400, lineHeight: 1.6, color: '#6B7280', maxWidth: '560px', margin: '0 auto' }}>
            PayFlow enables developers, DAOs, and remote teams to stream tokens continuously, configure multi-sig escrows, and automate milestone disbursements on Stellar.
          </p>
        </div>

        {publicKey ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center" style={{ marginTop: '40px' }}>
            <Link
              href="/streams"
              className="px-8 py-4 bg-primary hover:bg-primary-light text-white font-semibold rounded-xl transition duration-200 flex items-center gap-2"
            >
              Streams Dashboard
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/escrow"
              className="px-8 py-4 glass glass-hover text-white font-semibold rounded-xl transition duration-200 flex items-center gap-2"
            >
              Milestone Escrows
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div style={{ marginTop: '40px', position: 'relative' }}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={isConnecting}
              style={{
                cursor: 'pointer',
                padding: '14px 32px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#fff',
                background: '#0D9488',
                border: 'none',
                borderRadius: '12px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#2DD4BF')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0D9488')}
            >
              {isConnecting ? 'Connecting…' : 'Connect Wallet to Get Started'}
            </button>
            {dropdownOpen && !isConnecting && (
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
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
                  style={{ cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', fontSize: '13px', color: '#fff', background: 'transparent', border: 'none', borderRadius: '8px', textAlign: 'left' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ height: '8px', width: '8px', borderRadius: '50%', background: '#0D9488', flexShrink: 0 }} />
                  Freighter Wallet
                </button>
                <button
                  type="button"
                  onClick={() => handleConnect('lobstr')}
                  style={{ cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', fontSize: '13px', color: '#fff', background: 'transparent', border: 'none', borderRadius: '8px', textAlign: 'left' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ height: '8px', width: '8px', borderRadius: '50%', background: '#0D9488', flexShrink: 0 }} />
                  LOBSTR Wallet
                </button>
              </div>
            )}
          </div>
        )}

        {/* Features grid */}
        <div className="grid md:grid-cols-3 w-full" style={{ gap: '24px', paddingTop: '100px', paddingBottom: '80px' }}>
          <div className="rounded-2xl text-left space-y-3" style={{ padding: '28px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent' }}>
            <Activity size={20} style={{ color: '#6B7280' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F0EEE9' }}>Real-time Streams</h3>
            <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#6B7280' }}>Drip assets linearly per second. Recipients can claim accrued balances instantly with low network fees.</p>
          </div>

          <div className="rounded-2xl text-left space-y-3" style={{ padding: '28px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent' }}>
            <ShieldCheck size={20} style={{ color: '#6B7280' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F0EEE9' }}>Milestone Escrow</h3>
            <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#6B7280' }}>Disburse contract funds strictly upon milestone completion governed by a multi-sig signer threshold.</p>
          </div>

          <div className="rounded-2xl text-left space-y-3" style={{ padding: '28px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent' }}>
            <Cpu size={20} style={{ color: '#6B7280' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F0EEE9' }}>Soroban-Powered</h3>
            <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#6B7280' }}>Built completely on-chain using Soroban WebAssembly, leveraging Stellar&apos;s asset issuance standards.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-6 text-center border-t text-xs" style={{ borderColor: 'rgba(255,255,255,0.05)', color: '#6B7280' }}>
        &copy; {new Date().getFullYear()} PayFlow Protocol &middot; Built on Stellar Soroban
      </footer>
    </div>
  );
}
