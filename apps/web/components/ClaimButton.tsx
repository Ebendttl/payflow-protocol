"use client";

import { useState } from 'react';
import { createPayFlowClient } from '../lib/stellar';
import { FreighterWalletAdapter } from '@payflow/sdk';
import { Loader2 } from 'lucide-react';

interface ClaimButtonProps {
  streamId: bigint;
  onSuccess?: () => void;
}

export default function ClaimButton({ streamId, onSuccess }: ClaimButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClaim = async () => {
    setLoading(true);
    setError(null);
    try {
      const wallet = new FreighterWalletAdapter();
      const client = createPayFlowClient(wallet);
      await client.streams.claim({ streamId });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-1.5 mt-2">
      {error && (
        <p className="text-xxs text-rose-450 font-medium break-all bg-rose-500/10 p-2 rounded border border-rose-550/20">
          {error}
        </p>
      )}
      <button
        id={`claim-btn-${streamId}`}
        onClick={handleClaim}
        disabled={loading}
        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50 text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
      >
        {loading ? (
          <>
            <Loader2 size={12} className="animate-spin" />
            Claiming...
          </>
        ) : (
          'Claim Accrued'
        )}
      </button>
    </div>
  );
}
