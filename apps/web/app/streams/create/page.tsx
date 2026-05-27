"use client";

import React from 'react';
import Link from 'next/link';
import CreateStreamForm from '../../../components/CreateStreamForm.js';
import WalletButton from '../../../components/WalletButton.js';
import { ArrowLeft, Home } from 'lucide-react';

export default function CreateStreamPage() {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full glass py-4 px-6 md:px-12 flex justify-between items-center border-b border-white/5 z-10">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-teal-300 transition">
            <Home size={18} />
            <span className="font-bold tracking-wider hidden md:inline">PayFlow</span>
          </Link>
          <div className="h-4 w-[1px] bg-dark-700 hidden md:block" />
          <nav className="flex gap-4 text-sm font-semibold">
            <Link href="/streams" className="text-primary-light font-bold">Streams</Link>
            <Link href="/escrow" className="text-dark-600 hover:text-white transition">Escrows</Link>
          </nav>
        </div>
        <WalletButton />
      </header>

      {/* Main Container */}
      <main className="max-w-md w-full mx-auto px-6 py-12 flex-grow flex flex-col justify-center space-y-6 z-10">
        <Link
          href="/streams"
          className="flex items-center gap-1.5 text-xs text-dark-600 hover:text-white transition self-start font-bold"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
        <CreateStreamForm />
      </main>

      <footer className="w-full glass py-6 text-center border-t border-white/5 text-xs text-dark-600 z-10">
        &copy; {new Date().getFullYear()} PayFlow Protocol.
      </footer>
    </div>
  );
}
