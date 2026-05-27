export default function EscrowLoading() {
  return (
    <div className="min-h-screen bg-dark-900 px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-56 bg-dark-700 rounded-lg animate-pulse" />
            <div className="h-3 w-80 bg-dark-700/60 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-dark-700 rounded-xl animate-pulse" />
        </div>

        {/* Escrow card skeletons */}
        <div className="grid md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="glass h-64 rounded-2xl border border-white/5 p-6 space-y-4 animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-dark-700/60 rounded" />
                  <div className="h-6 w-36 bg-dark-700 rounded" />
                </div>
                <div className="h-8 w-24 bg-dark-700 rounded" />
              </div>
              <div className="space-y-2 mt-auto">
                <div className="flex justify-between">
                  <div className="h-3 w-32 bg-dark-700/60 rounded" />
                  <div className="h-3 w-16 bg-dark-700/60 rounded" />
                </div>
                <div className="h-2 w-full bg-dark-700 rounded-full" />
              </div>
              <div className="flex justify-between pt-2 border-t border-white/5">
                <div className="h-3 w-40 bg-dark-700/60 rounded" />
                <div className="h-3 w-28 bg-dark-700/60 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
