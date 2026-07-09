'use client';

import React from 'react';
import Link from 'next/link';
import { useWalletStore } from '../../lib/store/walletStore';
import { ShieldAlert, ArrowRight, Plus } from 'lucide-react';
import { Escrow } from '@payflow/sdk';
import EscrowSandbox from '../../components/EscrowSandbox';

export default function EscrowDashboard() {
  const { publicKey } = useWalletStore();

  // TODO(issue): #M3 — Connect to indexer REST API `GET /escrows?sender={publicKey}` to load active escrows list.
  // Mock escrows list:
  const mockEscrows: Escrow[] = [
    {
      id: 101n,
      sender: publicKey || 'GBX...',
      recipient: 'GDYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      token: 'USDC',
      totalAmount: 5000000000n, // 500 USDC
      threshold: 2,
      approvers: ['GBA...', 'GBB...', 'GBC...'],
      status: 'Active',
      milestones: [
        { title: 'Design Sign-off', amount: 2000000000n, approvalCount: 2, status: 'Released' },
        { title: 'Smart Contract Audit', amount: 3000000000n, approvalCount: 1, status: 'Pending' },
      ],
    },
  ];

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-[calc(100vh-160px)] bg-dark-900 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto px-6 py-12 flex-grow space-y-8 z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Milestone Escrows</h2>
            <p className="text-xs text-dark-500">
              Secure funds held in smart contracts and release on milestone approvals
            </p>
          </div>
          <Link
            href="/escrow/create"
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.02]"
          >
            <Plus size={16} />
            New Escrow
          </Link>
        </div>

        {/* Escrow Cards List */}
        {mockEscrows.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">
            {mockEscrows.map((escrow) => {
              const released = escrow.milestones
                .filter((m) => m.status === 'Released')
                .reduce((sum: bigint, m) => sum + m.amount, 0n);
              const progress = Number((released * 100n) / escrow.totalAmount);
              return (
                <div
                  key={escrow.id.toString()}
                  className="glass p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-64 hover:scale-[1.01] transition duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-primary font-bold uppercase tracking-wider">
                        Escrow Account
                      </span>
                      <h3 className="text-xl font-bold text-white mt-1">
                        Escrow #{escrow.id.toString()}
                      </h3>
                    </div>
                    <span className="text-2xl font-black text-white">
                      {Number(escrow.totalAmount) / 10 ** 7}{' '}
                      <span className="text-xs text-dark-600">USDC</span>
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-dark-600">
                      <span>Released: {Number(released) / 10 ** 7} USDC</span>
                      <span>{progress}% Completed</span>
                    </div>
                    <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-xs text-dark-600">
                      Recipient:{' '}
                      <span className="font-mono text-teal-300">{truncate(escrow.recipient)}</span>
                    </span>
                    <Link
                      href={`/escrow/${escrow.id.toString()}`}
                      className="flex items-center gap-1.5 text-xs text-teal-300 font-bold hover:text-white transition"
                    >
                      Manage Milestones
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass p-12 rounded-2xl text-center border border-white/5">
            <ShieldAlert className="mx-auto text-dark-600 mb-4" size={40} />
            <h3 className="text-lg font-bold mb-1">No Escrows Found</h3>
            <p className="text-xs text-dark-600">
              You haven&apos;t setup any milestone escrows yet.
            </p>
          </div>
        )}

        <div className="pt-8">
          <EscrowSandbox />
        </div>
      </main>
    </div>
  );
}
