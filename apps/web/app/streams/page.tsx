"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import StreamCard from '../../components/StreamCard';
import WalletButton from '../../components/WalletButton';
import { useWalletStore } from '../../lib/store/walletStore';
import { useStreams } from '../../lib/hooks/useStream';
import { Plus, LayoutGrid, SlidersHorizontal, Home, Wallet, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

export default function StreamsDashboard() {
  const { publicKey, connect, isConnecting } = useWalletStore();
  const [filter, setFilter] = useState<'All' | 'Active' | 'Paused' | 'Cancelled'>('All');

  // Fetch live streams from the blockchain via StreamClient
  const { streams, isLoading, error, refetch } = useStreams(publicKey);

  const filteredStreams = streams.filter(s => filter === 'All' || s.status === filter);

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
            <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Active Streams
              {publicKey && (
                <button
                  onClick={refetch}
                  disabled={isLoading}
                  className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-400 hover:text-white transition disabled:opacity-50"
                  title="Refresh streams"
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin text-primary' : ''} />
                </button>
              )}
            </h2>
            <p className="text-xs text-dark-500">Track and manage your continuous real-time payouts</p>
          </div>
          {publicKey && (
            <Link
              href="/streams/create"
              className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 transition duration-200"
            >
              <Plus size={16} />
              New Stream
            </Link>
          )}
        </div>

        {!publicKey ? (
          /* Wallet Not Connected CTA */
          <div className="glass p-12 rounded-3xl text-center border border-white/5 max-w-lg mx-auto my-12 space-y-6 animate-in fade-in duration-300">
            <div className="h-16 w-16 bg-gradient-to-tr from-primary to-accent rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/10">
              <Wallet className="text-white" size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Connect Your Wallet</h3>
              <p className="text-sm text-dark-400 leading-relaxed">
                Connect your Freighter wallet to view your outgoing streams, manage paused streams, or establish new real-time payment channels.
              </p>
            </div>
            <button
              onClick={connect}
              disabled={isConnecting}
              className="mx-auto flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 px-6 py-3 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
            >
              {isConnecting ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
              {isConnecting ? 'Connecting Wallet…' : 'Connect Freighter Wallet'}
            </button>
          </div>
        ) : error ? (
          /* Error State */
          <div className="glass p-8 rounded-2xl border border-rose-500/20 max-w-lg mx-auto text-center space-y-4">
            <AlertCircle className="mx-auto text-rose-400" size={36} />
            <div className="space-y-1">
              <h3 className="text-md font-bold text-white">Failed to Load Streams</h3>
              <p className="text-xs text-dark-400 break-all">{error}</p>
            </div>
            <button
              onClick={refetch}
              className="bg-dark-800 hover:bg-dark-700 text-white border border-white/5 px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 mx-auto"
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        ) : isLoading && streams.length === 0 ? (
          /* Loading State */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass p-6 rounded-2xl h-72 w-full border border-white/5 animate-pulse flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-dark-700 rounded" />
                  <div className="h-4 w-32 bg-dark-700 rounded" />
                </div>
                <div className="h-8 w-24 bg-dark-700 rounded" />
                <div className="space-y-2">
                  <div className="h-3 w-12 bg-dark-700 rounded" />
                  <div className="h-2 w-full bg-dark-700 rounded" />
                </div>
                <div className="h-8 w-full bg-dark-700 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          /* Dashboard Content */
          <div className="space-y-6 animate-in fade-in duration-300">
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
              <div className="text-xs text-dark-500 font-semibold flex items-center gap-1.5">
                <SlidersHorizontal size={14} />
                <span>Showing {filteredStreams.length} streams</span>
              </div>
            </div>

            {/* Streams Grid */}
            {filteredStreams.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredStreams.map((stream) => (
                  <StreamCard key={stream.id.toString()} stream={stream} onRefetch={refetch} />
                ))}
              </div>
            ) : (
              <div className="glass p-12 rounded-2xl text-center border border-white/5">
                <LayoutGrid className="mx-auto text-dark-600 mb-4" size={40} />
                <h3 className="text-lg font-bold mb-1 text-white">No Streams Found</h3>
                <p className="text-xs text-dark-500">Get started by creating your first token stream.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="w-full glass py-6 text-center border-t border-white/5 text-xs text-dark-600 z-10">
        &copy; {new Date().getFullYear()} PayFlow Protocol.
      </footer>
    </div>
  );
}
