import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-6 px-6 text-center">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 h-64 w-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="glass px-10 py-12 rounded-2xl border border-white/5 space-y-6 max-w-md z-10 flex flex-col items-center">
        <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-dark-800 border border-white/5 flex items-center justify-center shadow-md">
          <Image
            src="/icon.png"
            alt="PayFlow Logo"
            fill
            className="object-cover"
          />
        </div>
        <div className="text-7xl font-black text-primary">
          404
        </div>
        <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
        <p className="text-sm text-dark-500">
          This stream has already been fully claimed — or this page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-primary/20"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
