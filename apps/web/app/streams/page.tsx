"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import StreamCard from '../../components/StreamCard';
import WalletButton from '../../components/WalletButton';
import { useWalletStore } from '../../lib/store/walletStore';
import { Plus, LayoutGrid, SlidersHorizontal, Home } from 'lucide-react';
import { Stream } from '@payflow/sdk';

export default function StreamsDashboard() {
  const { publicKey } = useWalletStore();
  const [filter, setFilter] = useState<'All' | 'Active' | 'Paused' | 'Cancelled'>('All');

  // TODO(issue): #M2 — Connect to indexer REST API `GET /streams?sender={publicKey}` to load active streams list.
  // Mock streams list:
  const mockStreams: Stream[] = [
    {
      id: 1n,
      sender: publicKey || "GBX...",
      recipient: "GDYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      token: "USDC",
      totalAmount: 10000000000n, // 1000 USDC
      startTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 5), // 5 days ago
      endTime: BigInt(Math.floor(Date.now() / 1000) + 86400 * 10), // 10 days left
      claimedAmount: 2000000000n,
      pausedAt: null,
      totalPausedDuration: 0n,
      status: "Active",
    },
    {
      id: 2n,
      sender: publicKey || "GBX...",
      recipient: "GDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      token: "XLM",
      totalAmount: 5000000000n, // 500 XLM
      startTime: BigInt(Math.floor(Date.now() / 1000) - 3600),
      endTime: BigInt(Math.floor(Date.now() / 1000) + 3600 * 4),
      claimedAmount: 0n,
      pausedAt: BigInt(Math.floor(Date.now() / 1000) - 300),
      totalPausedDuration: 300n,
      status: "Paused",
    }
  ];

  const filteredStreams = mockStreams.filter(s => filter === 'All' || s.status === filter);

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] h-[50%] w-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full glass py-4 px-6 md:px-12 flex justify-between items-center border-b border-white/5 z-10">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-teal-300 transition">
            <Home size={18} />
            <span className="font-bold tracking-wider hidden md:inline">PayFlow</span>
          </Link>
          <div className="h-4 w-[1px] bg-dark-700 hidden md:block" />
          <nav className="flex gap-4 text-sm font-semibold">
            <Link href="/streams" className="text-primary-light">Streams</Link>
            <Link href="/escrow" className="text-dark-600 hover:text-white transition">Escrows</Link>
          </nav>
        </div>
        <WalletButton />
      </header>

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto px-6 py-12 flex-grow space-y-8 z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Active Streams</h2>
            <p className="text-xs text-dark-600">Track and manage your continuous real-time payouts</p>
          </div>
          <Link
            href="/streams/create"
            className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 transition duration-200"
          >
            <Plus size={16} />
            New Stream
          </Link>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div className="flex gap-2">
            {(['All', 'Active', 'Paused', 'Cancelled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  filter === status
                    ? "bg-dark-700 text-white border border-white/10"
                    : "text-dark-600 hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="text-xs text-dark-600 font-semibold flex items-center gap-1.5">
            <SlidersHorizontal size={14} />
            <span>Showing {filteredStreams.length} streams</span>
          </div>
        </div>

        {/* Streams Grid */}
        {filteredStreams.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStreams.map((stream) => (
              <StreamCard key={stream.id.toString()} stream={stream} />
            ))}
          </div>
        ) : (
          <div className="glass p-12 rounded-2xl text-center border border-white/5">
            <LayoutGrid className="mx-auto text-dark-600 mb-4" size={40} />
            <h3 className="text-lg font-bold mb-1">No Streams Found</h3>
            <p className="text-xs text-dark-600">Get started by creating your first token stream.</p>
          </div>
        )}
      </main>

      <footer className="w-full glass py-6 text-center border-t border-white/5 text-xs text-dark-600 z-10">
        &copy; {new Date().getFullYear()} PayFlow Protocol.
      </footer>
    </div>
  );
}
