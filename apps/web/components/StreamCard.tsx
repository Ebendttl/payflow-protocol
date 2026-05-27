"use client";

// TODO(issue): #M2 — Implement animated streaming progress bar
import type { Stream } from '@payflow/sdk';
import ClaimButton from './ClaimButton';

interface StreamCardProps {
  stream: Stream;
}

const STATUS_STYLES: Record<string, string> = {
  Active:    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Paused:    'bg-amber-500/20  text-amber-300  border-amber-500/30',
  Cancelled: 'bg-rose-500/20   text-rose-300   border-rose-500/30',
  Completed: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

export default function StreamCard({ stream }: StreamCardProps) {
  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Static progress: 0% until contributor wires live RAF loop (issue #M2)
  const progressPct = 0;

  return (
    <div className="glass px-6 py-6 rounded-2xl flex flex-col justify-between h-72 w-full relative overflow-hidden transition-all duration-300 hover:scale-[1.02] border border-white/5">
      <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-xs uppercase tracking-wider font-semibold text-dark-600">Recipient</p>
          <p className="font-mono text-sm text-teal-300 font-semibold">{truncate(stream.recipient)}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase border ${STATUS_STYLES[stream.status] ?? STATUS_STYLES.Active}`}>
          {stream.status}
        </span>
      </div>

      {/* Asset + amount */}
      <div className="my-auto">
        <p className="text-xs text-dark-600 font-medium mb-0.5">Total Amount</p>
        <p className="text-3xl font-extrabold tracking-tight text-white">
          {(Number(stream.totalAmount) / 1e7).toFixed(4)}
          <span className="text-sm font-semibold text-teal-400 ml-1">{stream.token.slice(0, 6)}</span>
        </p>
      </div>

      {/* Progress bar — static stub */}
      <div className="w-full mb-4">
        <div className="flex justify-between text-xs text-dark-600 mb-1">
          <span>Streamed</span>
          <span>{progressPct}%</span>
        </div>
        <div className="w-full h-2.5 bg-dark-700 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-200"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Claim */}
      <ClaimButton streamId={stream.id} />
    </div>
  );
}
