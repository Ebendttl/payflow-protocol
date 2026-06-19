"use client";

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useWalletStore } from '../lib/store/walletStore';
import { createPayFlowClient, getActiveWalletAdapter } from '../lib/stellar';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Button from './ui/Button';

// ─── Zod schemas for each wizard step ────────────────────────────────────────

export const Step1Schema = z.object({
  recipient: z.string().min(56, 'Must be a valid Stellar address (G...)').max(56),
  asset:     z.string().min(56, 'Must be a valid asset contract address (C...)').max(56),
  amount:    z.number({ invalid_type_error: 'Must be a number' }).positive('Amount must be > 0'),
});

export const Step2Schema = z.object({
  durationDays: z.number().int().positive('Duration must be at least 1 day'),
  startNow:     z.boolean(),
});

export const Step3Schema = z.object({
  confirmation: z.literal(true, { errorMap: () => ({ message: 'You must confirm to proceed' }) }),
});

type Step1 = z.infer<typeof Step1Schema>;
type Step2 = z.infer<typeof Step2Schema>;
type Step3 = z.infer<typeof Step3Schema>;

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateStreamForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTx, setSuccessTx] = useState<string | null>(null);

  const { publicKey, isConnected, connect, walletType } = useWalletStore();

  const form1 = useForm<Step1>({ resolver: zodResolver(Step1Schema) });
  const form2 = useForm<Step2>({ resolver: zodResolver(Step2Schema), defaultValues: { startNow: true } });
  const form3 = useForm<Step3>({ resolver: zodResolver(Step3Schema) });

  const onStep1 = form1.handleSubmit(() => setStep(2));
  const onStep2 = form2.handleSubmit(() => setStep(3));
  
  const onStep3 = form3.handleSubmit(async () => {
    if (!isConnected || !publicKey) {
      setError('Please connect your wallet first.');
      toast.error('Please connect your wallet first.');
      return;
    }
    setLoading(true);
    setError(null);
    const toastId = toast.loading("Deploying stream contract and locking tokens...");
    try {
      const wallet = await getActiveWalletAdapter(walletType);
      const client = createPayFlowClient(wallet);

      const val1 = form1.getValues();
      const val2 = form2.getValues();

      // Standard Stellar token decimals is 7.
      const totalAmount = BigInt(Math.round(val1.amount * 10000000));
      const durationSeconds = BigInt(val2.durationDays * 24 * 60 * 60);

      const txHash = await client.streams.createStream({
        sender: publicKey,
        recipient: val1.recipient,
        token: val1.asset,
        totalAmount,
        durationSeconds,
      });

      setSuccessTx(txHash);
      toast.success("Stream created successfully!", { id: toastId });
    } catch (err: any) {
      const msg = err.message || String(err);
      setError(msg);
      toast.error(`Transaction failed: ${msg}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  });

  const resetForm = () => {
    form1.reset();
    form2.reset();
    form3.reset();
    setSuccessTx(null);
    setError(null);
    setStep(1);
  };

  if (successTx) {
    return (
      <div className="glass p-8 rounded-2xl border border-emerald-500/30 max-w-lg w-full text-center space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-center">
          <CheckCircle2 size={64} className="text-emerald-400 animate-bounce" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white">Stream Created!</h3>
          <p className="text-sm text-dark-300 mt-2">
            Your real-time token stream has been successfully established on-chain.
          </p>
        </div>

        <div className="bg-dark-800/80 border border-white/5 rounded-xl p-4 text-left space-y-3 font-mono text-xs text-dark-300">
          <div>
            <span className="text-dark-500 block">RECIPIENT</span>
            <span className="text-teal-300 break-all">{form1.getValues('recipient')}</span>
          </div>
          <div>
            <span className="text-dark-500 block">ASSET CONTRACT</span>
            <span className="text-purple-300 break-all">{form1.getValues('asset')}</span>
          </div>
          <div className="flex justify-between">
            <div>
              <span className="text-dark-500 block">AMOUNT</span>
              <span className="text-white font-bold">{form1.getValues('amount')} tokens</span>
            </div>
            <div>
              <span className="text-dark-500 block">DURATION</span>
              <span className="text-white font-bold">{form2.getValues('durationDays')} days</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${successTx}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-dark-700 hover:bg-dark-600 border border-white/10 text-white py-3 rounded-xl text-sm font-semibold transition"
          >
            View on Stellar Expert
            <ExternalLink size={14} />
          </a>
          <div className="flex gap-3">
            <button
              onClick={resetForm}
              className="flex-1 bg-primary hover:bg-primary-light text-white py-3 rounded-xl text-sm font-semibold transition"
            >
              Create Another
            </button>
            <Link
              href="/streams"
              className="flex-1 flex items-center justify-center bg-dark-800 hover:bg-dark-700 text-white py-3 rounded-xl text-sm font-semibold border border-white/5 transition"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-8 rounded-2xl border border-white/5 max-w-lg w-full relative">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8 px-2">
        {([1, 2, 3] as const).map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${step === s ? 'border-primary bg-primary/20 text-primary shadow-[0_0_15px_rgba(20,241,149,0.3)]' : step > s ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300' : 'border-white/10 bg-white/5 text-dark-500'}`}>
              {s}
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 min-w-[40px] transition-all duration-300 ${step > s ? 'bg-emerald-500' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex gap-3 text-rose-400 text-sm animate-in slide-in-from-top-2 duration-250">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p className="break-all">{error}</p>
        </div>
      )}

      {/* Step 1: Recipient, Asset, Amount */}
      {step === 1 && (
        <form onSubmit={onStep1} className="space-y-5 animate-in fade-in duration-300">
          <div>
            <h3 className="text-xl font-bold text-white">Recipient & Asset</h3>
            <p className="text-xs text-dark-400 mt-1">Configure the destination address and the asset you want to stream.</p>
          </div>

          <div>
            <label className="text-xs text-dark-400 font-bold uppercase tracking-wider">Recipient Address</label>
            <input
              id="stream-recipient"
              type="text"
              {...form1.register('recipient')}
              placeholder="e.g. GB..."
              className="w-full mt-1.5 bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-dark-600 focus:outline-none focus:border-primary transition"
            />
            {form1.formState.errors.recipient && <p className="text-xs text-rose-400 mt-1.5">{form1.formState.errors.recipient.message}</p>}
          </div>

          <div>
            <label className="text-xs text-dark-400 font-bold uppercase tracking-wider">Asset Contract ID</label>
            <input
              id="stream-asset"
              type="text"
              {...form1.register('asset')}
              placeholder="e.g. CC..."
              className="w-full mt-1.5 bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-dark-600 focus:outline-none focus:border-primary transition"
            />
            {form1.formState.errors.asset && <p className="text-xs text-rose-400 mt-1.5">{form1.formState.errors.asset.message}</p>}
          </div>

          <div>
            <label className="text-xs text-dark-400 font-bold uppercase tracking-wider">Total Amount</label>
            <input
              id="stream-amount"
              type="number"
              step="any"
              {...form1.register('amount', { valueAsNumber: true })}
              placeholder="0.0"
              className="w-full mt-1.5 bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-dark-600 focus:outline-none focus:border-primary transition"
            />
            {form1.formState.errors.amount && <p className="text-xs text-rose-400 mt-1.5">{form1.formState.errors.amount.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white py-3.5 rounded-xl text-sm font-semibold transition mt-6"
          >
            Next Step
            <ArrowRight size={16} />
          </button>
        </form>
      )}

      {/* Step 2: Duration */}
      {step === 2 && (
        <form onSubmit={onStep2} className="space-y-5 animate-in fade-in duration-300">
          <div>
            <h3 className="text-xl font-bold text-white">Streaming Duration</h3>
            <p className="text-xs text-dark-400 mt-1">Specify how long the tokens will be streamed continuously.</p>
          </div>

          <div>
            <label className="text-xs text-dark-400 font-bold uppercase tracking-wider">Duration (days)</label>
            <input
              id="stream-duration"
              type="number"
              {...form2.register('durationDays', { valueAsNumber: true })}
              placeholder="30"
              className="w-full mt-1.5 bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-dark-600 focus:outline-none focus:border-primary transition"
            />
            {form2.formState.errors.durationDays && <p className="text-xs text-rose-400 mt-1.5">{form2.formState.errors.durationDays.message}</p>}
          </div>

          <div className="bg-dark-800/40 border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <input
              id="stream-start-now"
              type="checkbox"
              {...form2.register('startNow')}
              className="h-4 w-4 rounded border-white/10 bg-dark-800 text-primary focus:ring-primary focus:ring-offset-dark-900"
            />
            <div>
              <label htmlFor="stream-start-now" className="text-sm font-medium text-white cursor-pointer select-none">
                Start immediately
              </label>
              <p className="text-xxs text-dark-500">The stream will begin accruing tokens as soon as the transaction is confirmed.</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-3.5 rounded-xl text-sm font-semibold transition"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white py-3.5 rounded-xl text-sm font-semibold transition"
            >
              Next Step
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <form onSubmit={onStep3} className="space-y-5 animate-in fade-in duration-300">
          <div>
            <h3 className="text-xl font-bold text-white">Review & Confirm</h3>
            <p className="text-xs text-dark-400 mt-1">Review the streaming configuration and sign the transaction with Freighter.</p>
          </div>

          <div className="bg-dark-800/80 border border-white/5 rounded-xl p-4 space-y-3 font-mono text-xs text-dark-300">
            <div className="flex justify-between">
              <span className="text-dark-500">SENDER (YOU)</span>
              <span className="text-white text-right break-all max-w-[70%]">{publicKey ? `${publicKey.slice(0, 10)}...${publicKey.slice(-10)}` : 'Not Connected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500">RECIPIENT</span>
              <span className="text-teal-300 text-right break-all max-w-[70%]">{form1.getValues('recipient')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500">ASSET CONTRACT</span>
              <span className="text-purple-300 text-right break-all max-w-[70%]">{form1.getValues('asset')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500">TOTAL AMOUNT</span>
              <span className="text-white font-bold">{form1.getValues('amount')} tokens</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500">DURATION</span>
              <span className="text-white font-bold">{form2.getValues('durationDays')} days</span>
            </div>
          </div>

          <div className="bg-dark-800/40 border border-white/5 rounded-xl p-4 flex items-start gap-3">
            <input
              id="stream-confirm"
              type="checkbox"
              {...form3.register('confirmation')}
              className="h-4 w-4 rounded border-white/10 bg-dark-800 text-primary focus:ring-primary focus:ring-offset-dark-900 mt-0.5"
            />
            <div>
              <label htmlFor="stream-confirm" className="text-sm font-medium text-white cursor-pointer select-none">
                I confirm the stream details are correct
              </label>
              <p className="text-xxs text-dark-500">This action requires a signature and will lock tokens in the vault.</p>
            </div>
          </div>
          {form3.formState.errors.confirmation && <p className="text-xs text-rose-400">{form3.formState.errors.confirmation.message}</p>}

          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              onClick={() => setStep(2)}
              disabled={loading}
              variant="secondary"
              className="flex-1 py-3.5"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                'Sign & Create'
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
