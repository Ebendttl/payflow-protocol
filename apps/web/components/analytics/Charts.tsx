"use client";

import React, { useState } from 'react';

// ─── Bar Chart ────────────────────────────────────────────────────────────────
interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
}

export function BarChart({ data, color = '#0D9488' }: BarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const W = 560; const H = 160; const PAD = { t: 10, r: 8, b: 36, l: 8 };
  const max = Math.max(...data.map(d => d.value), 0.01);
  const bw = (W - PAD.l - PAD.r) / data.length;
  const bGap = bw * 0.25;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const x = PAD.l + i * bw + bGap / 2;
        const bh = Math.max(2, ((d.value / max) * (H - PAD.t - PAD.b)));
        const y = H - PAD.b - bh;
        const isH = hovered === i;
        return (
          <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <rect
              x={x} y={y} width={bw - bGap} height={bh}
              fill={isH ? color : 'url(#barGrad)'}
              rx={3}
              style={{ transition: 'fill 0.15s' }}
            />
            {isH && (
              <g>
                <rect x={x - 4} y={y - 26} width={bw - bGap + 8} height={22} rx={4} fill="#111827" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                <text x={x + (bw - bGap) / 2} y={y - 11} textAnchor="middle" fill="#2DD4BF" fontSize={9} fontWeight={700}>
                  {d.value < 0.01 ? '—' : d.value.toFixed(2)}
                </text>
              </g>
            )}
            {(i % 2 === 0 || data.length <= 7) && (
              <text
                x={x + (bw - bGap) / 2} y={H - PAD.b + 14}
                textAnchor="middle" fill="#6B7280" fontSize={8} fontWeight={600}
              >
                {d.label.split(',')[0]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
interface DonutSegment { label: string; count: number; color: string }
interface DonutChartProps { segments: DonutSegment[]; total: number }

export function DonutChart({ segments, total }: DonutChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const R = 52; const CX = 70; const CY = 70;
  const circ = 2 * Math.PI * R;
  let offset = -circ / 4; // start at top
  const safeTotal = total || 1;

  return (
    <svg viewBox="0 0 200 140" className="w-full h-full overflow-visible">
      {segments.map(seg => {
        const frac = seg.count / safeTotal;
        const dash = frac * circ;
        const gap  = circ - dash;
        const isH  = hovered === seg.label;
        const el = (
          <circle
            key={seg.label}
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke={seg.color}
            strokeOpacity={seg.count === 0 ? 0.1 : isH ? 1 : 0.75}
            strokeWidth={isH ? 14 : 12}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            style={{ transition: 'stroke-width 0.2s, stroke-opacity 0.2s', cursor: 'pointer' }}
            onMouseEnter={() => setHovered(seg.label)}
            onMouseLeave={() => setHovered(null)}
          />
        );
        offset += dash;
        return el;
      })}
      {/* Center label */}
      <text x={CX} y={CY - 6} textAnchor="middle" fill="white" fontSize={18} fontWeight={800}>{total}</text>
      <text x={CX} y={CY + 10} textAnchor="middle" fill="#6B7280" fontSize={8} fontWeight={700} letterSpacing={1}>STREAMS</text>
      {/* Legend */}
      {segments.map((seg, i) => (
        <g key={seg.label} transform={`translate(140, ${16 + i * 22})`}>
          <rect width={8} height={8} rx={2} fill={seg.color} opacity={seg.count === 0 ? 0.25 : 0.85} />
          <text x={12} y={8} fill={hovered === seg.label ? 'white' : '#9CA3AF'} fontSize={9} fontWeight={700}>{seg.label}</text>
          <text x={58} y={8} fill="white" fontSize={9} fontWeight={800} textAnchor="end">{seg.count}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Area / Projection Chart ──────────────────────────────────────────────────
interface AreaChartProps {
  data: { day: number; value: number }[];
  color?: string;
}

export function AreaChart({ data, color = '#0D9488' }: AreaChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const W = 800; const H = 140;
  const PAD = { t: 16, r: 16, b: 28, l: 16 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const maxV = Math.max(...data.map(d => d.value), 0.01);
  const n = data.length;

  const px = (i: number) => PAD.l + (i / (n - 1)) * innerW;
  const py = (v: number) => PAD.t + innerH - (v / maxV) * innerH;

  // Build smooth path with bezier control points
  let pathD = `M ${px(0)} ${py(data[0].value)}`;
  for (let i = 1; i < n; i++) {
    const cpx = (px(i - 1) + px(i)) / 2;
    pathD += ` C ${cpx} ${py(data[i-1].value)}, ${cpx} ${py(data[i].value)}, ${px(i)} ${py(data[i].value)}`;
  }
  const areaD = `${pathD} L ${px(n-1)} ${H - PAD.b} L ${px(0)} ${H - PAD.b} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <line key={f} x1={PAD.l} x2={W - PAD.r}
          y1={PAD.t + innerH * (1 - f)} y2={PAD.t + innerH * (1 - f)}
          stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
      ))}
      <path d={areaD} fill="url(#areaGrad)" />
      <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {/* Hover dots + labels */}
      {data.map((d, i) => {
        if (i % Math.max(1, Math.floor(n / 7)) !== 0 && i !== n - 1 && hovered !== i) return null;
        const isH = hovered === i;
        return (
          <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <circle cx={px(i)} cy={py(d.value)} r={isH ? 5 : 3}
              fill={isH ? 'white' : color} stroke={color} strokeWidth={isH ? 2 : 0}
              style={{ transition: 'r 0.15s' }} />
            {isH && (
              <g>
                <rect x={px(i) - 30} y={py(d.value) - 28} width={60} height={20} rx={4}
                  fill="#111827" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                <text x={px(i)} y={py(d.value) - 14} textAnchor="middle" fill="#2DD4BF" fontSize={9} fontWeight={700}>
                  +{d.value.toFixed(2)}
                </text>
              </g>
            )}
            {!isH && (
              <text x={px(i)} y={H - PAD.b + 14} textAnchor="middle" fill="#4B5563" fontSize={8} fontWeight={600}>
                Day {d.day}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
