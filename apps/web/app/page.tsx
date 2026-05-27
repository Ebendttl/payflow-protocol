"use client";

import React from 'react';
import Link from 'next/link';
import WalletButton from '../components/WalletButton.js';
import { useWalletStore } from '../lib/store/walletStore.js';
import { ArrowRight, Activity, ShieldCheck, Cpu } from 'lucide-react';

export default function Home() {
  const { address } = useWalletStore();

  return (
    <div className="relative min-h-screen bg-dark-900 overflow-hidden flex flex-col justify-between">
      {/* Background radial effects */}
      <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <header className="w-full glass py-4 px-6 md:px-12 flex justify-between items-center border-b border-white/5 z-10">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 bg-gradient-to-tr from-primary to-accent rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-md shadow-primary/20">
            P
          </div>
          <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-white via-teal-300 to-accent bg-clip-text text-transparent">
            PayFlow
          </span>
        </div>
        <WalletButton />
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-20 flex-grow flex flex-col items-center justify-center text-center relative z-10 space-y-10">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Soroban-Native <br />
            <span className="bg-gradient-to-r from-primary-light via-teal-300 to-accent-purple bg-clip-text text-transparent">
              Continuous Token Flow
            </span>
          </h1>
          <p className="text-dark-600 text-lg md:text-xl max-w-2xl mx-auto">
            PayFlow enables developers, DAOs, and remote teams to stream tokens continuously, configure multi-sig escrows, and automate milestone disbursements on Stellar.
          </p>
        </div>

        {address ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/streams"
              className="px-8 py-4 bg-primary hover:bg-primary-light text-white font-semibold rounded-xl transition duration-200 flex items-center gap-2 shadow-lg shadow-primary/20"
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
          <div className="space-y-4">
            <div className="inline-block glass px-4 py-2 rounded-full text-xs font-semibold text-accent-amber border border-accent-amber/20 animate-pulse">
              Connect Freighter Wallet to Access App
            </div>
          </div>
        )}

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-8 w-full pt-12">
          <div className="glass p-6 rounded-2xl text-left border border-white/5 space-y-3">
            <div className="h-10 w-10 bg-primary/20 text-primary-light rounded-lg flex items-center justify-center">
              <Activity size={20} />
            </div>
            <h3 className="text-lg font-bold">Real-time Streams</h3>
            <p className="text-xs text-dark-600">Drip assets linearly per second. Recipients can claim accrued balances instantly with low network fees.</p>
          </div>

          <div className="glass p-6 rounded-2xl text-left border border-white/5 space-y-3">
            <div className="h-10 w-10 bg-accent/20 text-accent-purple rounded-lg flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-bold">Milestone Escrow</h3>
            <p className="text-xs text-dark-600">Disburse contract funds strictly upon milestone completion governed by a multi-sig signer threshold.</p>
          </div>

          <div className="glass p-6 rounded-2xl text-left border border-white/5 space-y-3">
            <div className="h-10 w-10 bg-teal-500/20 text-teal-400 rounded-lg flex items-center justify-center">
              <Cpu size={20} />
            </div>
            <h3 className="text-lg font-bold">Soroban-Powered</h3>
            <p className="text-xs text-dark-600">Built completely on-chain using Soroban WebAssembly, leveraging Stellar's asset issuance standards.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full glass py-6 px-6 text-center border-t border-white/5 text-xs text-dark-600 z-10">
        &copy; {new Date().getFullYear()} PayFlow Protocol. Open-Source Drips Wave Scaffolding.
      </footer>
    </div>
  );
}
