"use client";

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEscrow } from '../../../lib/hooks/useEscrow';
import EscrowPanel from '../../../components/EscrowPanel';
import WalletButton from '../../../components/WalletButton';
import { ArrowLeft, Home, Loader } from 'lucide-react';

export default function EscrowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { escrow, isLoading, error } = useEscrow(BigInt(id ?? 0));

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full glass py-4 px-6 md:px-12 flex justify-between items-center border-b border-white/5 z-10">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-teal-300 transition">
            <Home size={18} />
            <span className="font-bold tracking-wider hidden md:inline">PayFlow</span>
          </Link>
          <div className="h-4 w-[1px] bg-dark-700 hidden md:block" />
          <nav className="flex gap-4 text-sm font-semibold">
            <Link href="/streams" className="text-dark-600 hover:text-white transition">Streams</Link>
            <Link href="/escrow" className="text-primary-light font-bold">Escrows</Link>
          </nav>
        </div>
        <WalletButton />
      </header>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto px-6 py-12 flex-grow space-y-6 z-10 flex flex-col justify-center">
        <Link
          href="/escrow"
          className="flex items-center gap-1.5 text-xs text-dark-600 hover:text-white transition self-start font-bold mb-4"
        >
          <ArrowLeft size={14} />
          Back to Escrows
        </Link>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader size={40} className="animate-spin text-primary" />
            <span className="text-sm text-dark-600">Fetching Escrow Details...</span>
          </div>
        )}

        {error && (
          <div className="glass p-8 rounded-2xl text-center border border-accent-rose/20 text-accent-rose">
            <h3 className="text-lg font-bold mb-1">Failed to Load Escrow</h3>
            <p className="text-xs">{error}</p>
          </div>
        )}

        {!isLoading && !error && escrow && (
          <EscrowPanel escrow={escrow} />
        )}
      </main>

      <footer className="w-full glass py-6 text-center border-t border-white/5 text-xs text-dark-600 z-10">
        &copy; {new Date().getFullYear()} PayFlow Protocol.
      </footer>
    </div>
  );
}
