import type { Stream } from '@payflow/sdk';

export const MOCK_STREAMS: Stream[] = [
  {
    id: 1n,
    sender: 'GDEMO1SENDER000000000000000000000000000000000000000000000',
    recipient: 'GDEMO1RECIP000000000000000000000000000000000000000000000A',
    token: 'USDC',
    totalAmount: 30000000000n, // 3 000 USDC
    claimedAmount: 12000000000n,
    startTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 14),
    endTime: BigInt(Math.floor(Date.now() / 1000) + 86400 * 16),
    pausedAt: null,
    totalPausedDuration: 0n,
    status: 'Active',
  },
  {
    id: 2n,
    sender: 'GDEMO1SENDER000000000000000000000000000000000000000000000',
    recipient: 'GDEMO2RECIP000000000000000000000000000000000000000000000B',
    token: 'USDC',
    totalAmount: 50000000000n, // 5 000 USDC
    claimedAmount: 50000000000n,
    startTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 30),
    endTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 2),
    pausedAt: null,
    totalPausedDuration: 0n,
    status: 'Completed',
  },
  {
    id: 3n,
    sender: 'GDEMO1SENDER000000000000000000000000000000000000000000000',
    recipient: 'GDEMO3RECIP000000000000000000000000000000000000000000000C',
    token: 'XLM',
    totalAmount: 10000000000n, // 1 000 XLM
    claimedAmount: 3000000000n,
    startTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 5),
    endTime: BigInt(Math.floor(Date.now() / 1000) + 86400 * 25),
    pausedAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * 1),
    totalPausedDuration: BigInt(86400),
    status: 'Paused',
  },
  {
    id: 4n,
    sender: 'GDEMO1SENDER000000000000000000000000000000000000000000000',
    recipient: 'GDEMO4RECIP000000000000000000000000000000000000000000000D',
    token: 'USDC',
    totalAmount: 8000000000n, // 800 USDC
    claimedAmount: 8000000000n,
    startTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 20),
    endTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 10),
    pausedAt: null,
    totalPausedDuration: 0n,
    status: 'Cancelled',
  },
  {
    id: 5n,
    sender: 'GDEMO1SENDER000000000000000000000000000000000000000000000',
    recipient: 'GDEMO5RECIP000000000000000000000000000000000000000000000E',
    token: 'USDC',
    totalAmount: 15000000000n, // 1 500 USDC
    claimedAmount: 2000000000n,
    startTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 3),
    endTime: BigInt(Math.floor(Date.now() / 1000) + 86400 * 27),
    pausedAt: null,
    totalPausedDuration: 0n,
    status: 'Active',
  },
];

// ─── Accrued helper ─────────────────────────────────────────────────────────
export function computeAccrued(stream: Stream, nowSec: number): number {
  if (stream.status === 'Completed') return Number(stream.totalAmount) / 1e7;
  if (stream.status === 'Cancelled') return Number(stream.claimedAmount) / 1e7;
  const start = Number(stream.startTime);
  const end = Number(stream.endTime);
  const paused = stream.pausedAt ? Number(stream.pausedAt) : null;
  const paused_dur = Number(stream.totalPausedDuration);
  const totalDur = end - start;
  if (totalDur <= 0) return Number(stream.totalAmount) / 1e7;
  let elapsed = nowSec - start;
  if (paused !== null) elapsed = paused - start;
  const active = Math.max(0, elapsed - paused_dur);
  const frac = Math.min(1, active / totalDur);
  return (Number(stream.totalAmount) / 1e7) * frac;
}

// ─── Summary metrics ─────────────────────────────────────────────────────────
export function getSummary(streams: Stream[], nowSec: number) {
  const tvl = streams
    .filter((s) => s.status === 'Active' || s.status === 'Paused')
    .reduce((a, s) => a + Number(s.totalAmount) / 1e7, 0);
  const totalClaimed = streams.reduce((a, s) => a + Number(s.claimedAmount) / 1e7, 0);
  const claimable = streams
    .filter((s) => s.status === 'Active' || s.status === 'Paused' || s.status === 'Completed')
    .reduce((a, s) => {
      const acc = computeAccrued(s, nowSec);
      const claimed = Number(s.claimedAmount) / 1e7;
      return a + Math.max(0, acc - claimed);
    }, 0);
  const activeCount = streams.filter((s) => s.status === 'Active').length;
  const ratePerSec = streams
    .filter((s) => s.status === 'Active')
    .reduce((a, s) => {
      const dur = Number(s.endTime) - Number(s.startTime);
      return a + (dur > 0 ? Number(s.totalAmount) / 1e7 / dur : 0);
    }, 0);
  return { tvl, totalClaimed, claimable, activeCount, ratePerSec };
}

// ─── Status breakdown ────────────────────────────────────────────────────────
export function getStatusCounts(streams: Stream[]) {
  return streams.reduce<Record<string, number>>(
    (acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    },
    { Active: 0, Paused: 0, Cancelled: 0, Completed: 0 }
  );
}

// ─── Daily flow (last N days) ─────────────────────────────────────────────────
export function getDailyFlow(streams: Stream[], days = 14): { label: string; value: number }[] {
  const nowMs = Date.now();
  return Array.from({ length: days }, (_, i) => {
    const dayEnd = nowMs - (days - 1 - i) * 86400_000;
    const dayStart = dayEnd - 86400_000;
    const dayEndSec = dayEnd / 1000;
    const dayStartSec = dayStart / 1000;
    const label = new Date(dayEnd).toLocaleDateString('en', {
      weekday: 'short',
      month: 'numeric',
      day: 'numeric',
    });
    const value = streams.reduce((sum, s) => {
      const start = Number(s.startTime);
      const end = Number(s.endTime);
      const dur = end - start;
      if (dur <= 0) return sum;
      const rate = Number(s.totalAmount) / 1e7 / dur;
      const overlap = Math.max(0, Math.min(end, dayEndSec) - Math.max(start, dayStartSec));
      return sum + rate * overlap;
    }, 0);
    return { label, value };
  });
}

// ─── 30-day cumulative earnings projection ────────────────────────────────────
export function getProjection(streams: Stream[], days = 30): { day: number; value: number }[] {
  const nowSec = Math.floor(Date.now() / 1000);
  const active = streams.filter((s) => s.status === 'Active');
  let cumulative = 0;
  return Array.from({ length: days + 1 }, (_, i) => {
    const targetSec = nowSec + i * 86400;
    if (i > 0) {
      const prevSec = nowSec + (i - 1) * 86400;
      const dayEarned = active.reduce((sum, s) => {
        const end = Number(s.endTime);
        const start = Number(s.startTime);
        const dur = end - start;
        if (dur <= 0) return sum;
        const rate = Number(s.totalAmount) / 1e7 / dur;
        const overlap = Math.max(0, Math.min(end, targetSec) - Math.max(start, prevSec));
        return sum + rate * overlap;
      }, 0);
      cumulative += dayEarned;
    }
    return { day: i, value: cumulative };
  });
}
