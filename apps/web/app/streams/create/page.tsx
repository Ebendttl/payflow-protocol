"use client";

import React from 'react';
import Link from 'next/link';
import CreateStreamForm from '../../../components/CreateStreamForm';
import { ArrowLeft } from 'lucide-react';

export default function CreateStreamPage() {
  return (
    <div className="min-h-[calc(100vh-160px)] bg-dark-900 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

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
    </div>
  );
}

