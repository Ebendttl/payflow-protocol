"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Link2, Coins, Clock, User, Copy, Check,
  ArrowRight, ExternalLink, Sparkles, QrCode,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LinkConfig {
  recipient: string;
  amount: number;
  token: string;
  durationDays: number;
  memo: string;
}

const TOKEN_OPTIONS = [
  { symbol: 'USDC', label: 'USDC (Stellar)', color: '#2775CA' },
  { symbol: 'XLM',  label: 'XLM (Lumens)',   color: '#08B5E5' },
];

const DURATION_PRESETS = [7, 14, 30, 60, 90];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateRequestPage() {
  const [config, setConfig] = useState<LinkConfig>({
    recipient: '',
    amount: 500,
    token: 'USDC',
    durationDays: 30,
    memo: '',
  });
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  // Build the shareable URL
  const shareableUrl = useMemo(() => {
    if (!config.recipient) return '';
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams({
      to: config.recipient,
      amount: String(config.amount),
      token: config.token,
      dur: String(config.durationDays),
      ...(config.memo ? { memo: config.memo } : {}),
    });
    return `${base}/request/pay?${params.toString()}`;
  }, [config]);

  const ratePerDay = config.durationDays > 0
    ? (config.amount / config.durationDays).toFixed(2) : '0.00';

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.recipient || config.amount <= 0) return;
    setGenerated(true);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setGenerated(false);
    setCopied(false);
  };

  const selectedToken = TOKEN_OPTIONS.find(t => t.symbol === config.token)!;

  return (
    <div className="min-h-[calc(100vh-160px)] bg-dark-900 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 h-96 w-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <main className="max-w-5xl w-full mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 mb-10"
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Link2 className="text-accent" size={28} />
            PayFlow Link
          </h1>
          <p className="text-sm text-dark-500 max-w-xl">
            Create shareable payment request links. Recipients can fund your stream with one click — no setup required.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left: Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleGenerate} className="glass p-8 rounded-2xl border border-white/5 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-accent" />
                <span className="text-xs font-bold text-dark-500 uppercase tracking-widest">Configure Payment Request</span>
              </div>

              {/* Recipient */}
              <div className="space-y-1.5">
                <label className="text-xs text-dark-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <User size={12} /> Your Stellar Address (Recipient)
                </label>
                <input
                  id="request-recipient"
                  type="text"
                  required
                  minLength={56}
                  maxLength={56}
                  value={config.recipient}
                  onChange={(e) => { setConfig(c => ({ ...c, recipient: e.target.value })); setGenerated(false); }}
                  placeholder="G..."
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-dark-600 focus:outline-none focus:border-accent transition"
                />
              </div>

              {/* Amount + Token */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-dark-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Coins size={12} /> Amount
                  </label>
                  <input
                    id="request-amount"
                    type="number"
                    required
                    min={1}
                    step="any"
                    value={config.amount}
                    onChange={(e) => { setConfig(c => ({ ...c, amount: Number(e.target.value) })); setGenerated(false); }}
                    className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-dark-600 focus:outline-none focus:border-accent transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-dark-400 font-bold uppercase tracking-wider">Token</label>
                  <div className="flex gap-2">
                    {TOKEN_OPTIONS.map(t => (
                      <button
                        key={t.symbol}
                        type="button"
                        onClick={() => { setConfig(c => ({ ...c, token: t.symbol })); setGenerated(false); }}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold border transition ${
                          config.token === t.symbol
                            ? 'border-accent bg-accent/10 text-white'
                            : 'border-white/5 bg-dark-800 text-dark-500 hover:text-white'
                        }`}
                      >
                        {t.symbol}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-xs text-dark-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={12} /> Stream Duration (days)
                </label>
                <div className="flex flex-wrap gap-2">
                  {DURATION_PRESETS.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => { setConfig(c => ({ ...c, durationDays: d })); setGenerated(false); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                        config.durationDays === d
                          ? 'border-primary bg-primary/10 text-primary-light'
                          : 'border-white/5 bg-dark-800 text-dark-500 hover:text-white'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                  <input
                    id="request-custom-duration"
                    type="number"
                    min={1}
                    max={365}
                    value={config.durationDays}
                    onChange={(e) => { setConfig(c => ({ ...c, durationDays: Number(e.target.value) })); setGenerated(false); }}
                    className="w-20 bg-dark-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-primary transition text-center"
                  />
                </div>
              </div>

              {/* Memo */}
              <div className="space-y-1.5">
                <label className="text-xs text-dark-400 font-bold uppercase tracking-wider">Memo (optional)</label>
                <input
                  id="request-memo"
                  type="text"
                  maxLength={80}
                  value={config.memo}
                  onChange={(e) => { setConfig(c => ({ ...c, memo: e.target.value })); setGenerated(false); }}
                  placeholder="e.g. Monthly retainer, Grant payment..."
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-dark-600 focus:outline-none focus:border-accent transition"
                />
              </div>

              {/* Generate */}
              <button
                type="submit"
                disabled={!config.recipient || config.amount <= 0}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-purple text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-accent/20 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Generate PayFlow Link
                <ArrowRight size={16} />
              </button>
            </form>
          </motion.div>

          {/* Right: Live Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 lg:sticky lg:top-28"
          >
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Live Preview</span>

              {/* Preview card */}
              <div className="rounded-2xl border border-white/10 bg-dark-800/60 backdrop-blur-sm overflow-hidden shadow-xl shadow-black/20">
                {/* Gradient header */}
                <div className="h-20 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${selectedToken.color}30, #8B5CF620, #0D948820)` }}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.08),transparent_60%)]" />
                  <div className="absolute top-4 left-5 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                      <Link2 size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[9px] text-white/60 font-bold uppercase tracking-widest">PayFlow Link</p>
                      <p className="text-[10px] text-white/80 font-mono">
                        {config.recipient ? `${config.recipient.slice(0,8)}…${config.recipient.slice(-4)}` : 'G...'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Amount */}
                  <div className="text-center">
                    <p className="text-3xl font-black text-white tracking-tight">
                      {config.amount.toLocaleString()}
                      <span className="text-sm text-dark-400 font-bold ml-2">{config.token}</span>
                    </p>
                    {config.memo && (
                      <p className="text-xs text-dark-400 mt-1 italic">&ldquo;{config.memo}&rdquo;</p>
                    )}
                  </div>

                  {/* Details row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-dark-900/40 rounded-xl p-3 text-center border border-white/5">
                      <span className="text-[9px] text-dark-500 font-bold uppercase block">Duration</span>
                      <span className="text-sm font-bold text-white">{config.durationDays}d</span>
                    </div>
                    <div className="bg-dark-900/40 rounded-xl p-3 text-center border border-white/5">
                      <span className="text-[9px] text-dark-500 font-bold uppercase block">Rate</span>
                      <span className="text-sm font-bold text-white">{ratePerDay}/day</span>
                    </div>
                  </div>

                  {/* Network badge */}
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-dark-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Stellar Soroban · Testnet
                  </div>
                </div>
              </div>

              {/* Share URL output */}
              <AnimatePresence>
                {generated && shareableUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    <div className="bg-dark-800 border border-accent/20 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest flex items-center gap-1">
                          <Check size={12} /> Link Generated
                        </span>
                        <button
                          onClick={handleReset}
                          className="text-[10px] text-dark-500 hover:text-white font-bold transition"
                        >
                          Edit
                        </button>
                      </div>

                      {/* URL display */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-dark-900 border border-white/5 rounded-lg px-3 py-2 text-[11px] font-mono text-teal-300 truncate">
                          {shareableUrl}
                        </div>
                        <button
                          onClick={handleCopy}
                          className={`shrink-0 p-2.5 rounded-lg border transition ${
                            copied
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-dark-700 border-white/10 text-white hover:bg-dark-600'
                          }`}
                          title="Copy to clipboard"
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={shareableUrl.replace(typeof window !== 'undefined' ? window.location.origin : '', '')}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-accent hover:bg-accent-purple text-white py-2.5 rounded-xl text-xs font-bold transition"
                      >
                        Preview Link <ExternalLink size={12} />
                      </Link>
                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({ title: 'PayFlow Payment Request', url: shareableUrl });
                          } else {
                            handleCopy();
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-dark-700 hover:bg-dark-600 border border-white/10 text-white py-2.5 rounded-xl text-xs font-bold transition"
                      >
                        Share <QrCode size={12} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
