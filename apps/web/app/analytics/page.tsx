'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Wallet,
  RefreshCw,
  FlaskConical,
  ArrowUpRight,
  ChevronUp,
  ChevronDown,
  Minus,
} from 'lucide-react';
import { useWalletStore } from '../../lib/store/walletStore';
import { useStreams } from '../../lib/hooks/useStream';
import WalletOptionButton from '../../components/ui/WalletOptionButton';
import { BarChart, DonutChart, AreaChart } from '../../components/analytics/Charts';
import {
  MOCK_STREAMS,
  computeAccrued,
  getSummary,
  getStatusCounts,
  getDailyFlow,
  getProjection,
} from './helpers';
import type { Stream } from '@payflow/sdk';

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  delay,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="glass p-5 rounded-2xl border border-white/5 flex flex-col justify-between gap-3 hover:border-white/10 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">
          {label}
        </span>
        <div
          className="h-8 w-8 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
        >
          <Icon size={15} style={{ color: accent }} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-black text-white tracking-tight">{value}</p>
        {sub && <p className="text-[11px] text-dark-500 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

// ─── Sortable table ───────────────────────────────────────────────────────────
type SortKey = 'id' | 'totalAmount' | 'claimedAmount' | 'status';
function StreamsTable({ streams, nowSec }: { streams: Stream[]; nowSec: number }) {
  const [sort, setSort] = useState<SortKey>('totalAmount');
  const [dir, setDir] = useState<'asc' | 'desc'>('desc');

  const toggle = (k: SortKey) => {
    if (sort === k) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSort(k);
      setDir('desc');
    }
  };

  const sorted = useMemo(
    () =>
      [...streams].sort((a, b) => {
        let av: number, bv: number;
        if (sort === 'id') {
          av = Number(a.id);
          bv = Number(b.id);
        } else if (sort === 'totalAmount') {
          av = Number(a.totalAmount);
          bv = Number(b.totalAmount);
        } else if (sort === 'claimedAmount') {
          av = Number(a.claimedAmount);
          bv = Number(b.claimedAmount);
        } else {
          av = a.status.charCodeAt(0);
          bv = b.status.charCodeAt(0);
        }
        return dir === 'desc' ? bv - av : av - bv;
      }),
    [streams, sort, dir]
  );

  const SortIcon = ({ k }: { k: SortKey }) =>
    sort === k ? (
      dir === 'desc' ? (
        <ChevronDown size={11} className="text-primary-light" />
      ) : (
        <ChevronUp size={11} className="text-primary-light" />
      )
    ) : (
      <Minus size={11} className="text-dark-600" />
    );

  const statusStyle: Record<string, string> = {
    Active: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    Paused: 'bg-amber-500/10  text-amber-300  border-amber-500/20',
    Cancelled: 'bg-rose-500/10   text-rose-300   border-rose-500/20',
    Completed: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/5">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/5 bg-dark-800/50">
            {(
              [
                ['id', '#ID'],
                ['totalAmount', 'Total'],
                ['claimedAmount', 'Claimed'],
                ['status', 'Status'],
              ] as [SortKey, string][]
            ).map(([k, lbl]) => (
              <th
                key={k}
                onClick={() => toggle(k)}
                className="text-left px-4 py-3 text-dark-500 font-bold uppercase tracking-widest cursor-pointer select-none hover:text-white transition whitespace-nowrap"
              >
                <span className="flex items-center gap-1">
                  {lbl} <SortIcon k={k} />
                </span>
              </th>
            ))}
            <th className="text-left px-4 py-3 text-dark-500 font-bold uppercase tracking-widest whitespace-nowrap">
              Recipient
            </th>
            <th className="text-left px-4 py-3 text-dark-500 font-bold uppercase tracking-widest whitespace-nowrap">
              Progress
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s, i) => {
            const acc = computeAccrued(s, nowSec);
            const pct = Math.min(100, Math.round((acc / (Number(s.totalAmount) / 1e7)) * 100));
            return (
              <motion.tr
                key={s.id.toString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-white/5 hover:bg-white/[0.02] transition"
              >
                <td className="px-4 py-3 font-mono text-dark-400">#{s.id.toString()}</td>
                <td className="px-4 py-3 font-mono font-bold text-white">
                  {(Number(s.totalAmount) / 1e7).toFixed(2)}
                  <span className="ml-1 text-dark-500 text-[10px]">{s.token.slice(0, 6)}</span>
                </td>
                <td className="px-4 py-3 font-mono text-dark-300">
                  {(Number(s.claimedAmount) / 1e7).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${statusStyle[s.status]}`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-teal-300 text-[11px]">
                  {s.recipient.slice(0, 6)}…{s.recipient.slice(-4)}
                </td>
                <td className="px-4 py-3 min-w-[110px]">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-dark-400 font-bold w-8 text-right">
                      {pct}%
                    </span>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { publicKey, connect, isConnecting, walletType } = useWalletStore();
  const { streams: live, isLoading, refetch } = useStreams(publicKey);
  const [nowSec, setNowSec] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const id = setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const isDemo = !publicKey;
  const streams: Stream[] = isDemo ? MOCK_STREAMS : live;

  const summary = useMemo(() => getSummary(streams, nowSec), [streams, nowSec]);
  const statusCounts = useMemo(() => getStatusCounts(streams), [streams]);
  const dailyFlow = useMemo(() => getDailyFlow(streams, 14), [streams]);
  const projection = useMemo(() => getProjection(streams, 30), [streams]);

  const donutSegments = [
    { label: 'Active', count: statusCounts.Active || 0, color: '#0D9488' },
    { label: 'Paused', count: statusCounts.Paused || 0, color: '#F59E0B' },
    { label: 'Completed', count: statusCounts.Completed || 0, color: '#8B5CF6' },
    { label: 'Cancelled', count: statusCounts.Cancelled || 0, color: '#F43F5E' },
  ];

  return (
    <div className="min-h-[calc(100vh-160px)] bg-dark-900 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 h-96 w-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-7xl w-full mx-auto px-6 py-12 space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <BarChart3 className="text-primary-light" size={28} />
              Stream Analytics
            </h1>
            <p className="text-xs text-dark-500 mt-1">
              {isDemo
                ? 'Viewing demo data — connect a wallet to see your live streams'
                : `Portfolio overview for ${publicKey!.slice(0, 6)}…${publicKey!.slice(-4)}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isDemo && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                <FlaskConical size={12} /> Demo Mode
              </span>
            )}
            {publicKey && (
              <button
                onClick={refetch}
                disabled={isLoading}
                className="p-2 rounded-xl bg-dark-800 border border-white/5 text-dark-400 hover:text-white transition disabled:opacity-50"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin text-primary' : ''} />
              </button>
            )}
            {publicKey && (
              <Link
                href="/streams/create"
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 transition hover:scale-[1.02]"
              >
                New Stream <ArrowUpRight size={13} />
              </Link>
            )}
          </div>
        </div>

        {/* Wallet gate (only if no wallet — still show demo) */}
        {!publicKey && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-5 rounded-2xl border border-amber-500/15 bg-amber-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <Wallet size={20} className="text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">Connect wallet to see live data</p>
                <p className="text-xs text-dark-500">
                  Your real on-chain streams will populate all charts below.
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
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
          </motion.div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            delay={0}
            label="Total Value Locked"
            value={`$${summary.tvl.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            sub="active + paused streams"
            icon={Wallet}
            accent="#0D9488"
          />
          <StatCard
            delay={0.06}
            label="Total Claimed"
            value={`$${summary.totalClaimed.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            sub="all-time disbursed"
            icon={TrendingUp}
            accent="#8B5CF6"
          />
          <StatCard
            delay={0.12}
            label="Claimable Now"
            value={`$${summary.claimable.toFixed(4)}`}
            sub="accrued − claimed, live"
            icon={ArrowUpRight}
            accent="#10B981"
          />
          <StatCard
            delay={0.18}
            label="Active Streams"
            value={String(summary.activeCount)}
            sub={`${(summary.ratePerSec * 86400).toFixed(2)} tokens/day`}
            icon={Activity}
            accent="#F59E0B"
          />
        </div>

        {/* Bar + Donut row */}
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 glass rounded-2xl border border-white/5 p-6 space-y-3"
          >
            <div>
              <h2 className="text-sm font-bold text-white">Daily Stream Volume</h2>
              <p className="text-[11px] text-dark-500">Tokens streamed per day — last 14 days</p>
            </div>
            <div className="h-44">
              <BarChart data={dailyFlow} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className="glass rounded-2xl border border-white/5 p-6 space-y-3"
          >
            <div>
              <h2 className="text-sm font-bold text-white">Portfolio Health</h2>
              <p className="text-[11px] text-dark-500">Stream status breakdown</p>
            </div>
            <div className="h-44">
              <DonutChart segments={donutSegments} total={streams.length} />
            </div>
          </motion.div>
        </div>

        {/* Projection chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="glass rounded-2xl border border-white/5 p-6 space-y-3"
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-sm font-bold text-white">Projected Earnings</h2>
              <p className="text-[11px] text-dark-500">
                Cumulative earnings from all active streams — next 30 days
              </p>
            </div>
            <span className="text-[10px] font-bold text-primary-light bg-primary/10 border border-primary/20 px-2 py-1 rounded-lg">
              +{projection[projection.length - 1]?.value.toFixed(2)} projected
            </span>
          </div>
          <div className="h-40">
            <AreaChart data={projection} />
          </div>
        </motion.div>

        {/* Streams table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="space-y-3"
        >
          <div>
            <h2 className="text-sm font-bold text-white">All Streams</h2>
            <p className="text-[11px] text-dark-500">Click column headers to sort</p>
          </div>
          {streams.length > 0 ? (
            <StreamsTable streams={streams} nowSec={nowSec} />
          ) : (
            <div className="glass p-10 rounded-2xl border border-white/5 text-center">
              <BarChart3 className="mx-auto text-dark-600 mb-3" size={36} />
              <p className="text-sm font-bold text-white">No streams yet</p>
              <p className="text-xs text-dark-500 mt-1">
                Create your first stream to see analytics here.
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
