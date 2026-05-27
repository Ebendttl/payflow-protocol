"use client";

export default function Loading() {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-4">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
      </div>
      <p className="text-sm text-dark-600 font-medium tracking-wider animate-pulse">
        Loading PayFlow...
      </p>
    </div>
  );
}
