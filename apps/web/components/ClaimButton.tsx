'use client';

import { useState } from 'react';
import { createPayFlowClient, getActiveWalletAdapter } from '../lib/stellar';
import { useWalletStore } from '../lib/store/walletStore';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ClaimButtonProps {
  streamId: bigint;
  onSuccess?: () => void;
}

export default function ClaimButton({ streamId, onSuccess }: ClaimButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { walletType } = useWalletStore();

  const handleClaim = async () => {
    setLoading(true);
    setError(null);
    const toastId = toast.loading('Submitting claim transaction...');
    try {
      const wallet = await getActiveWalletAdapter(walletType);
      const client = createPayFlowClient(wallet);
      await client.streams.claim({ streamId });
      toast.success('Tokens claimed successfully!', { id: toastId });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const msg = err.message || String(err);
      setError(msg);
      toast.error(`Claim failed: ${msg}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-1.5 mt-2">
      {error && (
        <p className="text-xxs text-accent-rose font-medium break-all bg-rose-500/10 p-2 rounded-xl border border-accent-rose/20">
          {error}
        </p>
      )}
      <button
        id={`claim-btn-${streamId}`}
        onClick={handleClaim}
        disabled={loading}
        className="w-full bg-primary hover:bg-primary-light disabled:opacity-50 text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
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
