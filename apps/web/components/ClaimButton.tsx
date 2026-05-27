"use client";

import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface ClaimButtonProps {
  streamId: bigint;
  claimableAmount: bigint;
  tokenSymbol: string;
}

export default function ClaimButton({ streamId, claimableAmount, tokenSymbol }: ClaimButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleClaim = async () => {
    if (claimableAmount <= 0n) return;
    setLoading(true);
    try {
      // TODO(issue): #56 — Instantiate SDK StreamClient, execute claim transaction via freighter wallet.
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Mocking transaction
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Claim transaction failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClaim}
      disabled={loading || claimableAmount <= 0n}
      className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
        success
          ? "bg-accent-emerald text-white"
          : claimableAmount > 0n
          ? "bg-primary hover:bg-primary-light text-white shadow-md shadow-primary/20"
          : "bg-dark-700 text-dark-600 border border-dark-600 cursor-not-allowed"
      }`}
    >
      {loading ? (
        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      ) : success ? (
        "Claimed Successfully!"
      ) : (
        <>
          Claim {Number(claimableAmount) / 10**7} {tokenSymbol}
          <ArrowUpRight size={16} />
        </>
      )}
    </button>
  );
}
