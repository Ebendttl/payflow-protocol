'use client';

import { useState, useEffect } from 'react';
import type { Stream } from '@payflow/sdk';
import ClaimButton from './ClaimButton';
import { useWalletStore } from '../lib/store/walletStore';
import { createPayFlowClient, getActiveWalletAdapter } from '../lib/stellar';
import { Loader2, Pause, Play, XOctagon } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface StreamCardProps {
  stream: Stream;
  onRefetch?: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Paused: 'bg-amber-500/10  text-amber-300  border-amber-500/20',
  Cancelled: 'bg-rose-500/10   text-rose-300   border-rose-500/20',
  Completed: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
};

function calculateActiveDuration(now: number, stream: Stream): number {
  const startTime = Number(stream.startTime);
  const pausedAt = stream.pausedAt ? Number(stream.pausedAt) : null;
  const totalPausedDuration = Number(stream.totalPausedDuration);
  const endTime = Number(stream.endTime);

  if (now < startTime) {
    return 0;
  }

  let timePassed = now - startTime;
  if (pausedAt !== null) {
    timePassed = pausedAt - startTime;
  }

  const activeDuration = timePassed > totalPausedDuration ? timePassed - totalPausedDuration : 0;
  const totalDuration = endTime - startTime;

  return activeDuration > totalDuration ? totalDuration : activeDuration;
}

function calculateAccrued(now: number, stream: Stream): bigint {
  if (stream.status === 'Completed') {
    return stream.totalAmount;
  }
  if (stream.status === 'Cancelled') {
    return stream.claimedAmount;
  }

  const activeDuration = calculateActiveDuration(now, stream);
  const totalDuration = Number(stream.endTime) - Number(stream.startTime);

  if (totalDuration <= 0) {
    return stream.totalAmount;
  }

  if (activeDuration >= totalDuration) {
    return stream.totalAmount;
  }

  return (stream.totalAmount * BigInt(activeDuration)) / BigInt(totalDuration);
}

export default function StreamCard({ stream, onRefetch }: StreamCardProps) {
  const { publicKey, walletType } = useWalletStore();
  const [now, setNow] = useState<number>(Math.floor(Date.now() / 1000));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Run a real-time interval to update the accrued amount locally every second
  useEffect(() => {
    if (stream.status !== 'Active') {
      return;
    }
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [stream.status]);

  const accrued = calculateAccrued(now, stream);
  const claimable = accrued > stream.claimedAmount ? accrued - stream.claimedAmount : 0n;

  const totalNum = Number(stream.totalAmount);
  const progressPct =
    totalNum > 0 ? Math.min(100, Math.max(0, Math.round((Number(accrued) / totalNum) * 100))) : 0;

  const isOwner = publicKey !== null && publicKey === stream.sender;
  const isRecipient = publicKey !== null && publicKey === stream.recipient;

  const handlePause = async () => {
    setLoading(true);
    setError(null);
    const toastId = toast.loading('Pausing continuous token flow...');
    try {
      const wallet = await getActiveWalletAdapter(walletType);
      const client = createPayFlowClient(wallet);
      await client.streams.pauseStream({ streamId: stream.id });
      toast.success('Stream paused successfully!', { id: toastId });
      if (onRefetch) onRefetch();
    } catch (err: any) {
      const msg = err.message || String(err);
      setError(msg);
      toast.error(`Pause failed: ${msg}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    setLoading(true);
    setError(null);
    const toastId = toast.loading('Resuming continuous token flow...');
    try {
      const wallet = await getActiveWalletAdapter(walletType);
      const client = createPayFlowClient(wallet);
      await client.streams.resumeStream({ streamId: stream.id });
      toast.success('Stream resumed successfully!', { id: toastId });
      if (onRefetch) onRefetch();
    } catch (err: any) {
      const msg = err.message || String(err);
      setError(msg);
      toast.error(`Resume failed: ${msg}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    const toastId = toast.loading('Cancelling stream & returning unspent balance...');
    try {
      const wallet = await getActiveWalletAdapter(walletType);
      const client = createPayFlowClient(wallet);
      await client.streams.cancelStream({ streamId: stream.id });
      toast.success('Stream cancelled successfully!', { id: toastId });
      if (onRefetch) onRefetch();
    } catch (err: any) {
      const msg = err.message || String(err);
      setError(msg);
      toast.error(`Cancellation failed: ${msg}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="glass px-6 py-6 rounded-2xl flex flex-col justify-between min-h-[320px] w-full relative overflow-hidden transition-all duration-350 hover:scale-[1.01] hover:shadow-lg hover:shadow-black/20 border border-white/5"
    >
      <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-xxs uppercase tracking-wider font-bold text-dark-500">Recipient</p>
          <p className="font-mono text-xs text-teal-300 font-semibold">
            {truncate(stream.recipient)}
          </p>
        </div>
        <span
          className={`text-xxs px-2.5 py-1 rounded-full font-bold uppercase border ${STATUS_STYLES[stream.status] ?? STATUS_STYLES.Active}`}
        >
          {stream.status}
        </span>
      </div>

      {/* Main Stats */}
      <div className="my-4 space-y-3">
        <div>
          <p className="text-xxs text-dark-500 font-bold uppercase tracking-wider">
            Accrued / Total
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">
              {(Number(accrued) / 1e7).toFixed(4)}
            </span>
            <span className="text-xs text-dark-400">
              / {(Number(stream.totalAmount) / 1e7).toFixed(2)} {stream.token.slice(0, 6)}
            </span>
          </div>
        </div>

        <div className="flex justify-between border-t border-white/5 pt-2.5 text-xxs font-mono">
          <div>
            <span className="text-dark-500 block">CLAIMED</span>
            <span className="text-white">{(Number(stream.claimedAmount) / 1e7).toFixed(4)}</span>
          </div>
          <div className="text-right">
            <span className="text-dark-500 block">CLAIMABLE</span>
            <span className="text-emerald-400 font-bold">
              {(Number(claimable) / 1e7).toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full mb-4">
        <div className="flex justify-between text-xxs text-dark-400 mb-1">
          <span>Streaming Progress</span>
          <span>{progressPct}%</span>
        </div>
        <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-primary transition-all duration-350"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {error && (
        <p className="text-xxs text-accent-rose bg-rose-500/10 p-2 rounded-xl mb-2 border border-accent-rose/20 break-all">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-auto">
        {loading ? (
          <div className="flex justify-center items-center py-2.5">
            <Loader2 size={18} className="animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Owner Actions */}
            {isOwner && (
              <div className="flex gap-2 w-full">
                {stream.status === 'Active' && (
                  <button
                    onClick={handlePause}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-dark-700 hover:bg-dark-600 text-white py-2 rounded-xl text-xs font-bold transition border border-white/10"
                  >
                    <Pause size={12} />
                    Pause
                  </button>
                )}
                {stream.status === 'Paused' && (
                  <button
                    onClick={handleResume}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 py-2 rounded-xl text-xs font-bold transition border border-emerald-500/20"
                  >
                    <Play size={12} />
                    Resume
                  </button>
                )}
                {(stream.status === 'Active' || stream.status === 'Paused') && (
                  <button
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-accent-rose py-2 rounded-xl text-xs font-bold transition border border-accent-rose/20"
                  >
                    <XOctagon size={12} />
                    Cancel
                  </button>
                )}
              </div>
            )}

            {/* Recipient Action */}
            {isRecipient &&
              (stream.status === 'Active' ||
                stream.status === 'Paused' ||
                stream.status === 'Completed') &&
              claimable > 0n && <ClaimButton streamId={stream.id} onSuccess={onRefetch} />}
          </>
        )}
      </div>
    </motion.div>
  );
}
