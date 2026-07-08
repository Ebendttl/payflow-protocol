"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, Trash2, Users, CheckCircle2, UserCheck, ArrowRight, Coins, Sparkles, RefreshCw } from 'lucide-react';

interface MockMilestone {
  id: string;
  title: string;
  amount: number;
  approvedBy: string[]; // List of signers who approved (e.g., 'Alice', 'Bob', 'Charlie')
  status: 'Pending' | 'Approved' | 'Released';
}

const SIGNERS = ['Alice', 'Bob', 'Charlie'] as const;
type SignerName = typeof SIGNERS[number];

export default function EscrowSandbox() {
  // Escrow Configuration State
  const [threshold, setThreshold] = useState<number>(2);
  const [milestones, setMilestones] = useState<MockMilestone[]>([
    { id: '1', title: 'Milestone 1: Smart Contract Auditing', amount: 150, approvedBy: ['Alice'], status: 'Pending' },
    { id: '2', title: 'Milestone 2: Frontend Integration', amount: 250, approvedBy: [], status: 'Pending' },
    { id: '3', title: 'Milestone 3: Mainnet Verification & Launch', amount: 100, approvedBy: [], status: 'Pending' }
  ]);
  
  // Simulation Active Role State
  const [activeRole, setActiveRole] = useState<SignerName>('Alice');
  
  // Visual Balances State
  const [vaultBalance, setVaultBalance] = useState<number>(500);
  const [recipientBalance, setRecipientBalance] = useState<number>(0);
  
  // Milestone creation form state
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState<number>(100);

  // Notifications
  const [activityLogs, setActivityLogs] = useState<string[]>([
    'Escrow Contract Initialized with threshold: 2 of 3 approvers',
    'Alice approved Milestone #1'
  ]);

  // Recalculate balances whenever milestones status changes
  useEffect(() => {
    const total = milestones.reduce((sum, m) => sum + m.amount, 0);
    const released = milestones
      .filter((m) => m.status === 'Released')
      .reduce((sum, m) => sum + m.amount, 0);
    
    setVaultBalance(total - released);
    setRecipientBalance(released);
  }, [milestones]);

  // Add a custom milestone
  const addMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newMilestone: MockMilestone = {
      id: Date.now().toString(),
      title: newTitle,
      amount: newAmount,
      approvedBy: [],
      status: 'Pending'
    };

    setMilestones(prev => [...prev, newMilestone]);
    logActivity(`Added Milestone: "${newTitle}" (${newAmount} USDC)`);
    setNewTitle('');
  };

  // Remove a milestone (only if pending)
  const removeMilestone = (id: string, title: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
    logActivity(`Removed Milestone: "${title}"`);
  };

  // Switch signer role helper
  const handleRoleChange = (role: SignerName) => {
    setActiveRole(role);
    logActivity(`Switched role to acting as: ${role}`);
  };

  // Approve a milestone
  const approveMilestone = (milestoneId: string) => {
    setMilestones(prev =>
      prev.map((milestone) => {
        if (milestone.id !== milestoneId || milestone.status === 'Released') return milestone;

        // If already approved by activeRole, toggle/remove it, else add it
        const alreadyApproved = milestone.approvedBy.includes(activeRole);
        let updatedApprovers: string[];
        
        if (alreadyApproved) {
          updatedApprovers = milestone.approvedBy.filter(u => u !== activeRole);
          logActivity(`${activeRole} revoked approval for: "${milestone.title}"`);
        } else {
          updatedApprovers = [...milestone.approvedBy, activeRole];
          logActivity(`${activeRole} approved: "${milestone.title}"`);
        }

        // Check if approval threshold met
        const isApproved = updatedApprovers.length >= threshold;
        const status = isApproved ? 'Approved' : 'Pending';

        return {
          ...milestone,
          approvedBy: updatedApprovers,
          status
        };
      })
    );
  };

  // Disburse/Release milestone funds
  const releaseMilestone = (milestoneId: string) => {
    setMilestones(prev =>
      prev.map((milestone) => {
        if (milestone.id !== milestoneId) return milestone;
        
        logActivity(`Funds Released for: "${milestone.title}" (+${milestone.amount} USDC to recipient)`);
        return {
          ...milestone,
          status: 'Released'
        };
      })
    );
  };

  // Helper log function
  const logActivity = (message: string) => {
    setActivityLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 10)]);
  };

  // Reset demo
  const resetDemo = () => {
    setThreshold(2);
    setMilestones([
      { id: '1', title: 'Milestone 1: Smart Contract Auditing', amount: 150, approvedBy: ['Alice'], status: 'Pending' },
      { id: '2', title: 'Milestone 2: Frontend Integration', amount: 250, approvedBy: [], status: 'Pending' },
      { id: '3', title: 'Milestone 3: Mainnet Verification & Launch', amount: 100, approvedBy: [], status: 'Pending' }
    ]);
    setActiveRole('Alice');
    logActivity('Reset simulator state to default');
  };

  const totalEscrowAmount = milestones.reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="w-full bg-dark-800/30 border border-white/5 rounded-3xl p-6 md:p-8 space-y-8 relative overflow-hidden backdrop-blur-sm">
      <div className="absolute top-[0%] right-[0%] h-[200px] w-[200px] bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="text-accent" size={20} />
            Milestone Escrow Sandbox & Approval Simulator
          </h3>
          <p className="text-xs text-dark-500">
            Design multi-sig contract rules, simulate signing thresholds, and watch on-chain fund disbursements.
          </p>
        </div>
        <button
          onClick={resetDemo}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-dark-700 hover:bg-dark-600 border border-white/10 text-xs font-bold text-white transition active:scale-[0.98]"
        >
          <RefreshCw size={12} />
          Reset Demo
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Escrow Config & Simulated Ledger */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Simulated Signer Selection */}
          <div className="space-y-3 p-5 rounded-2xl bg-dark-900/40 border border-white/5">
            <span className="text-xs font-bold text-dark-500 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck size={14} className="text-accent" />
              1. Select Acting Signer Role
            </span>
            <p className="text-[11px] text-dark-500 leading-relaxed">
              Multi-signature escrows require separate accounts to sign. Switch roles below to simulate signing as different approvers.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-2">
              {SIGNERS.map((signer) => {
                const active = activeRole === signer;
                return (
                  <button
                    key={signer}
                    onClick={() => handleRoleChange(signer)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      active
                        ? 'border-accent bg-accent/10 text-accent-purple shadow-md shadow-accent/10'
                        : 'border-white/5 bg-transparent text-dark-500 hover:text-white'
                    }`}
                  >
                    {signer}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Threshold setting */}
          <div className="space-y-3 p-5 rounded-2xl bg-dark-900/40 border border-white/5">
            <span className="text-xs font-bold text-dark-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-accent" />
              2. Contract Threshold
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xs text-dark-500">Signers required for release:</span>
              <div className="flex gap-1 bg-dark-800 p-1 rounded-lg border border-white/5">
                {[1, 2, 3].map((num) => {
                  const active = threshold === num;
                  return (
                    <button
                      key={num}
                      onClick={() => {
                        setThreshold(num);
                        logActivity(`Updated approval threshold to: ${num} of 3 signers`);
                      }}
                      className={`h-7 w-7 rounded font-bold text-xs transition ${
                        active ? 'bg-accent text-white' : 'text-dark-500 hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Simulated Contract Balances Ledger */}
          <div className="p-5 rounded-2xl bg-dark-900/60 border border-white/5 space-y-4 shadow-inner relative">
            <span className="text-xs font-bold text-dark-500 uppercase tracking-wider block">
              Simulated Contract Ledger State
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-800/40 p-4 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] text-dark-500 font-bold block uppercase">Vault Balance</span>
                <span className="text-xl font-black text-white font-mono block mt-1">
                  {vaultBalance} <span className="text-xs text-dark-600">USDC</span>
                </span>
                <div className="w-full bg-dark-700 h-1.5 rounded-full overflow-hidden mt-3">
                  <motion.div
                    className="h-full bg-primary"
                    animate={{ width: `${(vaultBalance / (totalEscrowAmount || 1)) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              <div className="bg-dark-800/40 p-4 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] text-dark-500 font-bold block uppercase">Released Balance</span>
                <span className="text-xl font-black text-emerald-400 font-mono block mt-1">
                  {recipientBalance} <span className="text-xs text-dark-600">USDC</span>
                </span>
                <div className="w-full bg-dark-700 h-1.5 rounded-full overflow-hidden mt-3">
                  <motion.div
                    className="h-full bg-emerald-400"
                    animate={{ width: `${(recipientBalance / (totalEscrowAmount || 1)) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-dark-500 font-mono">
              <span>Status: Active Escrow</span>
              <span>Total Contract Pool: {totalEscrowAmount} USDC</span>
            </div>
          </div>

          {/* Activity Logs Panel */}
          <div className="p-4 rounded-2xl bg-dark-900/30 border border-white/5 space-y-2">
            <span className="text-[10px] font-bold text-dark-500 uppercase tracking-wider block">Simulator Event Log</span>
            <div className="h-28 overflow-y-auto font-mono text-[10px] text-dark-500 space-y-1.5 scrollbar-thin scrollbar-thumb-dark-700 pr-1">
              <AnimatePresence initial={false}>
                {activityLogs.map((log, index) => (
                  <motion.div
                    key={log + index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="leading-relaxed border-l-2 border-accent/20 pl-2 text-dark-400"
                  >
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* Right Side: Milestone Timeline & Builder */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold text-dark-500 uppercase tracking-wider block">
              3. Interactive Milestones Timeline
            </span>

            {/* Vertical timeline of milestones */}
            <div className="space-y-4 relative pl-4 border-l-2 border-dark-700">
              <AnimatePresence initial={false}>
                {milestones.map((m, index) => {
                  const hasSigned = m.approvedBy.includes(activeRole);
                  const statusColors = 
                    m.status === 'Released' 
                      ? 'border-emerald-500/30 bg-emerald-500/5' 
                      : m.status === 'Approved'
                        ? 'border-accent/40 bg-accent/5 animate-pulse'
                        : 'border-white/5 bg-dark-900/20';

                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25 }}
                      className={`relative p-5 rounded-2xl border transition duration-300 ${statusColors}`}
                    >
                      {/* Left timeline indicator circle */}
                      <span 
                        style={{
                          backgroundColor: m.status === 'Released' ? '#10B981' : m.status === 'Approved' ? '#8B5CF6' : '#374151'
                        }}
                        className="absolute left-[-23px] top-7 w-3.5 h-3.5 rounded-full border border-dark-900 z-10 shadow-lg shadow-black/80" 
                      />

                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                        <div className="space-y-1 flex-grow">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold text-accent-purple uppercase tracking-wider">
                              Milestone #{index + 1}
                            </span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              m.status === 'Released' 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20'
                                : m.status === 'Approved'
                                  ? 'bg-accent/20 text-accent-purple border border-accent/20'
                                  : 'bg-dark-700 text-dark-500 border border-white/5'
                            }`}>
                              {m.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{m.title}</h4>
                        </div>
                        
                        <div className="text-right sm:self-center flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                          <span className="text-md font-black text-white font-mono">{m.amount}</span>
                          <span className="text-[10px] font-bold text-dark-600 uppercase">USDC</span>
                        </div>
                      </div>

                      {/* Approval Tracker */}
                      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap justify-between items-center gap-3">
                        {/* List of approved avatars */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-dark-500 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Users size={12} />
                            Approvals ({m.approvedBy.length}/{threshold} required):
                          </span>
                          <div className="flex gap-1">
                            {SIGNERS.map((s) => {
                              const signed = m.approvedBy.includes(s);
                              return (
                                <span
                                  key={s}
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${
                                    signed
                                      ? 'bg-accent/15 border-accent-purple/30 text-accent-purple'
                                      : 'bg-dark-900 border-white/5 text-dark-600'
                                  }`}
                                  title={signed ? `${s} has approved` : `${s} has not approved`}
                                >
                                  {s[0]}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Interactive Action Buttons */}
                        <div className="flex gap-2">
                          {m.status === 'Released' ? (
                            <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs py-1.5 px-3">
                              <CheckCircle2 size={14} /> Released
                            </div>
                          ) : m.status === 'Approved' ? (
                            <button
                              onClick={() => releaseMilestone(m.id)}
                              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition active:scale-[0.98] flex items-center gap-1"
                            >
                              Disburse Funds
                              <ArrowRight size={12} />
                            </button>
                          ) : (
                            <button
                              onClick={() => approveMilestone(m.id)}
                              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs border transition active:scale-[0.98] ${
                                hasSigned
                                  ? 'border-accent bg-accent/15 text-accent-purple hover:bg-accent/20'
                                  : 'border-white/5 bg-dark-700 hover:bg-dark-600 text-white'
                              }`}
                            >
                              {hasSigned ? 'Revoke Approval' : `Approve as ${activeRole}`}
                            </button>
                          )}

                          {m.status === 'Pending' && m.approvedBy.length === 0 && (
                            <button
                              onClick={() => removeMilestone(m.id, m.title)}
                              className="p-1.5 bg-transparent border border-white/5 text-dark-600 hover:text-accent-rose hover:border-accent-rose/20 rounded-xl transition"
                              title="Delete Milestone"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>

                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Custom Milestone Creator Form */}
            <form onSubmit={addMilestone} className="glass p-5 rounded-2xl border border-white/5 space-y-4">
              <span className="text-[10px] font-bold text-dark-500 uppercase tracking-wider block">Add Custom Milestone</span>
              <div className="grid sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <input
                    type="text"
                    required
                    placeholder="Milestone title (e.g. Design review, Audit report)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-dark-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-dark-600 focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="sm:col-span-3">
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="10"
                      max="10000"
                      value={newAmount}
                      onChange={(e) => setNewAmount(Number(e.target.value))}
                      className="w-full bg-dark-900 border border-white/5 rounded-xl pl-3 pr-8 py-2 text-xs text-white font-mono focus:outline-none focus:border-accent"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-dark-500">USDC</span>
                  </div>
                </div>
                <div className="sm:col-span-1 flex items-stretch">
                  <button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent-purple text-white rounded-xl flex items-center justify-center p-2 transition active:scale-[0.98]"
                    title="Add Milestone"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
