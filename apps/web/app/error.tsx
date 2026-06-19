"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[PayFlow Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="absolute top-1/4 right-1/4 h-64 w-64 bg-accent-rose/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="glass px-10 py-12 rounded-2xl border border-accent-rose/20 space-y-6 max-w-md z-10">
        <div className="h-16 w-16 rounded-full bg-accent-rose/20 border border-accent-rose/40 flex items-center justify-center mx-auto">
          <AlertTriangle className="text-accent-rose" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
        <p className="text-sm text-dark-500">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-5 py-3 rounded-xl font-semibold transition duration-200 shadow-lg shadow-primary/20"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="flex-1 glass glass-hover text-white px-5 py-3 rounded-xl font-semibold transition duration-200 text-center"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
