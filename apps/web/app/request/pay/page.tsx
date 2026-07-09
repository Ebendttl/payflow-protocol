'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Link2,
  Coins,
  Clock,
  User,
  ArrowRight,
  Shield,
  Wallet,
  Activity,
  CheckCircle2,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { useWalletStore } from '../../../lib/store/walletStore';
import WalletOptionButton from '../../../components/ui/WalletOptionButton';

// ─── Component ────────────────────────────────────────────────────────────────

export default function PayRequestPage() {
  const searchParams = useSearchParams();
  const { publicKey, isConnected, connect, isConnecting, walletType } = useWalletStore();
  const [copied, setCopied] = useState(false);

  const params = useMemo(
    () => ({
      to: searchParams.get('to') || '',
      amount: Number(searchParams.get('amount') || '0'),
      token: searchParams.get('token') || 'USDC',
      dur: Number(searchParams.get('dur') || '30'),
      memo: searchParams.get('memo') || '',
    }),
    [searchParams]
  );

  const ratePerDay = params.dur > 0 ? (params.amount / params.dur).toFixed(2) : '0.00';
  const ratePerSec = params.dur > 0 ? (params.amount / (params.dur * 86400)).toFixed(6) : '0';
  const totalSeconds = params.dur * 86400;

  const isValid = params.to.length === 56 && params.amount > 0 && params.dur > 0;

  // Build pre-filled create stream URL
  const fundUrl = useMemo(() => {
    if (!isValid) return '/streams/create';
    return `/streams/create?prefill=1&recipient=${encodeURIComponent(params.to)}&amount=${params.amount}&token=${params.token}&dur=${params.dur}`;
  }, [params, isValid]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tokenColor = params.token === 'XLM' ? '#08B5E5' : '#2775CA';

  if (!isValid) {
    return (
      <div className="min-h-[calc(100vh-160px)] bg-dark-900 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-10 rounded-2xl border border-rose-500/20 max-w-md text-center space-y-4"
        >
          <Link2 size={40} className="text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Invalid Payment Link</h2>
          <p className="text-sm text-dark-400">
            This link is missing required parameters. Please ask the sender for a new link.
          </p>
          <Link
            href="/request"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-purple text-white px-5 py-2.5 rounded-xl text-sm font-bold transition"
          >
            Create a Link <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-160px)] bg-dark-900 relative overflow-hidden flex items-center justify-center px-6 py-12">
      {/* Ambient glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full blur-[150px] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${tokenColor}12, transparent 70%)` }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-dark-800/70 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/30">
          {/* Gradient header band */}
          <div
            className="h-28 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${tokenColor}35, #8B5CF625, #0D948825)` }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_60%)]" />
            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1 w-1 rounded-full bg-white/20"
                style={{ top: `${20 + i * 12}%`, left: `${10 + i * 15}%` }}
                animate={{ y: [0, -8, 0], opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}

            {/* Header content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                  <Link2 size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[9px] text-white/50 font-bold uppercase tracking-[0.2em]">
                    PayFlow Request
                  </p>
                  <p className="text-xs text-white/90 font-bold">Payment Stream</p>
                </div>
              </div>
              <button
                onClick={handleCopy}
                className={`p-2 rounded-lg border transition ${
                  copied
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                    : 'bg-white/10 border-white/20 text-white/60 hover:text-white'
                }`}
                title="Copy link"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Amount hero */}
            <div className="text-center py-2">
              <motion.p
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-4xl font-black text-white tracking-tight"
              >
                {params.amount.toLocaleString()}
                <span className="text-lg text-dark-400 font-bold ml-2">{params.token}</span>
              </motion.p>
              {params.memo && (
                <p className="text-sm text-dark-400 mt-2 italic">&ldquo;{params.memo}&rdquo;</p>
              )}
            </div>

            {/* Recipient */}
            <div className="bg-dark-900/40 rounded-xl p-4 border border-white/5 space-y-1">
              <span className="text-[9px] text-dark-500 font-bold uppercase tracking-widest flex items-center gap-1">
                <User size={10} /> Recipient
              </span>
              <p className="font-mono text-xs text-teal-300 break-all leading-relaxed">
                {params.to}
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-dark-900/40 rounded-xl p-3 text-center border border-white/5">
                <Clock size={12} className="mx-auto text-dark-500 mb-1" />
                <span className="text-[9px] text-dark-500 font-bold uppercase block">Duration</span>
                <span className="text-sm font-bold text-white">{params.dur}d</span>
              </div>
              <div className="bg-dark-900/40 rounded-xl p-3 text-center border border-white/5">
                <Activity size={12} className="mx-auto text-dark-500 mb-1" />
                <span className="text-[9px] text-dark-500 font-bold uppercase block">Rate</span>
                <span className="text-sm font-bold text-white">{ratePerDay}/d</span>
              </div>
              <div className="bg-dark-900/40 rounded-xl p-3 text-center border border-white/5">
                <Zap size={12} className="mx-auto text-dark-500 mb-1" />
                <span className="text-[9px] text-dark-500 font-bold uppercase block">Per Sec</span>
                <span className="text-sm font-bold text-white font-mono">{ratePerSec}</span>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-4 py-1">
              <div className="flex items-center gap-1 text-[10px] text-dark-500">
                <Shield size={10} className="text-primary" />
                Smart contract escrow
              </div>
              <div className="flex items-center gap-1 text-[10px] text-dark-500">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Stellar Soroban
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3 pt-2">
              {isConnected ? (
                <Link
                  href={fundUrl}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Coins size={16} />
                  Fund This Stream
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <div className="space-y-3">
                  <p className="text-[10px] text-dark-500 font-bold uppercase tracking-widest text-center">
                    Connect wallet to fund
                  </p>
                  <div className="flex gap-2">
                    <WalletOptionButton
                      label="Freighter"
                      onClick={() => connect('freighter')}
                      isConnecting={isConnecting && walletType === 'freighter'}
                    />
                    <WalletOptionButton
                      label="LOBSTR"
                      onClick={() => connect('lobstr')}
                      isConnecting={isConnecting && walletType === 'lobstr'}
                    />
                  </div>
                </div>
              )}

              {/* Secondary link */}
              <div className="flex items-center justify-center gap-4 text-[10px]">
                <Link
                  href="/request"
                  className="text-dark-500 hover:text-white font-bold transition"
                >
                  Create your own link
                </Link>
                <span className="text-dark-700">·</span>
                <Link href="/" className="text-dark-500 hover:text-white font-bold transition">
                  Learn about PayFlow
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Security footer */}
        <div className="flex items-center justify-center gap-2 mt-5 text-[10px] text-dark-600">
          <CheckCircle2 size={10} />
          Funds are locked in an on-chain vault and streamed in real-time
        </div>
      </motion.div>
    </div>
  );
}
