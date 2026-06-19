"use client";

import Image from 'next/image';

export default function Loading() {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-4">
      <div className="relative h-16 w-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
        <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-dark-800 border border-white/5 flex items-center justify-center shadow-md">
          <Image
            src="/icon.png"
            alt="PayFlow Logo"
            fill
            className="object-cover"
          />
        </div>
      </div>
      <p className="text-sm text-dark-650 font-medium tracking-wider animate-pulse">
        Loading PayFlow...
      </p>
    </div>
  );
}
