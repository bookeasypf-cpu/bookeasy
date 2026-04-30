export default function MyRewardsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0C1B2A] via-[#132D46] to-[#0C1B2A]">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 animate-pulse">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white/10 mx-auto mb-4" />
          <div className="h-8 w-40 bg-white/10 rounded-lg mx-auto mb-2" />
          <div className="h-4 w-56 bg-white/5 rounded mx-auto" />
        </div>

        {/* Balance cards */}
        <div className="space-y-4 mb-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10" />
                  <div>
                    <div className="h-5 w-32 bg-white/10 rounded mb-1" />
                    <div className="h-3 w-20 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="h-8 w-16 bg-white/10 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-white/5 rounded-xl" />
                <div className="h-16 bg-white/5 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
