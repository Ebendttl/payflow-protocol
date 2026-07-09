'use client';

// TODO(issue): #M3 — Implement full escrow management panel
import type { Escrow } from '@payflow/sdk';
import MilestoneCard from './MilestoneCard';
import { useWalletStore } from '../lib/store/walletStore';

interface EscrowPanelProps {
  escrow: Escrow;
}

export default function EscrowPanel({ escrow }: EscrowPanelProps) {
  const { publicKey } = useWalletStore();

  const releasedCount = escrow.milestones.filter((m) => m.status === 'Released').length;

  return (
    <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
      {/* Escrow summary */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-dark-600 font-semibold uppercase mb-0.5">
            Escrow #{String(escrow.id)}
          </p>
          <p className="text-sm font-mono text-teal-300">
            {escrow.recipient.slice(0, 8)}…{escrow.recipient.slice(-4)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-white">
            {(Number(escrow.totalAmount) / 1e7).toFixed(2)}
          </p>
          <p className="text-xs text-dark-600">
            Milestones: {releasedCount}/{escrow.milestones.length} released
          </p>
        </div>
      </div>

      {/* Milestone cards */}
      <div className="grid gap-4">
        {escrow.milestones.map((milestone, idx) => (
          <MilestoneCard
            key={idx}
            milestone={milestone}
            milestoneIndex={idx}
            escrowId={escrow.id}
            approvers={escrow.approvers}
            connectedAddress={publicKey}
          />
        ))}
      </div>
    </div>
  );
}
