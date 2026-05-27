"use client";

// TODO(issue): #M1 — Implement 3-step creation wizard
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

// ─── Zod schemas for each wizard step ────────────────────────────────────────

export const Step1Schema = z.object({
  recipient: z.string().min(56, 'Must be a valid Stellar address (G...)').max(56),
  asset:     z.string().min(1, 'Asset contract address is required'),
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

  const form1 = useForm<Step1>({ resolver: zodResolver(Step1Schema) });
  const form2 = useForm<Step2>({ resolver: zodResolver(Step2Schema), defaultValues: { startNow: true } });
  const form3 = useForm<Step3>({ resolver: zodResolver(Step3Schema) });

  const onStep1 = form1.handleSubmit(() => setStep(2));
  const onStep2 = form2.handleSubmit(() => setStep(3));
  const onStep3 = form3.handleSubmit(() => {
    // TODO(issue): #M1 — Submit combined form data to StreamClient.createStream()
    console.log('create stream — not implemented, see issue #M1');
  });

  return (
    <div className="glass p-8 rounded-2xl border border-white/5 max-w-lg w-full">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {([1, 2, 3] as const).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${step === s ? 'border-primary bg-primary/20 text-primary' : step > s ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300' : 'border-white/10 bg-white/5 text-dark-600'}`}>
              {s}
            </div>
            {s < 3 && <div className={`flex-1 h-px w-8 ${step > s ? 'bg-emerald-500' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Recipient, Asset, Amount */}
      {step === 1 && (
        <form onSubmit={onStep1} className="space-y-4">
          <h3 className="text-lg font-bold text-white">Recipient & Asset</h3>
          <div>
            <label className="text-xs text-dark-600 font-semibold uppercase">Recipient Address</label>
            <input id="stream-recipient" {...form1.register('recipient')} placeholder="GABC..." className="w-full mt-1 bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-primary" />
            {form1.formState.errors.recipient && <p className="text-xs text-rose-400 mt-1">{form1.formState.errors.recipient.message}</p>}
          </div>
          <div>
            <label className="text-xs text-dark-600 font-semibold uppercase">Asset Contract</label>
            <input id="stream-asset" {...form1.register('asset')} placeholder="CXXX..." className="w-full mt-1 bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs text-dark-600 font-semibold uppercase">Amount</label>
            <input id="stream-amount" type="number" step="any" {...form1.register('amount', { valueAsNumber: true })} placeholder="100" className="w-full mt-1 bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-primary to-accent text-white py-2.5 rounded-xl text-sm font-semibold mt-2">Next →</button>
        </form>
      )}

      {/* Step 2: Duration */}
      {step === 2 && (
        <form onSubmit={onStep2} className="space-y-4">
          <h3 className="text-lg font-bold text-white">Duration</h3>
          <div>
            <label className="text-xs text-dark-600 font-semibold uppercase">Duration (days)</label>
            <input id="stream-duration" type="number" {...form2.register('durationDays', { valueAsNumber: true })} placeholder="30" className="w-full mt-1 bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input id="stream-start-now" type="checkbox" {...form2.register('startNow')} className="accent-primary" />
            <span className="text-sm text-white">Start immediately</span>
          </label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="flex-1 bg-dark-700 text-white py-2.5 rounded-xl text-sm font-semibold">← Back</button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-2.5 rounded-xl text-sm font-semibold">Next →</button>
          </div>
        </form>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <form onSubmit={onStep3} className="space-y-4">
          <h3 className="text-lg font-bold text-white">Confirm Stream</h3>
          <p className="text-sm text-dark-600">Review the details above before signing the transaction with your Freighter wallet.</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input id="stream-confirm" type="checkbox" {...form3.register('confirmation')} className="accent-primary" />
            <span className="text-sm text-white">I confirm the stream details are correct</span>
          </label>
          {form3.formState.errors.confirmation && <p className="text-xs text-rose-400">{form3.formState.errors.confirmation.message}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="flex-1 bg-dark-700 text-white py-2.5 rounded-xl text-sm font-semibold">← Back</button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-2.5 rounded-xl text-sm font-semibold">Sign & Create</button>
          </div>
        </form>
      )}
    </div>
  );
}
