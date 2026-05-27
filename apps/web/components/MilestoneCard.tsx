"use client";

import React, { useState } from 'react';
import { Milestone } from '@payflow/sdk';
import { useWalletStore } from '../lib/store/walletStore.js';
import { CheckCircle2, Award, Users } from 'lucide-react';

interface MilestoneCardProps {
  milestone: Milestone;
  milestoneIndex: number;
  escrowId: bigint;
  threshold: number;
  approvers: string[];
}

export default function MilestoneCard({
  milestone,
  milestoneIndex,
  escrowId,
  threshold,
  approvers
}: MilestoneCardProps) {
  const { address } = useWalletStore();
  const [loading, setLoading] = useState(false);

  const getInitials = (addr: string) => addr.slice(2, 4).toUpperCase();

  const isApprover = address ? approvers.includes(address) : false;
  const hasApproved = address ? milestone.approvals.includes(address) : false;
  const isReleased = milestone.released;

  const handleApprove = async () => {
    if (!isApprover || hasApproved || isReleased) return;
    setLoading(true);
    try {
      // TODO(issue): #60 — Invoke approveMilestone on SDK EscrowClient using Freighter.
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock
      milestone.approvals.push(address!); // Optimistic update
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`glass p-6 rounded-2xl border transition-all duration-300 relative ${
      isReleased
        ? "border-accent-emerald/30 bg-accent-emerald/5"
        : "border-white/5"
    }`}>
      {isReleased && (
        <div className="absolute -top-3 -right-3 h-8 w-8 bg-accent-emerald text-white rounded-full flex items-center justify-center shadow-lg">
          <CheckCircle2 size={16} />
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Milestone #{milestoneIndex + 1}</span>
          <h4 className="text-lg font-bold text-white mt-0.5">{milestone.title}</h4>
        </div>
        <span className="text-xl font-extrabold text-white">
          {Number(milestone.amount) / 10**7} <span className="text-xs text-dark-600 font-semibold">USDC</span>
        </span>
      </div>

      {/* Approvers Grid */}
      <div className="mb-6 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs text-dark-600 font-semibold">
          <Users size={14} />
          <span>Approvals ({milestone.approvals.length} of {threshold} required)</span>
        </div>
        <div className="flex -space-x-2 overflow-hidden py-1">
          {approvers.map((appr, idx) => {
            const approved = milestone.approvals.includes(appr);
            return (
              <div
                key={idx}
                className={`inline-block h-8 w-8 rounded-full border-2 text-xs font-bold flex items-center justify-center transition-all ${
                  approved
                    ? "border-accent-emerald bg-accent-emerald/20 text-accent-emerald shadow-md"
                    : "border-dark-800 bg-dark-700 text-dark-600"
                }`}
                title={appr}
              >
                {getInitials(appr)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Approve Button */}
      {!isReleased ? (
        <button
          onClick={handleApprove}
          disabled={loading || !isApprover || hasApproved}
          className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
            hasApproved
              ? "bg-dark-700 text-dark-600 border border-dark-600 cursor-not-allowed"
              : isApprover
              ? "bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-purple text-white shadow-md shadow-primary/10"
              : "bg-dark-700/50 text-dark-600 border border-dark-700 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
          ) : hasApproved ? (
            "You Approved This Milestone"
          ) : isApprover ? (
            "Approve Milestone"
          ) : (
            "Not an Approver"
          )}
        </button>
      ) : (
        <div className="w-full py-2.5 bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-1.5">
          <Award size={16} />
          Funds Released
        </div>
      )}
    </div>
  );
}
