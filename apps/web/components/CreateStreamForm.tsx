"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';

const formSchema = z.object({
  recipient: z.string().min(56, { message: "Invalid Stellar public key format" }).startsWith('G', { message: "Address must start with G" }),
  assetType: z.enum(['XLM', 'USDC', 'CUSTOM']),
  customAssetAddress: z.string().optional(),
  amount: z.coerce.number().positive({ message: "Amount must be greater than zero" }),
  duration: z.coerce.number().min(60, { message: "Duration must be at least 1 minute (60 seconds)" }),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateStreamForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetType: 'XLM',
      amount: 10,
      duration: 3600,
    }
  });

  const assetType = watch('assetType');
  const recipient = watch('recipient');
  const amount = watch('amount');
  const duration = watch('duration');
  const customAssetAddress = watch('customAssetAddress');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // TODO(issue): #59 — Build transaction using SDK, sign using Freighter wallet, and deploy stream vault.
      await new Promise(resolve => setTimeout(resolve, 2500)); // Mock deployment
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  if (success) {
    return (
      <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center text-center max-w-md w-full mx-auto">
        <div className="h-16 w-16 bg-accent-emerald/20 border border-accent-emerald text-accent-emerald rounded-full flex items-center justify-center mb-6">
          <Check size={32} />
        </div>
        <h3 className="text-2xl font-bold mb-2">Stream Created!</h3>
        <p className="text-dark-600 text-sm mb-6">Your real-time token payment stream has been successfully initialized on-chain.</p>
        <button
          onClick={() => { setSuccess(false); setStep(1); }}
          className="w-full bg-primary hover:bg-primary-light text-white py-3 rounded-xl font-semibold transition"
        >
          Create Another Stream
        </button>
      </div>
    );
  }

  return (
    <div className="glass p-8 rounded-2xl max-w-md w-full mx-auto border border-white/5 relative">
      {/* Wizard Steps indicator */}
      <div className="flex justify-between items-center mb-8">
        <span className="text-xs font-semibold text-primary">STEP {step} OF 3</span>
        <div className="flex gap-1.5">
          <div className={`h-1.5 w-8 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-dark-700'}`} />
          <div className={`h-1.5 w-8 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-dark-700'}`} />
          <div className={`h-1.5 w-8 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-dark-700'}`} />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles size={18} className="text-teal-400" />
              Configure Recipient & Asset
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-dark-600">Recipient Address (Stellar G...)</label>
              <input
                {...register('recipient')}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition font-mono"
                placeholder="GD..."
              />
              {errors.recipient && <span className="text-xs text-accent-rose">{errors.recipient.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-dark-600">Asset Selection</label>
              <select
                {...register('assetType')}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition"
              >
                <option value="XLM">XLM (Stellar Native)</option>
                <option value="USDC">USDC (Anchor Asset)</option>
                <option value="CUSTOM">Custom Soroban Asset</option>
              </select>
            </div>

            {assetType === 'CUSTOM' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-dark-600">Custom Asset Contract ID</label>
                <input
                  {...register('customAssetAddress')}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition font-mono"
                  placeholder="CA..."
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-dark-600">Total Stream Amount</label>
              <input
                type="number"
                step="any"
                {...register('amount')}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition"
              />
              {errors.amount && <span className="text-xs text-accent-rose">{errors.amount.message}</span>}
            </div>

            <button
              type="button"
              onClick={nextStep}
              className="w-full bg-primary hover:bg-primary-light text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-xl font-bold">Schedule & Timing</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-dark-600">Stream Duration (Seconds)</label>
              <input
                type="number"
                {...register('duration')}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition"
              />
              {errors.duration && <span className="text-xs text-accent-rose">{errors.duration.message}</span>}
            </div>

            <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-dark-600">Calculated Rate:</span>
                <span className="font-semibold text-teal-400">
                  {((amount || 0) / ((duration || 3600) / 3600)).toFixed(4)} {assetType}/hour
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-dark-600">Total Duration:</span>
                <span className="font-semibold text-white">
                  {((duration || 3600) / 86400).toFixed(2)} days
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={prevStep}
                className="w-1/2 glass glass-hover py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="w-1/2 bg-primary hover:bg-primary-light text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                Review
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h3 className="text-xl font-bold">Review Stream Proposal</h3>

            <div className="space-y-3 bg-dark-900/70 p-5 rounded-2xl border border-white/5">
              <div className="flex justify-between text-sm">
                <span className="text-dark-600">Recipient:</span>
                <span className="font-mono text-teal-300">{recipient.slice(0,6)}...{recipient.slice(-4)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-600">Total Flow:</span>
                <span className="font-semibold text-white">{amount} {assetType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-600">Duration:</span>
                <span className="font-semibold text-white">{duration} seconds</span>
              </div>
              {assetType === 'CUSTOM' && (
                <div className="flex justify-between text-sm">
                  <span className="text-dark-600">Asset Address:</span>
                  <span className="font-mono text-dark-600">{customAssetAddress?.slice(0,6)}...</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={prevStep}
                disabled={loading}
                className="w-1/3 glass glass-hover py-3 rounded-xl font-semibold transition flex items-center justify-center"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-purple text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Sign & Stream"
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
