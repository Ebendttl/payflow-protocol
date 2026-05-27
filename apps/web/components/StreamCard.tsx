"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Stream } from '@payflow/sdk';
import ClaimButton from './ClaimButton.js';
import { RefreshCw, Play, Pause, Trash2 } from 'lucide-react';

interface StreamCardProps {
  stream: Stream;
}

export default function StreamCard({ stream }: StreamCardProps) {
  const [claimable, setClaimable] = useState<bigint>(0n);
  const [percentStreamed, setPercentStreamed] = useState<number>(0);
  const requestRef = useRef<number>();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-accent-emerald text-white';
      case 'Paused': return 'bg-accent-amber text-black';
      case 'Cancelled': return 'bg-accent-rose text-white';
      default: return 'bg-accent-purple text-white';
    }
  };

  const updateProgress = () => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const start = stream.startTime;
    const end = stream.endTime;
    const total = stream.totalAmount;

    if (now < start) {
      setPercentStreamed(0);
      setClaimable(0n);
    } else if (now >= end) {
      setPercentStreamed(100);
      const totalClaimable = total - stream.claimedAmount;
      setClaimable(totalClaimable > 0n ? totalClaimable : 0n);
    } else {
      const duration = end - start;
      const elapsed = now - start;
      
      // Calculate streamed amount
      const accrued = (elapsed * total) / duration;
      const currentClaimable = accrued - stream.claimedAmount;

      setClaimable(currentClaimable > 0n ? currentClaimable : 0n);
      setPercentStreamed(Number((elapsed * 100n) / duration));
    }

    requestRef.current = requestAnimationFrame(updateProgress);
  };

  useEffect(() => {
    if (stream.status === 'Active') {
      requestRef.current = requestAnimationFrame(updateProgress);
    } else {
      // Calculate statically
      const total = stream.totalAmount;
      const claimed = stream.claimedAmount;
      const percent = total > 0n ? Number((claimed * 100n) / total) : 0;
      setPercentStreamed(percent);
      setClaimable(0n);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [stream]);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="glass px-6 py-6 rounded-2xl flex flex-col justify-between h-72 w-full max-w-md relative overflow-hidden transition-all duration-300 hover:scale-[1.02]">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-dark-600">To</span>
          <span className="font-mono text-sm text-teal-300 font-semibold">{truncate(stream.recipient)}</span>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${getStatusColor(stream.status)}`}>
          {stream.status}
        </span>
      </div>

      {/* Accrued Values */}
      <div className="my-auto flex flex-col gap-1">
        <span className="text-xs text-dark-600 font-medium">Accumulated Balance</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-dark-600 bg-clip-text text-transparent">
            {((Number(stream.claimedAmount) + Number(claimable)) / 10**7).toFixed(4)}
          </span>
          <span className="text-sm font-semibold text-teal-400">{stream.token}</span>
        </div>
        <span className="text-xs text-dark-600">
          Claimed: {Number(stream.claimedAmount) / 10**7} / {Number(stream.totalAmount) / 10**7} {stream.token}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full mt-4 mb-4">
        <div className="flex justify-between text-xs text-dark-600 mb-1">
          <span>Streamed</span>
          <span>{percentStreamed}%</span>
        </div>
        <div className="w-full h-2.5 bg-dark-700 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-200"
            style={{ width: `${percentStreamed}%` }}
          />
        </div>
      </div>

      {/* Footer / Claim Button */}
      <div className="flex items-center gap-3">
        <ClaimButton
          streamId={stream.id}
          claimableAmount={claimable}
          tokenSymbol={stream.token}
        />
        {stream.status === 'Active' ? (
          <button
            onClick={() => {/* TODO(issue): #57 — Pause stream logic */}}
            className="p-3 bg-dark-700 hover:bg-dark-600 rounded-lg text-accent-amber border border-white/5 transition"
            title="Pause stream"
          >
            <Pause size={16} />
          </button>
        ) : stream.status === 'Paused' ? (
          <button
            onClick={() => {/* TODO(issue): #58 — Resume stream logic */}}
            className="p-3 bg-dark-700 hover:bg-dark-600 rounded-lg text-accent-emerald border border-white/5 transition"
            title="Resume stream"
          >
            <Play size={16} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
