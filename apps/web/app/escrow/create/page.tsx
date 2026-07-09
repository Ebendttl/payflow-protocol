'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '../../../lib/store/walletStore';
import { createPayFlowClient, getActiveWalletAdapter } from '../../../lib/stellar';
import { ArrowLeft, Plus, Trash2, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../../components/ui/Button';

interface MilestoneForm {
  title: string;
  description: string;
  amount: string;
}

export default function CreateEscrowPage() {
  const router = useRouter();
  const { publicKey, isConnected, walletType } = useWalletStore();
  const [loading, setLoading] = useState(false);

  // Form states
  const [recipient, setRecipient] = useState('');
  const [token, setToken] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [threshold, setThreshold] = useState('2');
  const [approvers, setApprovers] = useState<string[]>(['', '']);
  const [milestones, setMilestones] = useState<MilestoneForm[]>([
    { title: 'Milestone 1', description: 'Initial deliverable', amount: '' },
  ]);

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate milestone sum
  const milestonesSum = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
  const totalNum = parseFloat(totalAmount) || 0;
  const isAllocationMatch = Math.abs(milestonesSum - totalNum) < 0.00001 && totalNum > 0;

  // Add/remove approvers
  const addApprover = () => setApprovers([...approvers, '']);
  const removeApprover = (idx: number) => {
    if (approvers.length <= 1) return;
    setApprovers(approvers.filter((_, i) => i !== idx));
  };
  const updateApprover = (idx: number, val: string) => {
    const next = [...approvers];
    next[idx] = val;
    setApprovers(next);
  };

  // Add/remove milestones
  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { title: `Milestone ${milestones.length + 1}`, description: '', amount: '' },
    ]);
  };
  const removeMilestone = (idx: number) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, i) => i !== idx));
  };
  const updateMilestone = (idx: number, field: keyof MilestoneForm, val: string) => {
    const next = [...milestones];
    next[idx] = { ...next[idx], [field]: val };
    setMilestones(next);
  };

  // Address validation helper
  const isValidStellarAddress = (addr: string) => /^G[A-D2-7][A-Z2-7]{54}$/.test(addr);
  const isValidContractAddress = (addr: string) => /^C[A-D2-7][A-Z2-7]{54}$/.test(addr);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !publicKey) {
      toast.error('Please connect your wallet first.');
      return;
    }

    // Client-side validations
    const nextErrors: Record<string, string> = {};

    if (!isValidStellarAddress(recipient)) {
      nextErrors.recipient = 'Must be a valid G... Stellar address (56 chars)';
    }
    if (!isValidContractAddress(token)) {
      nextErrors.token = 'Must be a valid C... contract ID (56 chars)';
    }
    if (totalNum <= 0) {
      nextErrors.totalAmount = 'Amount must be greater than 0';
    }

    const thresh = parseInt(threshold) || 0;
    if (thresh < 1 || thresh > approvers.length) {
      nextErrors.threshold = `Threshold must be between 1 and the number of approvers (${approvers.length})`;
    }

    approvers.forEach((appr, idx) => {
      if (!isValidStellarAddress(appr)) {
        nextErrors[`approver_${idx}`] = 'Invalid G... address';
      }
    });

    milestones.forEach((m, idx) => {
      if (!m.title.trim()) nextErrors[`m_title_${idx}`] = 'Title required';
      if ((parseFloat(m.amount) || 0) <= 0) nextErrors[`m_amount_${idx}`] = 'Amount must be > 0';
    });

    if (!isAllocationMatch) {
      nextErrors.allocation = `Sum of milestones (${milestonesSum}) must exactly equal Total Locked Amount (${totalNum})`;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error('Please resolve form errors before submitting.');
      return;
    }

    setErrors({});
    setLoading(true);
    const toastId = toast.loading('Deploying milestone escrow contract...');

    try {
      const wallet = await getActiveWalletAdapter(walletType);
      const client = createPayFlowClient(wallet);

      // Map to contract params format
      const formattedMilestones = milestones.map((m) => ({
        title: m.title,
        amount: BigInt(Math.round((parseFloat(m.amount) || 0) * 10000000)), // Decimal scaling
        approvalCount: 0,
        status: 'Pending' as const,
      }));

      // Call SDK stub
      await client.escrow.createEscrow({
        sender: publicKey,
        recipient,
        token,
        totalAmount: BigInt(Math.round(totalNum * 10000000)),
        threshold: thresh,
        approvers,
        milestones: formattedMilestones as any,
      });

      toast.success('Escrow deployed successfully!', { id: toastId });
      router.push('/escrow');
    } catch (err: any) {
      const msg = err.message || String(err);
      toast.error(`Transaction failed: ${msg}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] bg-dark-900 overflow-hidden flex flex-col justify-between relative">
      <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-6xl w-full mx-auto px-6 py-12 flex-grow space-y-6 z-10">
        <Link
          href="/escrow"
          className="flex items-center gap-1.5 text-xs text-dark-600 hover:text-white transition self-start font-bold"
        >
          <ArrowLeft size={14} />
          Back to Escrows
        </Link>

        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Create Milestone Escrow
            <Sparkles className="text-primary-light" size={20} />
          </h2>
          <p className="text-xs text-dark-500">
            Deploy a multi-sig governed escrow vault locked on-chain
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Escrow Configuration */}
          <div className="lg:col-span-7 space-y-6 bg-dark-800/40 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
            <h3 className="text-md font-bold text-white border-b border-white/5 pb-2.5">
              Escrow Configuration
            </h3>

            {/* Recipient */}
            <div>
              <label className="text-xs text-dark-400 font-bold uppercase tracking-wider">
                Recipient Address (G...)
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="GD..."
                className="w-full mt-1.5 bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-dark-600 focus:outline-none focus:border-primary transition"
              />
              {errors.recipient && (
                <p className="text-xs text-accent-rose mt-1.5">{errors.recipient}</p>
              )}
            </div>

            {/* Token & Total Amount */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-dark-400 font-bold uppercase tracking-wider">
                  Token Contract (C...)
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="CC..."
                  className="w-full mt-1.5 bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-dark-600 focus:outline-none focus:border-primary transition"
                />
                {errors.token && <p className="text-xs text-accent-rose mt-1.5">{errors.token}</p>}
              </div>
              <div>
                <label className="text-xs text-dark-400 font-bold uppercase tracking-wider">
                  Total Locked Amount
                </label>
                <input
                  type="number"
                  step="any"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full mt-1.5 bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-dark-600 focus:outline-none focus:border-primary transition"
                />
                {errors.totalAmount && (
                  <p className="text-xs text-accent-rose mt-1.5">{errors.totalAmount}</p>
                )}
              </div>
            </div>

            {/* Signer Threshold */}
            <div>
              <label className="text-xs text-dark-400 font-bold uppercase tracking-wider">
                Approver Threshold
              </label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="2"
                className="w-full mt-1.5 bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-dark-600 focus:outline-none focus:border-primary transition"
              />
              <p className="text-xxs text-dark-500 mt-1">
                Number of approvals needed to disburse a milestone
              </p>
              {errors.threshold && (
                <p className="text-xs text-accent-rose mt-1.5">{errors.threshold}</p>
              )}
            </div>

            {/* Approvers Stack */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs text-dark-400 font-bold uppercase tracking-wider">
                  Governing Approvers
                </label>
                <button
                  type="button"
                  onClick={addApprover}
                  className="text-xs text-primary-light hover:text-white transition flex items-center gap-1 font-bold"
                >
                  <Plus size={14} /> Add Approver
                </button>
              </div>
              <div className="space-y-3">
                {approvers.map((appr, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={appr}
                      onChange={(e) => updateApprover(idx, e.target.value)}
                      placeholder={`Approver #${idx + 1} Address (G...)`}
                      className="flex-grow bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-dark-600 focus:outline-none focus:border-primary transition"
                    />
                    <button
                      type="button"
                      onClick={() => removeApprover(idx)}
                      disabled={approvers.length <= 1}
                      className="p-2.5 rounded-xl bg-dark-900 hover:bg-rose-500/10 border border-white/10 text-dark-500 hover:text-rose-400 transition disabled:opacity-30 disabled:hover:text-dark-500 disabled:hover:bg-dark-900"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Milestone Planner */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-dark-800/40 p-6 rounded-2xl border border-white/5 backdrop-blur-sm space-y-5">
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <h3 className="text-md font-bold text-white">Milestone Allocation</h3>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="text-xs text-primary-light hover:text-white transition flex items-center gap-1 font-bold"
                >
                  <Plus size={14} /> Add Milestone
                </button>
              </div>

              {/* Milestones Stack */}
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                {milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="bg-dark-900/60 p-4 rounded-xl border border-white/5 space-y-3 relative"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xxs font-bold text-dark-500 uppercase">
                        Milestone #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMilestone(idx)}
                        disabled={milestones.length <= 1}
                        className="text-xxs text-accent-rose hover:text-rose-400 transition disabled:opacity-30"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-2">
                      <input
                        type="text"
                        value={m.title}
                        onChange={(e) => updateMilestone(idx, 'title', e.target.value)}
                        placeholder="Milestone Title"
                        className="bg-dark-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-dark-600 focus:outline-none focus:border-primary transition"
                      />
                      <input
                        type="text"
                        value={m.description}
                        onChange={(e) => updateMilestone(idx, 'description', e.target.value)}
                        placeholder="Description (optional)"
                        className="bg-dark-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-dark-600 focus:outline-none focus:border-primary transition"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="any"
                          value={m.amount}
                          onChange={(e) => updateMilestone(idx, 'amount', e.target.value)}
                          placeholder="Amount"
                          className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-dark-600 focus:outline-none focus:border-primary transition"
                        />
                        <span className="text-xxs text-dark-600 font-bold uppercase shrink-0">
                          USDC
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic matching widget */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between transition duration-200 ${isAllocationMatch ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/5 border-rose-500/20 text-rose-400'}`}
              >
                <div className="flex items-center gap-2">
                  {isAllocationMatch ? (
                    <div className="h-5 w-5 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                      <Check size={12} />
                    </div>
                  ) : (
                    <div className="h-5 w-5 bg-rose-500/20 rounded-full flex items-center justify-center shrink-0">
                      <ShieldAlert size={12} />
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <span className="text-xxs font-bold uppercase tracking-wider block">
                      Allocation Sum
                    </span>
                    <span className="text-xs font-mono">
                      {milestonesSum.toFixed(2)} / {totalNum.toFixed(2)} USDC
                    </span>
                  </div>
                </div>
                <span className="text-xxs font-bold uppercase">
                  {isAllocationMatch ? 'Match' : 'Mismatch'}
                </span>
              </div>
              {errors.allocation && (
                <p className="text-xs text-accent-rose mt-1">{errors.allocation}</p>
              )}
            </div>

            {/* Submission */}
            <Button
              type="submit"
              disabled={loading}
              fullWidth
              className="font-bold py-4 text-sm hover:scale-[1.01]"
            >
              {loading ? 'Deploying Escrow...' : 'Sign & Deploy Escrow'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
