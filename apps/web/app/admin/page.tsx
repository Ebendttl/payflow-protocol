'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Play,
  Pause,
  Settings,
  DollarSign,
  Database,
  Activity,
  ArrowLeft,
  RefreshCw,
  Key,
  Users,
  CheckCircle,
  AlertTriangle,
  Check,
  Clipboard,
  Trash,
  Plus,
} from 'lucide-react';
import { useWalletStore } from '../../lib/store/walletStore';
import { toast } from 'react-hot-toast';

// ─── Types & Defaults ────────────────────────────────────────────────────────

interface AuditLog {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  status: 'success' | 'pending';
  hash: string;
}

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: '1',
    action: 'Platform Fee Updated (0.15% → 0.10%)',
    actor: 'GB5S...4N2A',
    timestamp: '2026-07-10 14:32:00',
    status: 'success',
    hash: '8f3e2d1c...9a0b',
  },
  {
    id: '2',
    action: 'StreamVault Contract Implementation Upgraded',
    actor: 'GB5S...4N2A',
    timestamp: '2026-07-08 09:15:22',
    status: 'success',
    hash: 'a1b2c3d4...e5f6',
  },
  {
    id: '3',
    action: 'Emergency Pause Triggered (Testnet Maintenance)',
    actor: 'GAA8...7X2Q',
    timestamp: '2026-06-30 22:11:45',
    status: 'success',
    hash: 'f6e5d4c3...b2a1',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { publicKey, isConnected } = useWalletStore();
  const [isAdmin, setIsAdmin] = useState(true); // Demo mode bypass for layout viewing
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);

  // Contract Registries
  const [registries, setRegistries] = useState({
    streamVault: 'CBJZFC3SYJ3RYXP7OUGDN274YDXJW6K5UG326BBONYFAA2ZJGIP57A33',
    milestoneEscrow: 'CCW6KG642HZD75SU7E5YEOK3R72JAEG7H2Q4FB3NPF3JHU4W4K357A44',
    streamFactory: 'CDLZFC3SYJ3RYXP7OUGDN274YDXJW6K5UG326BBONYFAA2ZJGIP57A55',
  });

  const [registryInputs, setRegistryInputs] = useState({ ...registries });

  // Platform Fees
  const [feePercent, setFeePercent] = useState(0.1);
  const [feeRecipient, setFeeRecipient] = useState(
    'GB5S2KJS2KXZT4V6X73D7W6UQLW5Z5XQ7PBYQ2Q7O6D3D5U4A6M5Z5Z5Z'
  );

  // Multi-sig settings
  const [threshold, setThreshold] = useState(2);
  const [signers, setSigners] = useState<string[]>([
    'GB5S2KJS2KXZT4V6X73D7W6UQLW5Z5XQ7PBYQ2Q7O6D3D5U4A6M5Z5Z5Z',
    'GAA8C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5A6B7',
    'GBB1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5A6C8',
  ]);
  const [newSigner, setNewSigner] = useState('');

  // Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(DEFAULT_AUDIT_LOGS);

  // Address validation helpers
  const isValidContract = (addr: string) => /^C[A-D2-7][A-Z2-7]{54}$/.test(addr);
  const isValidStellar = (addr: string) => /^G[A-D2-7][A-Z2-7]{54}$/.test(addr);

  const handleTogglePause = () => {
    setLoading(true);
    const targetState = !isPaused;
    const toastId = toast.loading(
      targetState ? 'Pausing all contract operations...' : 'Resuming all contract operations...'
    );

    setTimeout(() => {
      setIsPaused(targetState);
      setLoading(false);
      toast.success(
        targetState
          ? 'System paused successfully (Circuit Breaker active).'
          : 'System resumed successfully.',
        { id: toastId }
      );

      // Add to audit logs
      const log: AuditLog = {
        id: Date.now().toString(),
        action: targetState
          ? 'Emergency Pause Activated'
          : 'Emergency Pause Deactivated (System Resume)',
        actor: publicKey
          ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
          : 'Admin (FREIGHTER)',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'success',
        hash:
          Math.random().toString(16).substring(2, 10) +
          '...' +
          Math.random().toString(16).substring(2, 6),
      };
      setAuditLogs((prev) => [log, ...prev]);
    }, 1500);
  };

  const handleUpdateRegistry = (key: keyof typeof registries) => {
    const val = registryInputs[key];
    if (!isValidContract(val)) {
      toast.error(
        `Invalid ${key} contract address. Must be a valid C... address of 56 characters.`
      );
      return;
    }

    setLoading(true);
    const toastId = toast.loading(`Upgrading ${key} implementation...`);

    setTimeout(() => {
      setRegistries((prev) => ({ ...prev, [key]: val }));
      setLoading(false);
      toast.success(`${key} upgrade confirmed on-chain!`, { id: toastId });

      const log: AuditLog = {
        id: Date.now().toString(),
        action: `${key} Upgraded to ${val.slice(0, 8)}...`,
        actor: publicKey
          ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
          : 'Admin (FREIGHTER)',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'success',
        hash:
          Math.random().toString(16).substring(2, 10) +
          '...' +
          Math.random().toString(16).substring(2, 6),
      };
      setAuditLogs((prev) => [log, ...prev]);
    }, 1500);
  };

  const handleUpdateFees = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidStellar(feeRecipient)) {
      toast.error('Invalid Fee Recipient Stellar address (must start with G... and be 56 chars).');
      return;
    }
    if (feePercent < 0 || feePercent > 2) {
      toast.error('Fees must be between 0% and 2%.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Updating platform fee structure...');

    setTimeout(() => {
      setLoading(false);
      toast.success('Platform fees updated!', { id: toastId });

      const log: AuditLog = {
        id: Date.now().toString(),
        action: `Fees Updated: ${feePercent}% to recipient ${feeRecipient.slice(0, 6)}...`,
        actor: publicKey
          ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
          : 'Admin (FREIGHTER)',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'success',
        hash:
          Math.random().toString(16).substring(2, 10) +
          '...' +
          Math.random().toString(16).substring(2, 6),
      };
      setAuditLogs((prev) => [log, ...prev]);
    }, 1200);
  };

  const handleAddSigner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidStellar(newSigner)) {
      toast.error('Invalid Stellar address.');
      return;
    }
    if (signers.includes(newSigner)) {
      toast.error('Signer is already registered.');
      return;
    }

    setSigners((prev) => [...prev, newSigner]);
    setNewSigner('');
    toast.success('Signer added to proposing list.');
  };

  const handleRemoveSigner = (addr: string) => {
    if (signers.length <= 1) {
      toast.error('Must have at least 1 governing signer.');
      return;
    }
    setSigners((prev) => prev.filter((s) => s !== addr));
    if (threshold > signers.length - 1) {
      setThreshold(signers.length - 1 || 1);
    }
    toast.success('Signer removed.');
  };

  return (
    <div className="min-h-[calc(100vh-160px)] bg-dark-900 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 h-96 w-96 bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <main className="max-w-6xl w-full mx-auto px-6 py-12 relative z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <Shield className="text-rose-500" size={28} />
              Admin Controls
            </h1>
            <p className="text-sm text-dark-500">
              Manage core system contract addresses, emergency pauses, platform fees, and governance
              rules.
            </p>
          </div>

          <button
            onClick={handleTogglePause}
            disabled={loading}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] border ${
              isPaused
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
            }`}
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
            {isPaused ? 'Emergency Resume (Unpause)' : 'Emergency Circuit Breaker (Pause)'}
          </button>
        </div>

        {/* Global Warning if Paused */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-rose-950/80 border border-rose-500/30 rounded-2xl p-5 flex gap-4 text-rose-300"
            >
              <AlertTriangle className="text-rose-400 shrink-0 mt-1" size={24} />
              <div className="space-y-1">
                <h4 className="text-md font-bold text-white">Emergency Stop Activated</h4>
                <p className="text-xs text-rose-300/80 leading-relaxed">
                  All stream withdrawals, milestones approvals, and deployment actions have been
                  frozen at the factory contract level. Users cannot initiate new transactions until
                  the contract is resumed.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Layout Grid */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Col 1 & 2: Main Panels */}
          <div className="lg:col-span-2 space-y-8">
            {/* Factory Registries Upgrade */}
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Database className="text-teal-400" size={18} />
                <h3 className="text-lg font-bold text-white">Implementation Registry</h3>
              </div>

              <div className="space-y-5">
                {(['streamVault', 'milestoneEscrow', 'streamFactory'] as const).map((key) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-dark-400 uppercase tracking-wider">
                        {key === 'streamVault' && 'StreamVault Contract ID'}
                        {key === 'milestoneEscrow' && 'MilestoneEscrow Contract ID'}
                        {key === 'streamFactory' && 'StreamFactory Contract ID'}
                      </span>
                      <span className="text-[10px] text-teal-400 font-mono">
                        Active: {registries[key].slice(0, 6)}...{registries[key].slice(-6)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={registryInputs[key]}
                        onChange={(e) =>
                          setRegistryInputs((r) => ({ ...r, [key]: e.target.value }))
                        }
                        className="flex-grow bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-dark-600 focus:outline-none focus:border-teal-500 transition"
                      />
                      <button
                        onClick={() => handleUpdateRegistry(key)}
                        disabled={loading || registries[key] === registryInputs[key]}
                        className="bg-dark-700 hover:bg-dark-600 border border-white/10 text-white px-4 rounded-xl text-xs font-bold transition disabled:opacity-40 disabled:hover:bg-dark-700 flex items-center gap-1.5"
                      >
                        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                        Upgrade
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Fees */}
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <DollarSign className="text-purple-400" size={18} />
                <h3 className="text-lg font-bold text-white">Fee Management Structure</h3>
              </div>

              <form onSubmit={handleUpdateFees} className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs text-dark-400 font-bold uppercase tracking-wider">
                      Fee Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="2"
                        value={feePercent}
                        onChange={(e) => setFeePercent(parseFloat(e.target.value) || 0)}
                        className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-dark-600 focus:outline-none focus:border-purple-500 transition"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-dark-500">
                        %
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs text-dark-400 font-bold uppercase tracking-wider">
                      Fee Collector Address
                    </label>
                    <input
                      type="text"
                      value={feeRecipient}
                      onChange={(e) => setFeeRecipient(e.target.value)}
                      className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-dark-600 focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  Save Fee Scheme
                </button>
              </form>
            </div>

            {/* Audit Log Ledger */}
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="text-rose-400" size={18} />
                  <h3 className="text-lg font-bold text-white">System Audit Log</h3>
                </div>
                <button
                  onClick={() => setAuditLogs(DEFAULT_AUDIT_LOGS)}
                  className="text-xxs text-dark-500 hover:text-white transition font-bold"
                >
                  Reset Ledger
                </button>
              </div>

              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-dark-900/60 p-3.5 rounded-xl border border-white/5 flex justify-between items-center gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-white">{log.action}</p>
                      <div className="flex items-center gap-2 text-[10px] text-dark-500">
                        <span>Actor: {log.actor}</span>
                        <span>•</span>
                        <span>{log.timestamp}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/10">
                        <Check size={10} /> Confirmed
                      </span>
                      <p className="font-mono text-[9px] text-dark-600 mt-1">{log.hash}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Col 3: Side Panel (Governing signers) */}
          <div className="space-y-8">
            {/* System Health Summary */}
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="text-rose-400" size={18} />
                <h3 className="text-md font-bold text-white">Registry Metrics</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-dark-500">System State</span>
                  <span
                    className={`font-bold flex items-center gap-1.5 ${isPaused ? 'text-rose-400' : 'text-emerald-400'}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${isPaused ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}
                    />
                    {isPaused ? 'Paused' : 'Healthy (Operational)'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-dark-500">Deployed Streams</span>
                  <span className="font-bold text-white font-mono">148 streams</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-dark-500">Total TVL Locked</span>
                  <span className="font-bold text-white font-mono">2,481,250 USDC</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-dark-500">Collected Platform Fees</span>
                  <span className="font-bold text-teal-300 font-mono">3,721 USDC</span>
                </div>
              </div>
            </div>

            {/* Multi-sig governance configuration */}
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-5">
              <div className="flex items-center gap-2">
                <Users className="text-indigo-400" size={18} />
                <h3 className="text-md font-bold text-white">Governance Authority</h3>
              </div>

              <div className="space-y-3.5">
                {/* Threshold slider/input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-dark-400 font-bold uppercase tracking-wider">
                      Required Approvals
                    </span>
                    <span className="font-bold text-white font-mono">
                      {threshold}-of-{signers.length}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={signers.length}
                    value={threshold}
                    onChange={(e) => setThreshold(parseInt(e.target.value) || 1)}
                    className="w-full h-1 bg-dark-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* Signers Stack */}
                <div className="space-y-2">
                  <span className="text-[10px] text-dark-500 font-bold uppercase tracking-wider block">
                    Admin Signers
                  </span>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {signers.map((s, idx) => (
                      <div
                        key={idx}
                        className="bg-dark-900/60 p-2.5 rounded-xl border border-white/5 flex items-center justify-between gap-3"
                      >
                        <span className="font-mono text-[10px] text-teal-400 truncate flex-grow">
                          {s.slice(0, 12)}...{s.slice(-8)}
                        </span>
                        <button
                          onClick={() => handleRemoveSigner(s)}
                          disabled={signers.length <= 1}
                          className="text-dark-600 hover:text-rose-400 transition"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add signer */}
                <form onSubmit={handleAddSigner} className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-[10px] text-dark-500 font-bold uppercase tracking-wider block">
                    Propose New Signer
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSigner}
                      onChange={(e) => setNewSigner(e.target.value)}
                      placeholder="G..."
                      className="flex-grow bg-dark-900 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white font-mono placeholder-dark-600 focus:outline-none focus:border-indigo-500 transition"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 p-2 rounded-xl text-white transition flex items-center justify-center"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-dark-600 hover:text-white transition font-bold"
          >
            <ArrowLeft size={14} /> Back Home
          </Link>
        </div>
      </main>
    </div>
  );
}
