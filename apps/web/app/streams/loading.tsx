export default function StreamsLoading() {
  return (
    <div className="min-h-screen bg-dark-900 px-6 py-12">
      {/* Header skeleton */}
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-dark-700 rounded-md animate-pulse" />
            <div className="h-3 w-72 bg-dark-700/60 rounded-md animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-dark-700 rounded-xl animate-pulse" />
        </div>

        {/* Filter skeleton */}
        <div className="flex gap-2 pb-4 border-b border-white/5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-20 bg-dark-700 rounded-xl animate-pulse" />
          ))}
        </div>

        {/* Stream card skeletons */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass h-72 rounded-2xl border border-white/5 p-6 space-y-4 animate-pulse"
            >
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-dark-700 rounded-md" />
                <div className="h-5 w-16 bg-dark-700 rounded-full" />
              </div>
              <div className="space-y-1 mt-auto">
                <div className="h-3 w-24 bg-dark-700/60 rounded-md" />
                <div className="h-8 w-40 bg-dark-700 rounded-md" />
              </div>
              <div className="space-y-1">
                <div className="h-2.5 w-full bg-dark-700 rounded-full" />
              </div>
              <div className="h-10 w-full bg-dark-700 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
