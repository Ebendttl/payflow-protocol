# PayFlow Protocol Frontend Audit & Technical Snapshot

This document provides a comprehensive, self-contained overview of the current frontend implementation of the PayFlow Protocol web application (`apps/web/`). It is intended to serve as a guide for external reviewers to identify areas of improvement and plan new features, pages, components, and design flows.

---

## SECTION 1: ROUTE MAP

This section maps out all the route layouts and page files under `apps/web/app/` ending in `page.tsx` or `layout.tsx`.

### 1. Root Layout
* **File Path:** `apps/web/app/layout.tsx`
* **Route Path:** Root Layout (`/`)
* **Description:** Renders the base HTML shell of the application. It loads the google font `Inter` and wraps the children in an antialiased body with `min-h-screen flex flex-col`. Contains metadata configuration.

### 2. Home Page
* **File Path:** `apps/web/app/page.tsx`
* **Route Path:** `/`
* **Description:** Renders the marketing landing page of PayFlow Protocol. Includes a wallet connection button/dropdown, descriptions of protocol features (Real-time Streams, Milestone Escrow, Soroban-Powered), and quick-access dashboard navigation links once the wallet is connected.

### 3. Admin Controls
* **File Path:** `apps/web/app/admin/page.tsx`
* **Route Path:** `/admin`
* **Description:** Represents a stub page intended for administrator capabilities, such as system factory configuration, role delegation, and multi-sig quorum rules. Currently displays a placeholder notification stating "Admin management module is pending implementation."

### 4. Escrow Dashboard
* **File Path:** `apps/web/app/escrow/page.tsx`
* **Route Path:** `/escrow`
* **Description:** Displays the user's active milestone escrows dashboard. It holds a hardcoded mock escrow array to simulate a list of contract funds and includes a "New Escrow" button that currently triggers an alert popup indicating it is pending implementation.

### 5. Escrow Detail Page
* **File Path:** `apps/web/app/escrow/[id]/page.tsx`
* **Route Path:** `/escrow/[id]`
* **Description:** Renders details for a specific escrow contract identifier. It loads the `useEscrow` hook, displays loading spinners or error messages, and renders the `EscrowPanel` component when data is resolved.

### 6. Streams Dashboard
* **File Path:** `apps/web/app/streams/page.tsx`
* **Route Path:** `/streams`
* **Description:** Renders the dashboard showing the active token streams. Provides filters for sorting streams by status (`All`, `Active`, `Paused`, `Cancelled`), loading skeletons, wallet connection call-to-actions, and lists all retrieved streams using `StreamCard`.

### 7. Stream Creation Page
* **File Path:** `apps/web/app/streams/create/page.tsx`
* **Route Path:** `/streams/create`
* **Description:** Houses the form page for establishing a new continuous payment stream. Implements a back navigation helper and embeds the `CreateStreamForm` multi-step wizard.

---

### Missing Expected Routes

* ⚠️ **/streams/[id]:** No page layout exists to view the detailed progress, logs, or history of an individual payment stream.
* ⚠️ **/escrow/create:** Currently, there is no dedicated route for configuring and launching escrows; clicking the button triggers an alert instead of navigating to a form.
* ⚠️ **/settings or custom dashboard:** There is no user profile or customizable dashboard route.
* ⚠️ **/docs or /about:** No documentation or static resource routes exist to guide users.

---

## SECTION 2: COMPONENT INVENTORY

This section details all components inside `apps/web/components/`.

### 1. `ClaimButton`
* **File Path:** `apps/web/components/ClaimButton.tsx`
* **Props:**
  ```typescript
  interface ClaimButtonProps {
    streamId: bigint;
    onSuccess?: () => void;
  }
  ```
* **Description:** A simple action button that connects to the wallet adapter and invokes the on-chain `claim` action to withdraw accrued stream balances.
* **States:** Manages a boolean `loading` state during contract signature/submission, and a string `error` state to display transaction execution issues.
* **Animation:** Uses CSS Lucide rotation spinner (`animate-spin`).

### 2. `CreateStreamForm`
* **File Path:** `apps/web/components/CreateStreamForm.tsx`
* **Props:** None (`{}`)
* **Description:** A multi-step form wizard that walks the user through creating a payment stream. Step 1 gathers recipient, asset ID, and total amount. Step 2 sets duration. Step 3 asks for validation and signing.
* **States:** Wizard step (`step`), `loading`, `error`, and `successTx` transaction hash which switches the UI to a successful completion card.
* **Animation:** Uses CSS animations (`animate-in fade-in`, `animate-bounce`, and custom transitions).

### 3. `ErrorBoundary`
* **File Path:** `apps/web/components/ErrorBoundary.tsx`
* **Props:**
  ```typescript
  interface Props {
    children?: ReactNode;
  }
  ```
* **Description:** A class component wrapping subtrees to catch runtime exceptions.
* **States:** React error state (`hasError` boolean).
* **Animation:** None.

### 4. `EscrowPanel`
* **File Path:** `apps/web/components/EscrowPanel.tsx`
* **Props:**
  ```typescript
  interface EscrowPanelProps {
    escrow: Escrow;
  }
  ```
* **Description:** Renders basic escrow identity details (contract ID, recipient address, total locked balance) and lists the associated milestones.
* **States:** Relies on its parent for loading and error states. Lists milestones.
* **Animation:** None.

### 5. `MilestoneCard`
* **File Path:** `apps/web/components/MilestoneCard.tsx`
* **Props:**
  ```typescript
  interface MilestoneCardProps {
    milestone: Milestone;
    milestoneIndex: number;
    escrowId: bigint;
    approvers: string[];
    connectedAddress: string | null;
  }
  ```
* **Description:** Represents a single milestone card displaying approval progress, USDC payout value, and an "Approve Milestone" button (disabled if the connected wallet is not a designated approver).
* **States:** Checks approval count, `isReleased`, and `isApprover` dynamically.
* **Animation:** CSS transition hover effects (`transition-all duration-300`).

### 6. `StreamCard`
* **File Path:** `apps/web/components/StreamCard.tsx`
* **Props:**
  ```typescript
  interface StreamCardProps {
    stream: Stream;
    onRefetch?: () => void;
  }
  ```
* **Description:** The centerpiece component showing stream details, dynamically updating accrued/claimable amounts in real-time. Displays progress bars and administrative actions (Pause, Resume, Cancel).
* **States:** Updates a local `now` timestamp every second via `setInterval` to drive live accrual calculations. Tracks local `loading` and `error` states for administrative execution.
* **Animation:** Hover scale transition (`duration-355 hover:scale-[1.01] hover:shadow-[...]`), loading spinner rotations, and progress bar width adjustments.

### 7. `WalletButton`
* **File Path:** `apps/web/components/WalletButton.tsx`
* **Props:** None (`{}`)
* **Description:** Displays connection status. Allows choosing between Freighter and LOBSTR extensions in a custom dropdown. Shows selected wallet status and public keys.
* **States:** Dropdown toggle state, local connection error state, and hook into global store states.
* **Animation:** Chevron rotation (`transition: transform 0.15s`), hover states, and spinner loading animation.

---

### Component Code Blocks

#### 1. `StreamCard` (`apps/web/components/StreamCard.tsx`)
```tsx
"use client";

import { useState, useEffect } from 'react';
import type { Stream } from '@payflow/sdk';
import ClaimButton from './ClaimButton';
import { useWalletStore } from '../lib/store/walletStore';
import { createPayFlowClient, getActiveWalletAdapter } from '../lib/stellar';
import { Loader2, Pause, Play, XOctagon } from 'lucide-react';

interface StreamCardProps {
  stream: Stream;
  onRefetch?: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  Active:    'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Paused:    'bg-amber-500/10  text-amber-300  border-amber-500/20',
  Cancelled: 'bg-rose-500/10   text-rose-300   border-rose-500/20',
  Completed: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
};

function calculateActiveDuration(now: number, stream: Stream): number {
  const startTime = Number(stream.startTime);
  const pausedAt = stream.pausedAt ? Number(stream.pausedAt) : null;
  const totalPausedDuration = Number(stream.totalPausedDuration);
  const endTime = Number(stream.endTime);

  if (now < startTime) {
    return 0;
  }

  let timePassed = now - startTime;
  if (pausedAt !== null) {
    timePassed = pausedAt - startTime;
  }

  const activeDuration = timePassed > totalPausedDuration ? timePassed - totalPausedDuration : 0;
  const totalDuration = endTime - startTime;

  return activeDuration > totalDuration ? totalDuration : activeDuration;
}

function calculateAccrued(now: number, stream: Stream): bigint {
  if (stream.status === 'Completed') {
    return stream.totalAmount;
  }
  if (stream.status === 'Cancelled') {
    return stream.claimedAmount;
  }

  const activeDuration = calculateActiveDuration(now, stream);
  const totalDuration = Number(stream.endTime) - Number(stream.startTime);

  if (totalDuration <= 0) {
    return stream.totalAmount;
  }

  if (activeDuration >= totalDuration) {
    return stream.totalAmount;
  }

  return (stream.totalAmount * BigInt(activeDuration)) / BigInt(totalDuration);
}

export default function StreamCard({ stream, onRefetch }: StreamCardProps) {
  const { publicKey, walletType } = useWalletStore();
  const [now, setNow] = useState<number>(Math.floor(Date.now() / 1000));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Run a real-time interval to update the accrued amount locally every second
  useEffect(() => {
    if (stream.status !== 'Active') {
      return;
    }
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [stream.status]);

  const accrued = calculateAccrued(now, stream);
  const claimable = accrued > stream.claimedAmount ? accrued - stream.claimedAmount : 0n;
  
  const totalNum = Number(stream.totalAmount);
  const progressPct = totalNum > 0 ? Math.min(100, Math.max(0, Math.round((Number(accrued) / totalNum) * 100))) : 0;

  const isOwner = publicKey !== null && (publicKey === stream.sender);
  const isRecipient = publicKey !== null && (publicKey === stream.recipient);

  const handlePause = async () => {
    setLoading(true);
    setError(null);
    try {
      const wallet = await getActiveWalletAdapter(walletType);
      const client = createPayFlowClient(wallet);
      await client.streams.pauseStream({ streamId: stream.id });
      if (onRefetch) onRefetch();
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    setLoading(true);
    setError(null);
    try {
      const wallet = await getActiveWalletAdapter(walletType);
      const client = createPayFlowClient(wallet);
      await client.streams.resumeStream({ streamId: stream.id });
      if (onRefetch) onRefetch();
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      const wallet = await getActiveWalletAdapter(walletType);
      const client = createPayFlowClient(wallet);
      await client.streams.cancelStream({ streamId: stream.id });
      if (onRefetch) onRefetch();
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass px-6 py-6 rounded-2xl flex flex-col justify-between min-h-[320px] w-full relative overflow-hidden transition-all duration-350 hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(20,241,149,0.05)] border border-white/5">
      <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-xxs uppercase tracking-wider font-bold text-dark-500">Recipient</p>
          <p className="font-mono text-xs text-teal-300 font-semibold">{truncate(stream.recipient)}</p>
        </div>
        <span className={`text-xxs px-2.5 py-1 rounded-full font-bold uppercase border ${STATUS_STYLES[stream.status] ?? STATUS_STYLES.Active}`}>
          {stream.status}
        </span>
      </div>

      {/* Main Stats */}
      <div className="my-4 space-y-3">
        <div>
          <p className="text-xxs text-dark-500 font-bold uppercase tracking-wider">Accrued / Total</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">
              {(Number(accrued) / 1e7).toFixed(4)}
            </span>
            <span className="text-xs text-dark-400">
              / {(Number(stream.totalAmount) / 1e7).toFixed(2)} {stream.token.slice(0, 6)}
            </span>
          </div>
        </div>

        <div className="flex justify-between border-t border-white/5 pt-2.5 text-xxs font-mono">
          <div>
            <span className="text-dark-500 block">CLAIMED</span>
            <span className="text-white">{(Number(stream.claimedAmount) / 1e7).toFixed(4)}</span>
          </div>
          <div className="text-right">
            <span className="text-dark-500 block">CLAIMABLE</span>
            <span className="text-emerald-400 font-bold">{(Number(claimable) / 1e7).toFixed(4)}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full mb-4">
        <div className="flex justify-between text-xxs text-dark-400 mb-1">
          <span>Streaming Progress</span>
          <span>{progressPct}%</span>
        </div>
        <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {error && (
        <p className="text-xxs text-rose-400 bg-rose-500/10 p-2 rounded mb-2 border border-rose-500/20 break-all">{error}</p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-auto">
        {loading ? (
          <div className="flex justify-center items-center py-2.5">
            <Loader2 size={18} className="animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Owner Actions */}
            {isOwner && (
              <div className="flex gap-2 w-full">
                {stream.status === 'Active' && (
                  <button
                    onClick={handlePause}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-dark-700 hover:bg-dark-600 text-white py-2 rounded-xl text-xs font-bold transition border border-white/10"
                  >
                    <Pause size={12} />
                    Pause
                  </button>
                )}
                {stream.status === 'Paused' && (
                  <button
                    onClick={handleResume}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 py-2 rounded-xl text-xs font-bold transition border border-emerald-500/20"
                  >
                    <Play size={12} />
                    Resume
                  </button>
                )}
                {(stream.status === 'Active' || stream.status === 'Paused') && (
                  <button
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-350 py-2 rounded-xl text-xs font-bold transition border border-rose-550/20"
                  >
                    <XOctagon size={12} />
                    Cancel
                  </button>
                )}
              </div>
            )}

            {/* Recipient Action */}
            {isRecipient && (stream.status === 'Active' || stream.status === 'Paused' || stream.status === 'Completed') && claimable > 0n && (
              <ClaimButton streamId={stream.id} onSuccess={onRefetch} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

#### 2. `WalletButton` (`apps/web/components/WalletButton.tsx`)
```tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useWalletStore } from '../lib/store/walletStore';
import { Wallet, LogOut, Loader2, ChevronDown, Check, AlertTriangle } from 'lucide-react';

export default function WalletButton() {
  const { publicKey, isConnected, isConnecting, walletType, connectionError, connect, disconnect } = useWalletStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (connectionError) {
      setLocalError(connectionError);
    }
  }, [connectionError]);

  const handleConnect = async (type: 'freighter' | 'lobstr') => {
    setDropdownOpen(false);
    setLocalError(null);
    try {
      await connect(type);
    } catch (err: any) {
      setLocalError(err?.message || String(err));
    }
  };

  if (isConnected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-dark-700/80 border border-dark-600 px-3 py-1.5 rounded-lg">
          <span style={{ height: '6px', width: '6px', borderRadius: '50%', background: '#10B981' }} />
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#6B7280' }}>
            {walletType === 'lobstr' ? 'LOBSTR' : 'Freighter'}
          </span>
          <span style={{ height: '12px', width: '1px', background: '#374151' }} />
          <span className="font-mono" style={{ fontSize: '12px', color: '#0D9488', fontWeight: 600 }}>
            {truncate(publicKey)}
          </span>
        </div>
        <button
          onClick={disconnect}
          style={{ cursor: 'pointer', padding: '8px', borderRadius: '8px', color: '#F43F5E', background: 'transparent', border: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          title="Disconnect wallet"
          aria-label="Disconnect wallet"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        id="wallet-connect-btn"
        type="button"
        onClick={() => { setLocalError(null); setDropdownOpen(!dropdownOpen); }}
        disabled={isConnecting}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#F0EEE9',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '10px',
          transition: 'border-color 0.15s, background 0.15s',
          opacity: isConnecting ? 0.5 : 1,
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'transparent'; }}
      >
        {isConnecting ? <Loader2 size={15} className="animate-spin" /> : <Wallet size={15} />}
        {isConnecting ? 'Connecting…' : 'Connect Wallet'}
        {!isConnecting && <ChevronDown size={13} style={{ transition: 'transform 0.15s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />}
      </button>

      {dropdownOpen && !isConnecting && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '8px',
            width: '220px',
            background: '#111827',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '6px',
            zIndex: 9999,
          }}
        >
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '8px 12px 4px' }}>Select Wallet</p>
          <button
            type="button"
            onClick={() => handleConnect('freighter')}
            style={{ cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', fontSize: '13px', fontWeight: 500, color: '#fff', background: 'transparent', border: 'none', borderRadius: '8px', textAlign: 'left' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ height: '8px', width: '8px', borderRadius: '50%', background: '#0D9488', flexShrink: 0 }} />
              <span>Freighter Wallet</span>
            </div>
            {walletType === 'freighter' && <Check size={12} style={{ color: '#0D9488' }} />}
          </button>
          <button
            type="button"
            onClick={() => handleConnect('lobstr')}
            style={{ cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', fontSize: '13px', fontWeight: 500, color: '#fff', background: 'transparent', border: 'none', borderRadius: '8px', textAlign: 'left' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ height: '8px', width: '8px', borderRadius: '50%', background: '#0D9488', flexShrink: 0 }} />
              <span>LOBSTR Wallet</span>
            </div>
            {walletType === 'lobstr' && <Check size={12} style={{ color: '#0D9488' }} />}
          </button>
        </div>
      )}

      {localError && !isConnecting && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '8px',
            width: '288px',
            background: 'rgba(76, 5, 25, 0.9)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            zIndex: 9999,
          }}
        >
          <AlertTriangle size={14} style={{ color: '#fb7185', marginTop: '2px', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '11px', color: '#fda4af', lineHeight: 1.4, wordBreak: 'break-word' }}>{localError}</p>
            <button
              onClick={() => setLocalError(null)}
              style={{ cursor: 'pointer', fontSize: '10px', color: '#fb7185', background: 'none', border: 'none', textDecoration: 'underline', marginTop: '4px', padding: 0 }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

#### 3. `CreateStreamForm` (`apps/web/components/CreateStreamForm.tsx`)
```tsx
"use client";

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useWalletStore } from '../lib/store/walletStore';
import { createPayFlowClient, getActiveWalletAdapter } from '../lib/stellar';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// ─── Zod schemas for each wizard step ────────────────────────────────────────

export const Step1Schema = z.object({
  recipient: z.string().min(56, 'Must be a valid Stellar address (G...)').max(56),
  asset:     z.string().min(56, 'Must be a valid asset contract address (C...)').max(56),
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTx, setSuccessTx] = useState<string | null>(null);

  const { publicKey, isConnected, connect, walletType } = useWalletStore();

  const form1 = useForm<Step1>({ resolver: zodResolver(Step1Schema) });
  const form2 = useForm<Step2>({ resolver: zodResolver(Step2Schema), defaultValues: { startNow: true } });
  const form3 = useForm<Step3>({ resolver: zodResolver(Step3Schema) });

  const onStep1 = form1.handleSubmit(() => setStep(2));
  const onStep2 = form2.handleSubmit(() => setStep(3));
  
  const onStep3 = form3.handleSubmit(async () => {
    if (!isConnected || !publicKey) {
      setError('Please connect your wallet first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const wallet = await getActiveWalletAdapter(walletType);
      const client = createPayFlowClient(wallet);

      const val1 = form1.getValues();
      const val2 = form2.getValues();

      // Standard Stellar token decimals is 7.
      const totalAmount = BigInt(Math.round(val1.amount * 10000000));
      const durationSeconds = BigInt(val2.durationDays * 24 * 60 * 60);

      const txHash = await client.streams.createStream({
        sender: publicKey,
        recipient: val1.recipient,
        token: val1.asset,
        totalAmount,
        durationSeconds,
      });

      setSuccessTx(txHash);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  });

  const resetForm = () => {
    form1.reset();
    form2.reset();
    form3.reset();
    setSuccessTx(null);
    setError(null);
    setStep(1);
  };

  if (successTx) {
    return (
      <div className="glass p-8 rounded-2xl border border-emerald-500/30 max-w-lg w-full text-center space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-center">
          <CheckCircle2 size={64} className="text-emerald-400 animate-bounce" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white">Stream Created!</h3>
          <p className="text-sm text-dark-300 mt-2">
            Your real-time token stream has been successfully established on-chain.
          </p>
        </div>

        <div className="bg-dark-800/80 border border-white/5 rounded-xl p-4 text-left space-y-3 font-mono text-xs text-dark-300">
          <div>
            <span className="text-dark-500 block">RECIPIENT</span>
            <span className="text-teal-300 break-all">{form1.getValues('recipient')}</span>
          </div>
          <div>
            <span className="text-dark-500 block">ASSET CONTRACT</span>
            <span className="text-purple-300 break-all">{form1.getValues('asset')}</span>
          </div>
          <div className="flex justify-between">
            <div>
              <span className="text-dark-500 block">AMOUNT</span>
              <span className="text-white font-bold">{form1.getValues('amount')} tokens</span>
            </div>
            <div>
              <span className="text-dark-500 block">DURATION</span>
              <span className="text-white font-bold">{form2.getValues('durationDays')} days</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${successTx}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-dark-700 hover:bg-dark-600 border border-white/10 text-white py-3 rounded-xl text-sm font-semibold transition"
          >
            View on Stellar Expert
            <ExternalLink size={14} />
          </a>
          <div className="flex gap-3">
            <button
              onClick={resetForm}
              className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition"
            >
              Create Another
            </button>
            <Link
              href="/streams"
              className="flex-1 flex items-center justify-center bg-dark-800 hover:bg-dark-750 text-white py-3 rounded-xl text-sm font-semibold border border-white/5 transition"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-8 rounded-2xl border border-white/5 max-w-lg w-full relative">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8 px-2">
        {([1, 2, 3] as const).map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${step === s ? 'border-primary bg-primary/20 text-primary shadow-[0_0_15px_rgba(20,241,149,0.3)]' : step > s ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300' : 'border-white/10 bg-white/5 text-dark-500'}`}>
              {s}
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 min-w-[40px] transition-all duration-300 ${step > s ? 'bg-emerald-500' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex gap-3 text-rose-400 text-sm animate-in slide-in-from-top-2 duration-250">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p className="break-all">{error}</p>
        </div>
      )}

      {/* Step 1: Recipient, Asset, Amount */}
      {step === 1 && (
        <form onSubmit={onStep1} className="space-y-5 animate-in fade-in duration-300">
          <div>
            <h3 className="text-xl font-bold text-white">Recipient & Asset</h3>
            <p className="text-xs text-dark-400 mt-1">Configure the destination address and the asset you want to stream.</p>
          </div>

          <div>
            <label className="text-xs text-dark-400 font-bold uppercase tracking-wider">Recipient Address</label>
            <input
              id="stream-recipient"
              type="text"
              {...form1.register('recipient')}
              placeholder="e.g. GB..."
              className="w-full mt-1.5 bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-dark-600 focus:outline-none focus:border-primary transition"
            />
            {form1.formState.errors.recipient && <p className="text-xs text-rose-400 mt-1.5">{form1.formState.errors.recipient.message}</p>}
          </div>

          <div>
            <label className="text-xs text-dark-400 font-bold uppercase tracking-wider">Asset Contract ID</label>
            <input
              id="stream-asset"
              type="text"
              {...form1.register('asset')}
              placeholder="e.g. CC..."
              className="w-full mt-1.5 bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-dark-600 focus:outline-none focus:border-primary transition"
            />
            {form1.formState.errors.asset && <p className="text-xs text-rose-400 mt-1.5">{form1.formState.errors.asset.message}</p>}
          </div>

          <div>
            <label className="text-xs text-dark-400 font-bold uppercase tracking-wider">Total Amount</label>
            <input
              id="stream-amount"
              type="number"
              step="any"
              {...form1.register('amount', { valueAsNumber: true })}
              placeholder="0.0"
              className="w-full mt-1.5 bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-dark-600 focus:outline-none focus:border-primary transition"
            />
            {form1.formState.errors.amount && <p className="text-xs text-rose-400 mt-1.5">{form1.formState.errors.amount.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-purple text-white py-3.5 rounded-xl text-sm font-semibold transition mt-6"
          >
            Next Step
            <ArrowRight size={16} />
          </button>
        </form>
      )}

      {/* Step 2: Duration */}
      {step === 2 && (
        <form onSubmit={onStep2} className="space-y-5 animate-in fade-in duration-300">
          <div>
            <h3 className="text-xl font-bold text-white">Streaming Duration</h3>
            <p className="text-xs text-dark-400 mt-1">Specify how long the tokens will be streamed continuously.</p>
          </div>

          <div>
            <label className="text-xs text-dark-400 font-bold uppercase tracking-wider">Duration (days)</label>
            <input
              id="stream-duration"
              type="number"
              {...form2.register('durationDays', { valueAsNumber: true })}
              placeholder="30"
              className="w-full mt-1.5 bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-dark-600 focus:outline-none focus:border-primary transition"
            />
            {form2.formState.errors.durationDays && <p className="text-xs text-rose-400 mt-1.5">{form2.formState.errors.durationDays.message}</p>}
          </div>

          <div className="bg-dark-800/40 border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <input
              id="stream-start-now"
              type="checkbox"
              {...form2.register('startNow')}
              className="h-4 w-4 rounded border-white/10 bg-dark-800 text-primary focus:ring-primary focus:ring-offset-dark-900"
            />
            <div>
              <label htmlFor="stream-start-now" className="text-sm font-medium text-white cursor-pointer select-none">
                Start immediately
              </label>
              <p className="text-xxs text-dark-500">The stream will begin accruing tokens as soon as the transaction is confirmed.</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-3.5 rounded-xl text-sm font-semibold transition"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-purple text-white py-3.5 rounded-xl text-sm font-semibold transition"
            >
              Next Step
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <form onSubmit={onStep3} className="space-y-5 animate-in fade-in duration-300">
          <div>
            <h3 className="text-xl font-bold text-white">Review & Confirm</h3>
            <p className="text-xs text-dark-400 mt-1">Review the streaming configuration and sign the transaction with Freighter.</p>
          </div>

          <div className="bg-dark-800/80 border border-white/5 rounded-xl p-4 space-y-3 font-mono text-xs text-dark-300">
            <div className="flex justify-between">
              <span className="text-dark-500">SENDER (YOU)</span>
              <span className="text-white text-right break-all max-w-[70%]">{publicKey ? `${publicKey.slice(0, 10)}...${publicKey.slice(-10)}` : 'Not Connected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500">RECIPIENT</span>
              <span className="text-teal-300 text-right break-all max-w-[70%]">{form1.getValues('recipient')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500">ASSET CONTRACT</span>
              <span className="text-purple-300 text-right break-all max-w-[70%]">{form1.getValues('asset')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500">TOTAL AMOUNT</span>
              <span className="text-white font-bold">{form1.getValues('amount')} tokens</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500">DURATION</span>
              <span className="text-white font-bold">{form2.getValues('durationDays')} days</span>
            </div>
          </div>

          <div className="bg-dark-800/40 border border-white/5 rounded-xl p-4 flex items-start gap-3">
            <input
              id="stream-confirm"
              type="checkbox"
              {...form3.register('confirmation')}
              className="h-4 w-4 rounded border-white/10 bg-dark-800 text-primary focus:ring-primary focus:ring-offset-dark-900 mt-0.5"
            />
            <div>
              <label htmlFor="stream-confirm" className="text-sm font-medium text-white cursor-pointer select-none">
                I confirm the stream details are correct
              </label>
              <p className="text-xxs text-dark-500">This action requires a signature and will lock tokens in the vault.</p>
            </div>
          </div>
          {form3.formState.errors.confirmation && <p className="text-xs text-rose-400">{form3.formState.errors.confirmation.message}</p>}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={loading}
              className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-3.5 rounded-xl text-sm font-semibold transition disabled:opacity-55"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-purple text-white py-3.5 rounded-xl text-sm font-semibold transition disabled:opacity-55"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                'Sign & Create'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
```

#### 4. `EscrowPanel` (`apps/web/components/EscrowPanel.tsx`)
```tsx
"use client";

// TODO(issue): #M3 — Implement full escrow management panel
import type { Escrow } from '@payflow/sdk';
import MilestoneCard from './MilestoneCard';
import { useWalletStore } from '../lib/store/walletStore';

interface EscrowPanelProps {
  escrow: Escrow;
}

export default function EscrowPanel({ escrow }: EscrowPanelProps) {
  const { publicKey } = useWalletStore();

  const releasedCount = escrow.milestones.filter((m) => m.status === 'Released').length;

  return (
    <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
      {/* Escrow summary */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-dark-600 font-semibold uppercase mb-0.5">Escrow #{String(escrow.id)}</p>
          <p className="text-sm font-mono text-teal-300">{escrow.recipient.slice(0, 8)}…{escrow.recipient.slice(-4)}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-white">{(Number(escrow.totalAmount) / 1e7).toFixed(2)}</p>
          <p className="text-xs text-dark-600">Milestones: {releasedCount}/{escrow.milestones.length} released</p>
        </div>
      </div>

      {/* Milestone cards */}
      <div className="grid gap-4">
        {escrow.milestones.map((milestone, idx) => (
          <MilestoneCard
            key={idx}
            milestone={milestone}
            milestoneIndex={idx}
            escrowId={escrow.id}
            approvers={escrow.approvers}
            connectedAddress={publicKey}
          />
        ))}
      </div>
    </div>
  );
}
```

#### 5. Root Layout Navigation Header (Inlined inside route pages)
> [!NOTE]
> PayFlow does not currently utilize a shared Navbar, Header, or layout navigation component from the `components/` directory. Instead, the layout navigation header is duplicate-implemented directly within page routes. The following code demonstrates this shared structure as defined in `/apps/web/app/page.tsx`:

```tsx
      {/* Navbar example from apps/web/app/page.tsx */}
      <header className="w-full glass py-4 px-6 md:px-12 flex justify-between items-center border-b border-white/5" style={{ position: 'relative', zIndex: 20 }}>
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center font-bold text-white text-lg">
            P
          </div>
          <span style={{ fontSize: '18px', letterSpacing: '-0.02em', fontWeight: 700, color: '#F0EEE9' }}>
            PayFlow
          </span>
        </div>
        <WalletButton />
      </header>
```

---

## SECTION 3: DESIGN SYSTEM SNAPSHOT

### 1. Style Assets

#### `tailwind.config.ts` Contents:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#0D9488", // Teal
          dark: "#0F766E",
          light: "#2DD4BF"
        },
        dark: {
          900: "#090D16", // Rich space black
          800: "#111827",
          700: "#1F2937",
          600: "#374151"
        },
        accent: {
          DEFAULT: "#8B5CF6", // Violet
          amber: "#F59E0B",
          emerald: "#10B981",
          rose: "#F43F5E",
          purple: "#A78BFA"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
```

#### `app/globals.css` Contents:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #090d16;
  --foreground: #f3f4f6;
}

body {
  color: var(--foreground);
  background-color: var(--background);
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}

/* Glassmorphism utility */
.glass {
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-hover:hover {
  background: rgba(31, 41, 55, 0.8);
  border-color: rgba(255, 255, 255, 0.15);
}
```

### 2. Core Tokens & Infrastructure Summary

| Property | Value(s) / Description |
| :--- | :--- |
| **Primary Brand Colors** | `#0D9488` (Teal), `#0F766E` (Dark Teal), `#2DD4BF` (Light Teal), `#8B5CF6` (Violet Accent), Space Black background (`#090D16`). |
| **Font Families** | `Inter`, `sans-serif` (loaded globally in root layout from Google Fonts, custom CSS variable fallback). |
| **Dark Mode Implementation** | Fixed application-wide dark-theme design. The base canvas defaults to Space Black background (`#090d16`) with contrasting slate-grey text (`#f3f4f6`) and transparent dark-card structures (`rgba(17,24,39,0.7)`). |
| **Component Libraries** | ❌ **No UI components library** (such as Radix, Headless UI, or shadcn/ui) is loaded in package dependencies. Forms and dropdown wrappers are engineered from scratch.<br>❌ **No Framer Motion** (for advanced canvas animations) is currently configured. |

---

## SECTION 4: STATE & DATA LAYER

### 1. `lib/stellar.ts`
* **Purpose:** Acts as the network orchestrator and client factory. Contains endpoint hosts for Testnet and Mainnet RPC gateways (gateway.fm and validationcloud.io) and houses contract ID variables loaded via environment variables (`NEXT_PUBLIC_STREAM_VAULT_CONTRACT_ID`, etc.). Exposes helper methods `createPayFlowClient` and `getActiveWalletAdapter` to dynamically resolve transactions.
* **Status:** ✅ Fully operational helper file.

### 2. `lib/store/walletStore.ts`
* **Purpose:** Implements a global Zustand store managing the active wallet state. Holds state indicators `publicKey`, `isConnected`, `network`, `isConnecting`, `walletType` (Freighter or LOBSTR), and `connectionError`. Defines a connect wrapper utilizing a race timeout to protect against stuck wallet processes.
* **Status:** ✅ Fully functional for connection, status checking, and credentials retrieval.

### 3. `lib/hooks/useStream.ts`
* **Purpose:** Contains React hooks (`useStream` and `useStreams`) to read stream state from the Stellar blockchain. Instantiates the Freighter wallet adapter and queries the `StreamClient` to fetch individual stream profiles or the list of stream IDs associated with a specific sender address. Polling intervals are wired (every 5 seconds for `useStream` and 10 seconds for `useStreams`) to fetch updates.
* **Status:** ✅ Fully implemented integration fetching live smart-contract parameters.

### 4. `lib/hooks/useEscrow.ts`
* **Purpose:** Designed to expose details of specific Escrow contracts.
* **Status:** ⚠️ **Stubbed placeholder**. Currently returns a mock interface: `{ escrow: null, isLoading: false, error: null, refetch: () => {} }`. The indexer fetching logic remains to be built (see comment: `// TODO(issue): #M3 — Fetch escrow from Indexer REST API GET /escrows/:id`).

---

## SECTION 5: SDK SURFACE AREA

This section reviews the API surface of the custom `@payflow/sdk` library exported by `packages/sdk/src/index.ts` and defined in `stream.ts` / `escrow.ts`.

### 1. Entry Point (`packages/sdk/src/index.ts`)
```typescript
import type { PayFlowConfig } from './types.js';
import { StreamClient } from './stream.js';
import { EscrowClient } from './escrow.js';
import { FactoryClient } from './factory.js';

export * from './types.js';
export { StreamClient } from './stream.js';
export { EscrowClient } from './escrow.js';
export { FactoryClient } from './factory.js';
export { FreighterWalletAdapter } from './wallet/freighter.js';
export { LobstrWalletAdapter } from './wallet/lobstr.js';
export { AxelarBridgeAdapter } from './bridge/axelar.js';
export { PathPaymentRouter } from './payments/path-payment.js';

export class PayFlowClient {
  public readonly streams: StreamClient;
  public readonly escrow: EscrowClient;
  public readonly factory: FactoryClient;

  constructor(config: PayFlowConfig) {
    this.streams = new StreamClient(config);
    this.escrow = new EscrowClient(config);
    this.factory = new FactoryClient(config);
  }
}
```

### 2. StreamClient Surface (`packages/sdk/src/stream.ts`)
All SDK methods below interact directly with the smart contract via simulated Soroban transactions:

* **`createStream(params: CreateStreamParams): Promise<string>`**
  * *Description:* Submits a `create_stream` call to lock the specified token amount for streaming.
  * *Status:* ✅ Fully implemented.
* **`claimableAmount(streamId: bigint): Promise<bigint>`**
  * *Description:* Queries simulation to read current uncollected drip balance.
  * *Status:* ✅ Fully implemented.
* **`claim(params: ClaimParams): Promise<string>`**
  * *Description:* Submits a `claim` transaction to transfer claimable tokens to recipient.
  * *Status:* ✅ Fully implemented.
* **`cancelStream(params: CancelStreamParams): Promise<string>`**
  * *Description:* Invokes `cancel_stream` to return unaccrued tokens to sender.
  * *Status:* ✅ Fully implemented.
* **`pauseStream(params: PauseStreamParams): Promise<string>`**
  * *Description:* Halts continuous stream accumulation.
  * *Status:* ✅ Fully implemented.
* **`resumeStream(params: ResumeStreamParams): Promise<string>`**
  * *Description:* Unpauses and resumes stream accumulation.
  * *Status:* ✅ Fully implemented.
* **`getStream(streamId: bigint): Promise<Stream>`**
  * *Description:* Retrieves detailed structure properties from on-chain contract state.
  * *Status:* ✅ Fully implemented.
* **`getStreamsBySender(sender: string): Promise<bigint[]>`**
  * *Description:* Resolves all stream IDs associated with a specific sender.
  * *Status:* ✅ Fully implemented.

### 3. EscrowClient Surface (`packages/sdk/src/escrow.ts`)
* **`createEscrow(params: CreateEscrowParams): Promise<string>`**
  * *Status:* ⚠️ Stub/Not implemented (throws "not implemented — see issue #H4").
* **`approveMilestone(params: ApproveMilestoneParams): Promise<string>`**
  * *Status:* ⚠️ Stub/Not implemented (throws "not implemented — see issue #H4").
* **`releaseMilestone(params: ReleaseMilestoneParams): Promise<string>`**
  * *Status:* ⚠️ Stub/Not implemented (throws "not implemented — see issue #H4").
* **`cancelEscrow(params: CancelEscrowParams): Promise<string>`**
  * *Status:* ⚠️ Stub/Not implemented (throws "not implemented — see issue #H4").
* **`getEscrow(escrowId: bigint): Promise<Escrow>`**
  * *Status:* ⚠️ Stub/Not implemented (throws "not implemented — see issue #H4").
* **`getMilestone(escrowId: bigint, milestoneIndex: number): Promise<Milestone>`**
  * *Status:* ⚠️ Stub/Not implemented (throws "not implemented — see issue #H4").

---

## SECTION 6: WALLET INTEGRATION STATUS

### 1. Integration Scope
PayFlow connects natively to browser extension wallets without utilizing an aggregation layer like the Stellar Wallets Kit. The connection relies directly on the following packages:
* **Freighter:** `@stellar/freighter-api` (v2 features like `isConnected` and `requestAccess`).
* **LOBSTR:** `@lobstrco/signer-extension-api` (using `getPublicKey` and signature requests).

### 2. Connection Logic (`useWalletStore.ts`)
The connection routine is implemented inside the Zustand wallet store:

```typescript
  connect: async (type = 'freighter') => {
    set({ isConnecting: true, connectionError: null });
    try {
      if (type === 'freighter') {
        // ── Freighter flow ──────────────────────────────────────────
        const freighterApi = await import('@stellar/freighter-api');

        // CRITICAL: Freighter v2 isConnected() returns the window.freighter
        // object (truthy!) when installed, or { isConnected: false } when not.
        // We must coerce properly.
        const connResult = await withTimeout(freighterApi.isConnected(), 3000, 'Freighter isConnected');
        const isInstalled = typeof connResult === 'boolean'
          ? connResult
          : !!(connResult && (connResult as any).isConnected !== false);

        if (!isInstalled) {
          throw new Error(
            'Freighter extension not detected. Please install it from freighter.app and reload.'
          );
        }

        // requestAccess() triggers the Freighter popup for authorization
        // and returns the public key string on success.
        const accessResult = await withTimeout(freighterApi.requestAccess(), 30000, 'Freighter requestAccess');

        // v2 may return { address: string } or a plain string depending on version
        const publicKey = typeof accessResult === 'string'
          ? accessResult
          : (accessResult as any)?.address || (accessResult as any)?.publicKey || '';

        if (!publicKey) {
          throw new Error('Freighter authorization was rejected or the wallet is locked.');
        }

        set({ publicKey, isConnected: true, isConnecting: false, walletType: 'freighter', connectionError: null });

      } else {
        // ── LOBSTR flow ─────────────────────────────────────────────
        const lobstrApi = await import('@lobstrco/signer-extension-api');

        const connResult = await withTimeout(lobstrApi.isConnected(), 3000, 'LOBSTR isConnected');
        const isInstalled = typeof connResult === 'boolean'
          ? connResult
          : !!(connResult && (connResult as any).isConnected !== false);

        if (!isInstalled) {
          throw new Error(
            'LOBSTR Signer extension not detected. Please install it from the Chrome Web Store and reload.'
          );
        }

        // getPublicKey() triggers the LOBSTR popup for authorization.
        const publicKey = await withTimeout(lobstrApi.getPublicKey(), 30000, 'LOBSTR getPublicKey');

        if (!publicKey) {
          throw new Error('LOBSTR authorization was rejected or the wallet is locked.');
        }

        set({ publicKey, isConnected: true, isConnecting: false, walletType: 'lobstr', connectionError: null });
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error(`[WalletStore] Connection failed (${type}):`, msg);
      set({ isConnecting: false, connectionError: msg });
      throw err;
    }
  },
```

---

## SECTION 7: GAPS & ROUGH EDGES

This self-assessment identifies critical technical and visual gaps that should be addressed in subsequent design and feature expansions:

1. **Stubbed Escrow Infrastructure:**
   * The `useEscrow` hook does not fetch actual data and only returns static null values.
   * `EscrowClient` methods are stubs that throw "not implemented" errors. As a result, the admin dashboard only displays mock cards and actions like "Approve Milestone" cannot submit transactions on-chain.
2. **Duplicated Layout Header/Navbar:**
   * A shared Navbar or Header component does not exist in `components/`. The header layout is copy-pasted inline within individual pages (`page.tsx`, `streams/page.tsx`, etc.), which increases technical debt and leads to design inconsistencies.
3. **No Interactive Component Library:**
   * Key dApp patterns (such as modals, wizard forms, search dropdowns, and alert banners) are implemented using custom inline states and raw Tailwind classes. Integrating a dedicated component library (such as Radix UI, Headless UI, or shadcn/ui) would improve accessibility and interface polish.
4. **No Global Notification / Toast System:**
   * Errors and transaction statuses are printed inside the forms as static text elements. Users must scroll to view transaction feedback, and there is no persistent toast notification feedback.
5. **No Framer Motion or Micro-Animations:**
   * Transitions are limited to standard CSS hover styles. Incorporating Framer Motion would allow for smooth route-level entry animations, accordion-style milestone expansions, and progress bar updates.
6. **Incomplete Responsive Mobile Adaptations:**
   * The application uses hardcoded layout elements that do not dynamically scale down to smaller screens, posing layout breaking risks on mobile viewports.
7. **Missing Detail Views:**
   * Individual stream pages (e.g. `/streams/[id]`) are missing. Users cannot copy individual stream links or view transaction logs.

---

## SECTION 8: PACKAGE VERSIONS

#### Web Application `package.json` Contents (`apps/web/package.json`):
```json
{
  "name": "payflow-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "@lobstrco/signer-extension-api": "^2.0.0",
    "@payflow/sdk": "workspace:*",
    "@stellar/freighter-api": "^2.0.0",
    "@stellar/stellar-sdk": "^11.3.0",
    "lucide-react": "^0.363.0",
    "next": "14.2.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.51.2",
    "zod": "^3.22.4",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@types/node": "^20.11.30",
    "@types/react": "^18.2.67",
    "@types/react-dom": "^18.2.22",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3"
  }
}
```
