"use client";

import React, { useState } from 'react';
import { Escrow } from '@payflow/sdk';
import MilestoneCard from './MilestoneCard.js';
import { Ban, ShieldAlert, Award, FileSpreadsheet } from 'lucide-react';

interface EscrowPanelProps {
  escrow: Escrow;
}

export default function EscrowPanel({ escrow }: EscrowPanelProps) {
  const [loading, setLoading] = useState(false);
  const [cancelled, setCancelled] = useState(escrow.cancelled);

  const handleCancel = async () => {
    if (cancelled) return;
    setLoading(true);
    try {
      // TODO(issue): #61 — Invoke cancelEscrow on SDK EscrowClient using Freighter.
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCancelled(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const releasedAmount = escrow.milestones
    .filter(m => m.released)
    .reduce((sum, m) => sum + m.amount, 0n);

  const totalAmount = escrow.totalAmount;
  const progressPercent = totalAmount > 0n ? Number((releasedAmount * 100n) / totalAmount) : 0;

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Escrow Details Header */}
      <div className="glass p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-accent px-3 py-1 bg-accent/20 rounded-full uppercase tracking-wider">Escrow Vault</span>
            {cancelled && <span className="text-xs font-bold text-accent-rose px-3 py-1 bg-accent-rose/20 rounded-full uppercase">Cancelled</span>}
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Escrow #{escrow.id.toString()}</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
            <div>
              <span className="text-dark-600 block mb-0.5 text-xs uppercase font-semibold">Sender</span>
              <span className="font-mono text-teal-300 font-semibold">{truncate(escrow.sender)}</span>
            </div>
            <div>
              <span className="text-dark-600 block mb-0.5 text-xs uppercase font-semibold">Recipient</span>
              <span className="font-mono text-teal-300 font-semibold">{truncate(escrow.recipient)}</span>
            </div>
            <div className="col-span-2 md:col-span-1">
              <span className="text-dark-600 block mb-0.5 text-xs uppercase font-semibold">Token Asset</span>
              <span className="font-semibold text-white">{escrow.token}</span>
            </div>
          </div>
        </div>

        {/* Big Balance display */}
        <div className="flex flex-col justify-between items-end">
          <div className="text-right">
            <span className="text-xs text-dark-600 block font-semibold uppercase">Total Escrow Value</span>
            <span className="text-4xl font-black bg-gradient-to-r from-white to-dark-600 bg-clip-text text-transparent">
              {Number(totalAmount) / 10**7}
            </span>
          </div>

          {!cancelled && releasedAmount < totalAmount && (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="mt-4 flex items-center gap-1.5 px-4 py-2 border border-accent-rose/30 hover:bg-accent-rose/10 text-accent-rose text-xs font-bold rounded-lg transition"
            >
              <Ban size={14} />
              {loading ? "Cancelling..." : "Reclaim Unreleased Funds"}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass p-6 rounded-2xl border border-white/5 space-y-3">
        <div className="flex justify-between items-center text-sm font-semibold">
          <span className="text-dark-600 flex items-center gap-1.5">
            <Award size={16} className="text-primary" />
            Disbursement Progress
          </span>
          <span>{Number(releasedAmount) / 10**7} / {Number(totalAmount) / 10**7} USDC ({progressPercent}%)</span>
        </div>
        <div className="w-full h-3 bg-dark-700 rounded-full overflow-hidden border border-white/5">
          <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Milestones list */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <FileSpreadsheet size={20} className="text-teal-400" />
          Milestones & Release Quorum
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {escrow.milestones.map((milestone, idx) => (
            <MilestoneCard
              key={idx}
              milestone={milestone}
              milestoneIndex={idx}
              escrowId={escrow.id}
              threshold={escrow.threshold}
              approvers={escrow.approvers}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
