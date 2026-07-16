'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StreamCard, { calculateAccrued } from '../../components/StreamCard';
import { useWalletStore } from '../../lib/store/walletStore';
import { useStreams, useIncomingStreams } from '../../lib/hooks/useStream';
import { createPayFlowClient, getActiveWalletAdapter } from '../../lib/stellar';
import {
  Plus,
  LayoutGrid,
  SlidersHorizontal,
  Wallet,
  Loader2,
  RefreshCw,
  AlertCircle,
  Download,
  Upload,
  Coins,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '../../components/ui/Skeleton';
import { toast } from 'react-hot-toast';

import WalletOptionButton from '../../components/ui/WalletOptionButton';

const gridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function StreamsDashboard() {
  const { publicKey, connect, isConnecting, connectionError, walletType } = useWalletStore();
  const [filter, setFilter] = useState<'All' | 'Active' | 'Paused' | 'Cancelled'>('All');
  const [tab, setTab] = useState<'outgoing' | 'incoming'>('outgoing');
  const [isClaimingAll, setIsClaimingAll] = useState(false);
  const [claimProgress, setClaimProgress] = useState('');
  const [now, setNow] = useState<number>(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleConnect = async (type: 'freighter' | 'lobstr') => {
    try {
      await connect(type);
    } catch (_) {
      /* error is in connectionError state */
    }
  };

  // Fetch live streams from the blockchain via StreamClient
  const { streams: outgoingStreams, isLoading: isLoadingOutgoing, error: errorOutgoing, refetch: refetchOutgoing } = useStreams(publicKey);
  const { streams: incomingStreams, isLoading: isLoadingIncoming, error: errorIncoming, refetch: refetchIncoming } = useIncomingStreams(publicKey);

  const activeStreams = tab === 'outgoing' ? outgoingStreams : incomingStreams;
  const isLoading = tab === 'outgoing' ? isLoadingOutgoing : isLoadingIncoming;
  const error = tab === 'outgoing' ? errorOutgoing : errorIncoming;

  const refetch = () => {
    refetchOutgoing();
    refetchIncoming();
  };

  const filteredStreams = activeStreams.filter((s) => filter === 'All' || s.status === filter);

  // Compute number of claimable incoming streams
  const claimableIncomingStreams = incomingStreams.filter((stream) => {
    if (stream.status !== 'Active' && stream.status !== 'Paused' && stream.status !== 'Completed') {
      return false;
    }
    const accrued = calculateAccrued(now, stream);
    const claimable = accrued > stream.claimedAmount ? accrued - stream.claimedAmount : 0n;
    return claimable > 0n;
  });

  const handleClaimAll = async () => {
    if (claimableIncomingStreams.length === 0) {
      toast.error('No claimable balances found.');
      return;
    }

    setIsClaimingAll(true);
    const toastId = toast.loading(`Initiating claims for ${claimableIncomingStreams.length} streams...`);

    try {
      const wallet = await getActiveWalletAdapter(walletType);
      const client = createPayFlowClient(wallet);

      for (let i = 0; i < claimableIncomingStreams.length; i++) {
        const stream = claimableIncomingStreams[i];
        setClaimProgress(`Claiming ${i + 1}/${claimableIncomingStreams.length}...`);
        toast.loading(`[${i + 1}/${claimableIncomingStreams.length}] Requesting claim for Stream #${stream.id}...`, { id: toastId });
        await client.streams.claim({ streamId: stream.id });
      }

      toast.success('All pending balances claimed successfully!', { id: toastId });
      refetch();
    } catch (err: any) {
      const msg = err.message || String(err);
      toast.error(`Claim All failed: ${msg}`, { id: toastId });
    } finally {
      setIsClaimingAll(false);
      setClaimProgress('');
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] bg-dark-900 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] h-[50%] w-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto px-6 py-12 flex-grow space-y-8 z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                Streams
                {publicKey && (
                  <button
                    onClick={refetch}
                    disabled={isLoading}
                    className="p-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-dark-400 hover:text-white transition disabled:opacity-50"
                    title="Refresh streams"
                  >
                    <RefreshCw size={14} className={isLoading ? 'animate-spin text-primary' : ''} />
                  </button>
                )}
              </h2>
              <p className="text-xs text-dark-500">
                Track and manage your continuous real-time payouts
              </p>
            </div>

            {publicKey && (
              <div className="flex bg-dark-800 p-1 rounded-2xl border border-white/5 gap-1 self-start sm:self-auto shadow-md">
                <button
                  onClick={() => setTab('outgoing')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    tab === 'outgoing'
                      ? 'bg-dark-700 text-white border border-white/5'
                      : 'text-dark-500 hover:text-white'
                  }`}
                >
                  <Upload size={14} />
                  <span>Outgoing ({outgoingStreams.length})</span>
                </button>
                <button
                  onClick={() => setTab('incoming')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    tab === 'incoming'
                      ? 'bg-dark-700 text-white border border-white/5'
                      : 'text-dark-500 hover:text-white'
                  }`}
                >
                  <Download size={14} />
                  <span>Incoming ({incomingStreams.length})</span>
                </button>
              </div>
            )}
          </div>

          {publicKey && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              {tab === 'incoming' && claimableIncomingStreams.length > 0 && (
                <button
                  onClick={handleClaimAll}
                  disabled={isClaimingAll}
                  className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.02]"
                >
                  {isClaimingAll ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{claimProgress || 'Claiming...'}</span>
                    </>
                  ) : (
                    <>
                      <Coins size={16} />
                      <span>Claim All ({claimableIncomingStreams.length})</span>
                    </>
                  )}
                </button>
              )}

              <Link
                href="/streams/create"
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.02] w-full sm:w-auto"
              >
                <Plus size={16} />
                New Stream
              </Link>
            </div>
          )}
        </div>

        {!publicKey ? (
          /* Wallet Not Connected CTA */
          <div className="glass p-12 rounded-2xl text-center border border-white/5 max-w-lg mx-auto my-12 space-y-6 animate-in fade-in duration-300">
            <div className="h-16 w-16 bg-dark-800 rounded-2xl border border-primary/20 flex items-center justify-center mx-auto">
              <Wallet className="text-primary" size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Connect Your Wallet</h3>
              <p className="text-sm text-dark-400 leading-relaxed">
                Connect your Stellar wallet to view your outgoing streams, manage paused streams, or
                establish new real-time payment channels.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <WalletOptionButton
                onClick={() => handleConnect('freighter')}
                disabled={isConnecting}
                label="Freighter"
                isConnecting={isConnecting && walletType === 'freighter'}
              />
              <WalletOptionButton
                onClick={() => handleConnect('lobstr')}
                disabled={isConnecting}
                label="LOBSTR"
                isConnecting={isConnecting && walletType === 'lobstr'}
              />
            </div>
            {connectionError && (
              <p className="text-xs text-accent-rose bg-rose-500/10 border border-accent-rose/20 rounded-xl px-4 py-2 max-w-md mx-auto">
                {connectionError}
              </p>
            )}
          </div>
        ) : error ? (
          /* Error State */
          <div className="glass p-8 rounded-2xl border border-rose-500/20 max-w-lg mx-auto text-center space-y-4">
            <AlertCircle className="mx-auto text-accent-rose" size={36} />
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
        ) : isLoading && activeStreams.length === 0 ? (
          /* Loading State Skeletons */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[320px] w-full p-6 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-dark-700 rounded-md" />
                    <div className="h-4 w-24 bg-dark-700 rounded-md" />
                  </div>
                  <div className="h-5 w-14 bg-dark-700 rounded-full" />
                </div>
                <div className="space-y-3">
                  <div className="h-3 w-20 bg-dark-700 rounded-md" />
                  <div className="h-7 w-40 bg-dark-700 rounded-md" />
                  <div className="h-8 w-full bg-dark-700 rounded-md" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-dark-700 rounded-md" />
                  <div className="h-2 w-full bg-dark-700 rounded-full" />
                </div>
                <div className="h-9 w-full bg-dark-700 rounded-xl" />
              </Skeleton>
            ))}
          </div>
        ) : (
          /* Dashboard Content */
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div className="flex gap-2">
                {(['All', 'Active', 'Paused', 'Cancelled'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                      filter === status
                        ? 'bg-dark-700 text-white border border-white/10'
                        : 'text-dark-600 hover:text-white'
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

            {/* Streams Grid with Stagger Motion */}
            {filteredStreams.length > 0 ? (
              <motion.div
                variants={gridVariants}
                initial="hidden"
                animate="show"
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {filteredStreams.map((stream) => (
                    <StreamCard key={stream.id.toString()} stream={stream} onRefetch={refetch} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="glass p-12 rounded-2xl text-center border border-white/5">
                <LayoutGrid className="mx-auto text-dark-600 mb-4" size={40} />
                <h3 className="text-lg font-bold mb-1 text-white">
                  {tab === 'outgoing' ? 'No Outgoing Streams Found' : 'No Incoming Streams Found'}
                </h3>
                <p className="text-xs text-dark-500">
                  {tab === 'outgoing'
                    ? 'Get started by creating your first token stream.'
                    : 'You do not have any active incoming payment streams.'}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

