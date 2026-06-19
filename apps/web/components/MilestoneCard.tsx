"use client";

// TODO(issue): #M2 — Implement animated streaming progress bar
// TODO(issue): #M3 — Implement milestone approval card

import type { Milestone } from '@payflow/sdk';
import { useWalletStore } from '../lib/store/walletStore';
import { CheckCircle2, Users } from 'lucide-react';

interface MilestoneCardProps {
  milestone: Milestone;
  milestoneIndex: number;
  escrowId: bigint;
  approvers: string[];
  connectedAddress: string | null;
}

export default function MilestoneCard({
  milestone,
  milestoneIndex,
  escrowId,
  approvers,
  connectedAddress,
}: MilestoneCardProps) {
  const isReleased = milestone.status === 'Released';
  const isApprover  = connectedAddress ? approvers.includes(connectedAddress) : false;

  const handleApprove = () => {
    // TODO(issue): #M3 — Call EscrowClient.approveMilestone() and refresh state
    console.log(`approve milestone ${milestoneIndex} on escrow #${escrowId} — not implemented, see issue #M3`);
  };

  return (
    <div className={`glass p-6 rounded-2xl border transition-all duration-300 ${isReleased ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-bold text-teal-400 uppercase tracking-widest">Milestone #{milestoneIndex + 1}</p>
          <h4 className="text-lg font-bold text-white mt-0.5">{milestone.title}</h4>
        </div>
        <p className="text-xl font-extrabold text-white">
          {(Number(milestone.amount) / 1e7).toFixed(4)}
          <span className="text-xs text-dark-600 font-semibold ml-1">USDC</span>
        </p>
      </div>

      {/* Approval count vs threshold */}
      <div className="flex items-center gap-1.5 text-xs text-dark-600 font-semibold mb-4">
        <Users size={14} />
        <span>Approvals: {milestone.approvalCount} of {approvers.length} required</span>
      </div>

      {/* Approve / Released button */}
      {isReleased ? (
        <div className="w-full py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-1.5">
          <CheckCircle2 size={16} /> Funds Released
        </div>
      ) : (
        <button
          id={`approve-milestone-${escrowId}-${milestoneIndex}`}
          onClick={handleApprove}
          disabled={!isApprover}
          className="w-full py-2.5 bg-primary hover:bg-primary-light text-white rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {isApprover ? 'Approve Milestone' : 'Not an Approver'}
        </button>
      )}
    </div>
  );
}
