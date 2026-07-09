'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Zap,
  Shield,
  HelpCircle as HelpIcon,
} from 'lucide-react';

type TokenOption = 'USDC' | 'XLM' | 'EURC';
type FrequencyOption = 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';

const TOKEN_COLORS: Record<
  TokenOption,
  { primary: string; light: string; bg: string; text: string }
> = {
  USDC: {
    primary: '#0D9488',
    light: '#2DD4BF',
    bg: 'rgba(13, 148, 136, 0.1)',
    text: 'text-primary-light',
  },
  XLM: {
    primary: '#8B5CF6',
    light: '#A78BFA',
    bg: 'rgba(139, 92, 246, 0.1)',
    text: 'text-accent-purple',
  },
  EURC: {
    primary: '#10B981',
    light: '#34D399',
    bg: 'rgba(16, 185, 129, 0.1)',
    text: 'text-emerald-400',
  },
};

const FREQUENCY_SECONDS: Record<FrequencyOption, number> = {
  second: 1,
  minute: 60,
  hour: 3600,
  day: 86400,
  month: 2592000,
  year: 31536000,
};

const FREQUENCY_LABELS: Record<FrequencyOption, string> = {
  second: 'sec',
  minute: 'min',
  hour: 'hr',
  day: 'day',
  month: 'mo',
  year: 'yr',
};

export default function StreamSimulator() {
  // Simulator Controls State
  const [token, setToken] = useState<TokenOption>('USDC');
  const [amount, setAmount] = useState<number>(1000);
  const [frequency, setFrequency] = useState<FrequencyOption>('month');

  // Real-time Accumulation State
  const [accrued, setAccrued] = useState<number>(0);
  const [totalClaimed, setTotalClaimed] = useState<number>(0);

  // Animation/Claim State
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimsCount, setClaimsCount] = useState<number>(0);
  const [claimNotification, setClaimNotification] = useState<string | null>(null);

  // References for continuous tick calculations
  const lastResetTimeRef = useRef<number>(Date.now());
  const flowRateRef = useRef<number>(0);

  // Calculate flow rate per second whenever amount or frequency changes
  useEffect(() => {
    const seconds = FREQUENCY_SECONDS[frequency];
    flowRateRef.current = amount / seconds;
    // Reset accrued amount when parameters change to keep it clean, or recalculate
    setAccrued(0);
    lastResetTimeRef.current = Date.now();
  }, [amount, frequency]);

  // requestAnimationFrame hook for high-frequency tick update
  useEffect(() => {
    let animationId: number;

    const updateTick = () => {
      const now = Date.now();
      const elapsedSeconds = (now - lastResetTimeRef.current) / 1000;
      const accumulated = elapsedSeconds * flowRateRef.current;
      setAccrued(accumulated);
      animationId = requestAnimationFrame(updateTick);
    };

    animationId = requestAnimationFrame(updateTick);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Claim handler
  const handleClaim = () => {
    if (accrued <= 0.000001) return;

    setIsClaiming(true);
    const claimedValue = accrued;
    setTotalClaimed((prev) => prev + claimedValue);
    setClaimNotification(`+${claimedValue.toFixed(6)} ${token}`);

    // Reset accrued counter
    lastResetTimeRef.current = Date.now();
    setAccrued(0);
    setClaimsCount((c) => c + 1);

    setTimeout(() => {
      setIsClaiming(false);
    }, 600);

    setTimeout(() => {
      setClaimNotification(null);
    }, 3000);
  };

  // Cost calculator metrics
  const hourlyDisbursementFeeStellar = 0.0001; // $0.0001 in XLM flat fee
  const hourlyDisbursementFeeEthL1 = 2.5; // Average Eth L1 execution
  const hourlyDisbursementFeeL2 = 0.05; // Average Arbitrum/Optimism execution

  const claimsPerMonth = 24 * 30; // Claim hourly for 1 month
  const monthlyStellarFees = claimsPerMonth * hourlyDisbursementFeeStellar;
  const monthlyEthL1Fees = claimsPerMonth * hourlyDisbursementFeeEthL1;
  const monthlyL2Fees = claimsPerMonth * hourlyDisbursementFeeL2;

  // Format decimals nicely
  const integerPart = Math.floor(accrued);
  const decimalPart = (accrued % 1).toFixed(7).substring(2); // take the 7 digits after "0."

  const currentColors = TOKEN_COLORS[token];

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-16 space-y-10 border-t border-white/5 relative">
      <div className="absolute top-[20%] left-[50%] -translate-x-1/2 h-[300px] w-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Section Header */}
      <div className="text-center space-y-3 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-primary-light">
          <Zap size={12} className="animate-pulse" />
          Interactive Demo
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Experience Continuous Flow in Real Time
        </h2>
        <p className="text-sm text-dark-500 max-w-2xl mx-auto">
          Adjust the parameters below to see tokens stream directly into your simulation wallet.
          Watch how Soroban&apos;s sub-cent fees make micro-claims highly practical.
        </p>
      </div>

      {/* Simulator Layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-stretch relative z-10">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 md:p-8 rounded-2xl bg-dark-800/40 border border-white/5 backdrop-blur-sm space-y-8">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <SlidersIcon className="text-primary-light" size={18} />
              Stream Parameters
            </h3>

            {/* Token Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-dark-500 uppercase tracking-wider">
                Select Token
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['USDC', 'XLM', 'EURC'] as TokenOption[]).map((t) => {
                  const active = token === t;
                  const colors = TOKEN_COLORS[t];
                  return (
                    <button
                      key={t}
                      onClick={() => setToken(t)}
                      style={{
                        borderColor: active ? colors.primary : 'rgba(255, 255, 255, 0.05)',
                        backgroundColor: active ? colors.bg : 'transparent',
                      }}
                      className={`py-3 px-4 rounded-xl border text-sm font-bold transition flex flex-col items-center gap-1 hover:scale-[1.02] active:scale-[0.98] ${
                        active ? 'text-white' : 'text-dark-500 hover:text-white'
                      }`}
                    >
                      <Coins size={16} style={{ color: colors.light }} />
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Flow Amount Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-dark-500 uppercase tracking-wider">
                  Flow Rate Amount
                </span>
                <span className="text-white font-mono text-sm font-bold bg-dark-700/50 px-2 py-0.5 rounded border border-white/5">
                  {amount.toLocaleString()} {token}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="10000"
                step="10"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-1.5 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-dark-600 font-bold uppercase">
                <span>10 {token}</span>
                <span>5,000</span>
                <span>10,000 {token}</span>
              </div>
            </div>

            {/* Frequency Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-dark-500 uppercase tracking-wider">
                Flow Time-Frequency
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {(['second', 'minute', 'hour', 'day', 'month', 'year'] as FrequencyOption[]).map(
                  (freq) => {
                    const active = frequency === freq;
                    return (
                      <button
                        key={freq}
                        onClick={() => setFrequency(freq)}
                        className={`py-2 px-1 rounded-lg border text-xs font-bold transition uppercase tracking-wider ${
                          active
                            ? 'border-primary bg-primary/10 text-primary-light'
                            : 'border-white/5 bg-transparent text-dark-500 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        /{FREQUENCY_LABELS[freq]}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* Micro calculations under controls */}
          <div className="pt-6 border-t border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-dark-500 font-medium">Flow per second:</span>
              <span className="text-white font-mono font-bold">
                {flowRateRef.current.toFixed(6)} {token}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-dark-500 font-medium">Flow per day:</span>
              <span className="text-white font-mono font-bold">
                {(flowRateRef.current * 86400).toLocaleString(undefined, {
                  maximumFractionDigits: 4,
                })}{' '}
                {token}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Flow & Live Ticker */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 md:p-8 rounded-2xl bg-dark-800/40 border border-white/5 backdrop-blur-sm space-y-8 relative overflow-hidden">
          {/* Top visual representation */}
          <div className="relative w-full h-24 bg-dark-900/60 rounded-xl border border-white/5 flex items-center justify-between px-6 md:px-10 overflow-hidden">
            {/* Simulated flow connection path */}
            <div className="absolute left-[80px] right-[80px] top-1/2 -translate-y-1/2 h-[2px] bg-dark-700 z-0">
              <div
                style={{
                  background: `linear-gradient(to right, transparent, ${currentColors.primary}, transparent)`,
                }}
                className="w-full h-full animate-[pulse_2s_infinite]"
              />
            </div>

            {/* Animated particles */}
            <div className="absolute left-[90px] right-[90px] top-1/2 -translate-y-1/2 h-4 z-10 overflow-hidden">
              <motion.div
                initial={{ x: '-10%' }}
                animate={{ x: '110%' }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                className="w-2.5 h-2.5 rounded-full blur-[1px] shadow-lg"
                style={{
                  backgroundColor: currentColors.light,
                  boxShadow: `0 0 8px ${currentColors.light}`,
                }}
              />
              <motion.div
                initial={{ x: '-10%' }}
                animate={{ x: '110%' }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'linear', delay: 0.6 }}
                className="w-2 h-2 rounded-full blur-[1px] shadow-lg"
                style={{
                  backgroundColor: currentColors.light,
                  boxShadow: `0 0 6px ${currentColors.light}`,
                }}
              />
              <motion.div
                initial={{ x: '-10%' }}
                animate={{ x: '110%' }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'linear', delay: 1.2 }}
                className="w-2.5 h-2.5 rounded-full blur-[1px] shadow-lg"
                style={{
                  backgroundColor: currentColors.light,
                  boxShadow: `0 0 8px ${currentColors.light}`,
                }}
              />
            </div>

            {/* Sender Node */}
            <div className="z-20 flex flex-col items-center space-y-1.5">
              <div
                style={{ borderColor: currentColors.primary }}
                className="h-12 w-12 rounded-xl bg-dark-800 border flex items-center justify-center text-white shadow-md"
              >
                <Shield size={20} className="text-dark-500" />
              </div>
              <span className="text-[10px] font-mono text-dark-500 uppercase tracking-wider">
                Vault
              </span>
            </div>

            <div className="z-10 flex flex-col items-center pt-2">
              <span className="text-[10px] text-teal-400 font-bold tracking-wider uppercase animate-pulse">
                Streaming
              </span>
            </div>

            {/* Recipient Node */}
            <div className="z-20 flex flex-col items-center space-y-1.5">
              <div
                style={{ borderColor: currentColors.primary }}
                className="h-12 w-12 rounded-xl bg-dark-800 border flex items-center justify-center text-white shadow-md relative"
              >
                <Coins size={20} style={{ color: currentColors.light }} />

                {/* Floating Claim feedback inside the target wallet icon */}
                <AnimatePresence>
                  {isClaiming && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0, y: 0 }}
                      animate={{ scale: 1.2, opacity: 1, y: -25 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute text-xs font-black text-primary-light bg-dark-900 border border-teal-500/30 px-2 py-0.5 rounded-full pointer-events-none whitespace-nowrap z-50 shadow-lg shadow-black/80"
                    >
                      Claimed!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className="text-[10px] font-mono text-dark-500 uppercase tracking-wider">
                Recipient
              </span>
            </div>
          </div>

          {/* Real-time Ticker Counter */}
          <div className="text-center py-4 bg-dark-900/40 rounded-2xl border border-white/5 shadow-inner">
            <span className="text-xs font-bold text-dark-500 uppercase tracking-wider">
              Accrued Flow Balance
            </span>
            <div className="flex justify-center items-baseline mt-2 mb-1">
              {/* Ticker Integer */}
              <span className="text-4xl md:text-5xl font-black text-white tracking-tight">
                {integerPart}
              </span>
              {/* Floating Decimal point */}
              <span className="text-4xl md:text-5xl font-black text-white/40">.</span>
              {/* Monospaced decimal for visual alignment stabilization */}
              <span className="text-3xl md:text-4xl font-mono font-bold text-white/80 tabular-nums">
                {decimalPart}
              </span>
              <span className="ml-2 text-md font-extrabold text-dark-500 uppercase">{token}</span>
            </div>
            <p className="text-[10px] text-dark-600">Simulated real-time ledger tracking</p>
          </div>

          {/* Claim Action Row */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-dark-900/20 p-4 rounded-xl border border-white/5">
            <div className="text-center sm:text-left">
              <span className="text-xxs text-dark-500 font-bold uppercase tracking-wider block">
                Total Sim-Wallet Balance
              </span>
              <span className="text-md font-bold text-white font-mono">
                {totalClaimed.toFixed(6)} <span className="text-xs text-dark-600">{token}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Interactive notification of claim */}
              <AnimatePresence>
                {claimNotification && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-xs font-bold text-primary-light bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg flex items-center gap-1"
                  >
                    <Sparkles size={12} />
                    {claimNotification}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleClaim}
                disabled={accrued <= 0.0001 || isClaiming}
                className="px-6 py-3 bg-primary hover:bg-primary-dark disabled:bg-dark-700 disabled:text-dark-500 text-white font-bold rounded-xl transition duration-200 flex items-center gap-2 active:scale-[0.98] shadow-md hover:shadow-primary/20 hover:scale-[1.02] disabled:scale-100 disabled:pointer-events-none"
              >
                Claim Accrued
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Calculator Section */}
      <div className="bg-dark-800/20 border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="text-primary-light" size={18} />
              Stellar Soroban Cost Efficiency Analysis
            </h3>
            <p className="text-xs text-dark-500">
              Comparing network transaction fees for claiming continuous streams hourly (720 times /
              month).
            </p>
          </div>
          <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-xs font-bold text-primary-light">
            99.99% Cost Reduction
          </div>
        </div>

        {/* Fee Bars Visualizer */}
        <div className="grid md:grid-cols-3 gap-6 pt-2">
          {/* Stellar Soroban Card */}
          <div className="glass p-5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-primary">
              <Zap size={24} className="opacity-20" />
            </div>
            <div>
              <span className="text-xxs text-primary font-bold uppercase tracking-wider">
                Engine: Soroban
              </span>
              <h4 className="text-md font-bold text-white mt-1">Stellar Testnet</h4>
              <p className="text-xxs text-dark-500 mt-0.5">Sub-cent micro transaction fees</p>
            </div>
            <div className="mt-8 space-y-1">
              <span className="text-[10px] text-dark-500 font-bold block uppercase tracking-wider">
                Monthly Claim Cost
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-primary-light">
                  ${monthlyStellarFees.toFixed(4)}
                </span>
                <span className="text-xxs text-dark-500">USD</span>
              </div>
              <div className="w-full h-1 bg-dark-700 rounded-full mt-2">
                <div className="h-full bg-primary-light rounded-full" style={{ width: '1%' }} />
              </div>
            </div>
          </div>

          {/* Ethereum L2 Card */}
          <div className="glass p-5 rounded-xl border border-white/5 flex flex-col justify-between">
            <div>
              <span className="text-xxs text-accent-purple font-bold uppercase tracking-wider">
                Traditional Layer 2
              </span>
              <h4 className="text-md font-bold text-white mt-1">Arbitrum / Optimism</h4>
              <p className="text-xxs text-dark-500 mt-0.5">Low-cost rollups with variable gas</p>
            </div>
            <div className="mt-8 space-y-1">
              <span className="text-[10px] text-dark-500 font-bold block uppercase tracking-wider">
                Monthly Claim Cost
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">${monthlyL2Fees.toFixed(2)}</span>
                <span className="text-xxs text-dark-500">USD</span>
              </div>
              <div className="w-full h-1 bg-dark-700 rounded-full mt-2">
                <div className="h-full bg-accent-purple rounded-full" style={{ width: '25%' }} />
              </div>
            </div>
          </div>

          {/* Ethereum L1 Card */}
          <div className="glass p-5 rounded-xl border border-white/5 flex flex-col justify-between">
            <div>
              <span className="text-xxs text-accent-rose font-bold uppercase tracking-wider">
                Layer 1
              </span>
              <h4 className="text-md font-bold text-white mt-1">Ethereum Mainnet</h4>
              <p className="text-xxs text-dark-500 mt-0.5">
                High base fees, prohibitive for micro-claims
              </p>
            </div>
            <div className="mt-8 space-y-1">
              <span className="text-[10px] text-dark-500 font-bold block uppercase tracking-wider">
                Monthly Claim Cost
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-accent-rose">
                  ${monthlyEthL1Fees.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xxs text-dark-500">USD</span>
              </div>
              <div className="w-full h-1 bg-dark-700 rounded-full mt-2">
                <div className="h-full bg-accent-rose rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Explainers */}
        <p className="text-xxs text-dark-600 text-center leading-relaxed">
          * Calculation assumes flat network fees: Soroban: $0.0001 (0.00002 XLM), Ethereum L2:
          $0.05, Ethereum L1: $2.50. Continuous streaming is only viable on platforms where frequent
          micro-claims do not erode the principal value transferred.
        </p>
      </div>
    </section>
  );
}

// Inline replacement for slider icon to prevent build failures
function SlidersIcon({ className, size }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="4" x2="4" y1="21" y2="14" />
      <line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" />
      <line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" />
      <line x1="20" x2="20" y1="12" y2="3" />
      <line x1="2" x2="6" y1="14" y2="14" />
      <line x1="10" x2="14" y1="8" y2="8" />
      <line x1="18" x2="22" y1="16" y2="16" />
    </svg>
  );
}
