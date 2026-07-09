'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEscrow } from '../../../lib/hooks/useEscrow';
import EscrowPanel from '../../../components/EscrowPanel';
import { ArrowLeft } from 'lucide-react';
import Skeleton from '../../../components/ui/Skeleton';

export default function EscrowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { escrow, isLoading, error } = useEscrow(BigInt(id ?? 0));

  return (
    <div className="min-h-[calc(100vh-160px)] bg-dark-900 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto px-6 py-12 flex-grow space-y-6 z-10 flex flex-col justify-center">
        <Link
          href="/escrow"
          className="flex items-center gap-1.5 text-xs text-dark-600 hover:text-white transition self-start font-bold mb-4"
        >
          <ArrowLeft size={14} />
          Back to Escrows
        </Link>

        {isLoading && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-40" />
              </div>
              <div className="space-y-2 text-right">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          </div>
        )}

        {error && (
          <div className="glass p-8 rounded-2xl text-center border border-accent-rose/20 text-accent-rose">
            <h3 className="text-lg font-bold mb-1">Failed to Load Escrow</h3>
            <p className="text-xs">{error}</p>
          </div>
        )}

        {!isLoading && !error && escrow && <EscrowPanel escrow={escrow} />}
      </main>
    </div>
  );
}
