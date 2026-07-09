'use client';

import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';

// TODO(issue): #M4 — Build admin and multi-sig management panel
export default function AdminPage() {
  return (
    <div className="min-h-screen bg-dark-900 text-white flex flex-col justify-between p-6">
      <main className="max-w-xl mx-auto space-y-6 pt-12">
        <h1 className="text-3xl font-extrabold">Admin Controls</h1>
        <p className="text-sm text-dark-600">
          Manage system factories, delegate roles, and configure multi-sig quorum rules.
        </p>
        <div className="glass p-6 rounded-2xl border border-white/5">
          <p className="text-xs text-amber-400">
            Admin management module is pending implementation.
          </p>
        </div>
        <Link href="/" className="inline-block text-xs text-primary-light hover:underline">
          ← Back Home
        </Link>
      </main>
    </div>
  );
}
